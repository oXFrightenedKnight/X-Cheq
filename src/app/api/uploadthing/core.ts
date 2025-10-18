// the middleware in this file will run when someone requests file from the client

// 1. User uploads the file
// 2. File is passed to middleware
// 3. Middleware checks if the user is authenticated
// 4. If true, upload file to server
// 5. onUploadComplete - stores quota and custom logic

import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/db";

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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
