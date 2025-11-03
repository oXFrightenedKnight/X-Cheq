import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getUserSubscriptionPlan() {
  const { userId } = await auth();

  if (!userId) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.pricing.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    try {
      const stripePlan = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
      console.log("Stripe subscription:", JSON.stringify(stripePlan, null, 2));
      isCanceled =
        stripePlan.cancel_at_period_end === true ||
        stripePlan.cancellation_details?.reason === "cancellation_requested" ||
        stripePlan.status !== "active";

      console.log("isCanceled value:", isCanceled);
    } catch (error) {
      console.error("Error retrieving subscription:", error);
    }
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
