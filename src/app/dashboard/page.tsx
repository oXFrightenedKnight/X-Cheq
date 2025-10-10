import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/auth-callback?origin=dashboard");
  }

  const primaryEmail = sessionClaims?.primaryEmail as string;

  return <div>{primaryEmail}</div>;
}
