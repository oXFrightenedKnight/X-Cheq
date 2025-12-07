import { type Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const err = error as Error & { digest?: string };
  await fetch("http://localhost:3000/api/uploadthing", {
    method: "GET",
    body: JSON.stringify({
      message: err.message,
      request,
      context,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
