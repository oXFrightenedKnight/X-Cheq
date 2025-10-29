import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req) && !userId) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/sign-in" },
    });
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/trpc/:path*"],
};
