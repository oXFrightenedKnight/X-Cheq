import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  const primaryEmail = sessionClaims?.primaryEmail as string;

  if (!userId) {
    redirect("/auth-callback?origin=dashboard");
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    redirect("/auth-callback?origin=dashboard");
  }

  const subscriptionPlan = await getUserSubscriptionPlan();
  const subscriptionPlanName = subscriptionPlan.name ?? "Free";

  return <Dashboard subscriptionPlanName={subscriptionPlanName}></Dashboard>;
}
