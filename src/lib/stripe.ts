import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function getUserSubscriptionPlan() {
  const { userId } = await auth();
  if (!userId) return noPlan();

  const dbUser = await db.user.findFirst({
    where: { id: userId },
  });
  if (!dbUser) return noPlan();

  const stillActive =
    !!dbUser.stripeCurrentPeriodEnd && dbUser.stripeCurrentPeriodEnd.getTime() > Date.now();

  if (!stillActive) return noPlan();

  let stripeSubscription = null;
  let isCanceled = false;

  if (dbUser.stripeSubscriptionId) {
    stripeSubscription = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);

    isCanceled = stripeSubscription.cancel_at_period_end === true;
  }

  const plan = PLANS.find((p) => p.pricing.priceIds.test === dbUser.stripePriceId) ?? PLANS[0];

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCustomerId: dbUser.stripeCustomerId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,

    // TRUTH BOMBS:
    isSubscribed: true, // they paid so yes
    isCanceled, // cancellation flag from Stripe
    isActive: !isCanceled, // actively renewing or not
    isOnGracePeriod: isCanceled && stillActive, // canceled but still active until end
  };
}

function noPlan() {
  const base = PLANS[0];
  return {
    ...base,
    stripeSubscriptionId: null,
    stripeCustomerId: null,
    stripeCurrentPeriodEnd: null,
    isSubscribed: false,
    isCanceled: false,
    isActive: false,
    isOnGracePeriod: false,
  };
}
