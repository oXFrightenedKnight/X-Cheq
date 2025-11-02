"use client";
// It manages the chat logic for sending and streaming messages to the
// server — handling input, optimistic updates, loading state, and syncing message data across the app.

// sends message to backend from user, optimistically updates ui to display it in real time, streams ai
// response and extracts the text from raw chuncks, updates messages in real time, handles errors if it fails, and wraps all chat UI.
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, ReactNode, useRef, useState } from "react";
import { toast } from "sonner";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};
export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});
interface Props {
  fileId: string;
  children: ReactNode;
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const backupMessage = useRef("");

  function getNextRenewalDate(): string {
    const now = new Date();
    const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const month = (now.getMonth() + 1) % 12;

    const nextDate = new Date(year, month, 1);

    return nextDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      if (response.status === 402) {
        const renewalDate = getNextRenewalDate();
        toast.error(
          `You have exceeded your monthly message limit. You can continue on ${renewalDate} or upgrade to get more messages.`
        );
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");
      await utils.getFileMessages.cancel({ fileId, limit: INFINITE_QUERY_LIMIT });
      const previousData = utils.getFileMessages.getInfiniteData({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      });
      utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
        if (!old) {
          return {
            pages: [
              {
                messages: [
                  {
                    createdAt: new Date().toISOString(),
                    id: crypto.randomUUID(),
                    text: message,
                    isUserMessage: true,
                  },
                ],
              },
            ],
            pageParams: [],
          };
        }
        const [firstPage, ...restPages] = old.pages;
        const updatedFirstPage = {
          ...firstPage,
          messages: [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...firstPage.messages,
          ],
        };
        return {
          ...old,
          pages: [updatedFirstPage, ...restPages],
        };
      });
      setIsLoading(true);
      return {
        previousData,
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);
      if (!stream) {
        return toast.error("Error sending question! Please try again or refresh the page.");
      }
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      let buffer = "";
      let isDone = false;
      const upsertStreamingMessage = (content: string) => {
        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) {
            return {
              pages: [
                {
                  messages: [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: content,
                      isUserMessage: false,
                    },
                  ],
                },
              ],
              pageParams: [],
            };
          }
          const [firstPage, ...restPages] = old.pages;
          const aiMessageExists = firstPage.messages.some(
            (message) => message.id === "ai-response"
          );
          const updatedFirstPage = {
            ...firstPage,
            messages: aiMessageExists
              ? firstPage.messages.map((message) =>
                  message.id === "ai-response" ? { ...message, text: content } : message
                )
              : [
                  {
                    createdAt: new Date().toISOString(),
                    id: "ai-response",
                    text: content,
                    isUserMessage: false,
                  },
                  ...firstPage.messages,
                ],
          };
          return {
            ...old,
            pages: [updatedFirstPage, ...restPages],
          };
        });
      };
      while (!isDone) {
        const { value, done: doneReading } = await reader.read();
        isDone = doneReading;
        if (!value) {
          continue;
        }
        buffer += decoder.decode(value, { stream: !doneReading });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) {
            continue;
          }
          const payload = trimmed.replace(/^data:\s*/, "");
          if (!payload || payload === "[DONE]") {
            isDone = payload === "[DONE]" ? true : isDone;
            continue;
          }
          try {
            const event = JSON.parse(payload);
            if (event.type === "text-delta" && typeof event.delta === "string") {
              accumulatedResponse += event.delta;
              upsertStreamingMessage(accumulatedResponse);
            } else if (event.type === "text") {
              const text = typeof event.text === "string" ? event.text : "";
              accumulatedResponse += text;
              upsertStreamingMessage(accumulatedResponse);
            } else if (event.type === "error") {
              toast.error("The assistant failed to respond. Please try again.");
              isDone = true;
              break;
            } else if (event.type === "finish") {
              isDone = true;
              break;
            }
          } catch (error) {
            console.error("Failed to parse streaming chunk", error);
          }
        }
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      setIsLoading(false);
      if (context?.previousData) {
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          context.previousData
        );
      }
      toast.error("Something went wrong while sending your message.");
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId });
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => sendMessage({ message });
  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
