"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") ?? "/dashboard";

  const { data, isSuccess, isLoading, isError } = trpc.authCallback.useQuery();
  useEffect(() => {
    if (isSuccess && data?.success) {
      // user synced to db
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [isSuccess, data, origin, router]);

  {
    /* todo: implement error logic but with the new trpc syntax */
  }

  return null;
}
