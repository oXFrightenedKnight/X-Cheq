"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const CURRENT_VERSION = process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION;

export default function SessionVersionSync() {
  console.log("session refresher run!");
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const storedVersion = localStorage.getItem("app-version");
    console.log("looked at deployment version");
    console.log("stored version:", storedVersion);

    // Deployment changed?
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app-version", CURRENT_VERSION!);
      console.log("deployment version changed!");
      console.log("new deployment version:", localStorage.getItem("app-version"));

      // Silent refresh – 1 API call only on new version
      (async () => {
        await getToken({ skipCache: true });
        await user.reload();
        console.log("refreshed data!");
      })();
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
}
