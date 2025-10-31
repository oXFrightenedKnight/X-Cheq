import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log("middleware start", req.nextUrl.pathname);
  if (isProtectedRoute(req)) {
    console.log("Protected route - checking auth", req.nextUrl.pathname);
    await auth.protect();
  }
  console.log("middleware end", req.nextUrl.pathname);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/dashboard/:path*",
    "/auth-callback",
    "/api/:path*",
  ],
};
