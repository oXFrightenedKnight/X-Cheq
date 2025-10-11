"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") ?? "/dashboard";

  const { data, isSuccess, isLoading, isError, error } = trpc.authCallback.useQuery(undefined, {
    retry: (failureCount, err) => {
      const code = (err as any).data?.code;
      if (code === "UNAUTHORIZED") return false;
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess && data?.success) {
      // user synced to db
      router.push("/dashboard");
    }
  }, [isSuccess, data, origin, router]);

  useEffect(() => {
    if (!isError || !error) return;
    const code = (error as any).data?.code;
    if (code === "UNAUTHORIZED") {
      router.push("/sign-in");
    }
  }, [isError, error, origin]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 animate-spin text-zinc-800"></Loader2>
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically</p>
      </div>
    </div>
  );
}
