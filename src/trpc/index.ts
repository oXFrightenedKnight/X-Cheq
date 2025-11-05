import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { UTApi } from "uploadthing/server";
import { error } from "console";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? "unknown@user";
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
          email: email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  createStripeSession: privateProcedure
    .input(z.object({ plan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { plan } = input;

      const billingUrl = absoluteUrl("/dashboard/billing");

      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dbUser = await db.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const currentSubPlan = await getUserSubscriptionPlan();

      if (dbUser.stripeCustomerId && (currentSubPlan.isSubscribed || currentSubPlan.isCanceled)) {
        const stripeSession = await stripe.billingPortal.sessions
          .create({
            customer: dbUser.stripeCustomerId,
            return_url: billingUrl,
          })
          .catch((error) => {
            console.error("💥 Billing portal error:", error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
          });

        return { url: stripeSession.url };
      }

      const selectedPlan = PLANS.find((p) => p.slug === plan.toLowerCase());
      if (!selectedPlan) throw new TRPCError({ code: "BAD_REQUEST" });

      const stripeSession = await stripe.checkout.sessions
        .create({
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ["card"],
          mode: "subscription",
          billing_address_collection: "auto",
          line_items: [
            {
              price: selectedPlan.pricing.priceIds.test, // use production at the end when working in production
              quantity: 1,
            },
          ],
          customer: dbUser.stripeCustomerId ?? undefined,
          metadata: {
            userId: userId,
          },
        })
        .catch((error) => {
          console.error("🔥 Stripe session creation failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
        });
      return { url: stripeSession.url };
    }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
  getUserPlan: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscription = await getUserSubscriptionPlan();

    // normalize plan name to one we have defined in PLANS
    const planName = subscription?.name ?? "Free";

    const planConfig =
      PLANS.find((p) => p.name === planName) ?? PLANS.find((p) => p.name === "Free")!;

    return {
      // identity
      userId,
      // subscription status/plan
      planName,
      maxFiles: planConfig.maxFiles,
      maxFileSize: planConfig.maxFileSize,
    };
  }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) {
        console.error("🚫 No file found for key/user");
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return file;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id /* passing down the id of file that is supposed to be deleted and matching it with db */,
          userId /* matches user id. Adds security so that only the user that owns the file can delete it*/,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // delete from UploadThing storage first
      const utapi = new UTApi();
      await utapi.deleteFiles(file.key); // key is what uploadthing uses, not id

      await db.file.delete({
        where: {
          id: input.id, // deletes the file after checking all requirements
        },
      });

      return file;
    }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
