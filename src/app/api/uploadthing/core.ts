// the middleware in this file will run when someone requests file from the client

// 1. User uploads the file
// 2. File is passed to middleware
// 3. Middleware checks if the user is authenticated
// 4. If true, upload file to server
// 5. onUploadComplete - stores quota and custom logic

import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/db";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

const middleware = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return {
    userId: userId,
    subscriptionPlan,
  };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExist) return;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const response = await fetch(file.url); // fetch the file from UploadThing's storage
    const blob = await response.blob(); // turns response into blob for parsing (LangChain friendly format)

    const loader = new PDFLoader(blob); // loads the PDF in LangChain format

    const PageLevelDocs = await loader.load(); // splits it into page level docs so each page is one text chunk with metadata

    const pagesAmt = PageLevelDocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.maxPagesPerFile;
    const isAdvancedExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Advanced")!.maxPagesPerFile;
    const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.maxPagesPerFile;

    const isSubscribedToAdvanced = subscriptionPlan.name === "Advanced";
    const isSubscribedToPro = subscriptionPlan.name === "Pro";

    // Check if page limit is exceeded
    if (
      (isSubscribedToPro && isProExceeded) ||
      (isSubscribedToAdvanced && isAdvancedExceeded) ||
      (!isSubscribed && isFreeExceeded)
    ) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });

      const planName = subscriptionPlan.name || "Free";

      const utapi = new UTApi();
      await utapi.deleteFiles(file.key); // key is what uploadthing uses, not id

      await db.file.delete({
        where: {
          id: createdFile.id, // deletes the file after checking all requirements
        },
      });

      return { ok: false, reason: "PAGE_LIMIT_EXCEEDED", pagesAmt, planName };
    }

    const currentFileCount = await db.file.count({
      where: { userId: metadata.userId },
    });

    // Check if user plan supports more files
    if (currentFileCount > subscriptionPlan.maxFiles!) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });

      const planName = subscriptionPlan.name || "Free";
      const planMaxFiles = subscriptionPlan.maxFiles;

      const utapi = new UTApi();
      await utapi.deleteFiles(file.key); // key is what uploadthing uses, not id

      await db.file.delete({
        where: {
          id: createdFile.id, // deletes the file after checking all requirements
        },
      });
      return { ok: false, reason: "MAX_FILE_LIMIT_EXCEEDED", pagesAmt, planName, planMaxFiles };
    }

    // vectorize + index entire document

    const pineconeIndex = pinecone.Index("x-cheq"); // get pinecone index you created

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY, // create openai embedding generator
    });

    // sends every page through openai embedding's api
    // generates numeric vectors
    // inserts them into your pinecone index, namespaced by the file’s DB ID
    await PineconeStore.fromDocuments(PageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS", // if successful, mark done
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  freePlanUploader: f({
    pdf: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  advancedPlanUploader: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
