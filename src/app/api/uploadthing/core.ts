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

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      console.log("userId:", userId);

      if (!userId) throw new Error("Unauthorized");

      return {
        userId: userId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.ufsUrl,
          uploadStatus: "PROCESSING",
        },
      });
      console.log("createdFile", createdFile);

      try {
        const response = await fetch(file.ufsUrl); // fetch the file from UploadThing's storage
        const blob = await response.blob(); // turns response into blob for parsing (LangChain friendly format)

        const loader = new PDFLoader(blob); // loads the PDF in LangChain format

        const PageLevelDocs = await loader.load(); // splits it into page level docs so each page is one text chunk with metadata

        const pagesAmt = PageLevelDocs.length;

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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
