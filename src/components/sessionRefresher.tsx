"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const CURRENT_VERSION = process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION;

export default function SessionVersionSync() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const storedVersion = localStorage.getItem("app-version");

    // Deployment changed?
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app-version", CURRENT_VERSION!);

      // Silent refresh – 1 API call only on new version
      (async () => {
        await getToken({ skipCache: true });
        await user.reload();
      })();
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
}
