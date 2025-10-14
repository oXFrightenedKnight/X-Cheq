import "server-only";
import { auth } from "@clerk/nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { userId, sessionClaims } = await auth();
    const primaryEmail = sessionClaims?.primaryEmail as string;

    if (!userId || !primaryEmail) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: userId,
          email: primaryEmail,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(({ ctx }) => {
    // YOU STOPPED HERE / Destructuring context
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
