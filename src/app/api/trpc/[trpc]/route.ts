import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc";

function handler(req: Request) {
  console.log("🛰️ TRPC request on server:", req.url);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}
export { handler as GET, handler as POST };
