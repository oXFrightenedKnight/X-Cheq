// the middleware in this file will run when someone requests file from the client

// 1. User uploads the file
// 2. File is passed to middleware
// 3. Middleware checks if the user is authenticated
// 4. If true, upload file to server
// 5. onUploadComplete - stores quota and custom logic

import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/db";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    pdf: {
      maxFileSize: "2MB",
      maxFileCount: 2,
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
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
