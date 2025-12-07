// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { our2FileRouter } from "./core2";

export const { GET, POST } = createRouteHandler({
  router: our2FileRouter,
});

// Forces Node.js runtime + no caching nonsense
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";
