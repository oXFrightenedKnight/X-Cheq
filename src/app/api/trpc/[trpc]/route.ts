import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc";
import { auth } from "@clerk/nextjs/server";

async function handler(req: Request) {
  const { userId } = await auth();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      userId,
    }),
  });
}
export { handler as GET, handler as POST };
