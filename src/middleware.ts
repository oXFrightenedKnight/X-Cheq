import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/api/uploadthing(.*)", "/api/webhooks/stripe(.*)"]);

const CURRENT_VERSION = process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION;

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;

  const res = NextResponse.next();
  const seen = req.cookies.get("x-app-version")?.value;

  if (CURRENT_VERSION && seen !== CURRENT_VERSION) {
    // mark new version so we don't loop forever
    res.cookies.set("x-app-version", CURRENT_VERSION, { path: "/" });

    // wipe Clerk cookies so the session is invalid
    res.cookies.delete("__session");
    res.cookies.delete("__client_uat");
    res.cookies.delete("__session_sig");

    // redirect to landing page
    return NextResponse.redirect(new URL("/", req.url), 308);
  }

  if (url.startsWith("/api/webhooks/stripe")) {
    console.log("srtipe webhook allowed");
    return;
  }
  if (url.startsWith("/api/trpc")) return;

  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
