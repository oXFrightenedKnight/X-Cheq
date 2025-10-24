import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { auth } from "@clerk/nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const POST = async (req: NextRequest) => {
  //endpoint for asking a question to pdf file

  const body = await req.json();

  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = sendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // vectorize the message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pineconeIndex = pinecone.Index("x-cheq");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4); // 4 indicates how many closest results (pages) we want returned

  const prevMessage = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessage.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const result = streamText({
    model: openai("gpt-4o-mini"),
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
    onFinish: async ({ text }) => {
      await db.message.create({
        data: {
          text,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  // just returned a stream from here, now accept the context
  return result.toUIMessageStreamResponse();
};
