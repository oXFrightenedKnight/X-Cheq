import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SessionVersionSync from "@/components/sessionRefresher";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/auth-callback?origin=/dashboard");
  }

  return (
    <>
      <SessionVersionSync></SessionVersionSync>
      {children}
    </>
  );
}
