"use client";

// It manages the chat logic for sending and streaming messages to the
// server — handling input, optimistic updates, loading state, and syncing message data across the app.

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

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // step 1 - cancel any outgoing refetches
      await utils.getFileMessages.cancel();

      // step 2
      const prevMessages = utils.getFileMessages.getInfiniteData();

      // step 3 - optimistically insert new value
      utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }
        // clone new pages
        let newPages = [...old.pages];

        let latestPage = newPages[0]!;

        latestPage.messages = [
          // take all messages that were previously in the chat and move them up to put our new message up
          {
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            text: message,
            isUserMessage: true,
          },
          ...latestPage.messages, // take all messages that were previously in the chat and move them up to put our new message up
        ];
        newPages[0] = latestPage;

        return {
          ...old,
          pages: newPages,
        };
      });
      setIsLoading(true);

      return {
        prevMessages: prevMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      // ALL of this code below basically makes the ai to stream the response from the chunks we get from api like in real time
      setIsLoading(false);
      if (!stream) {
        return toast.error("Error sending question! Please try again or refresh the page.");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumalted response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to message
        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          let isAiResponseCreated = old.pages.some(
            (page) => page.messages.some((message) => message.id === "ai-response") // check for each chunk that we add our message to if the
            // message already exists and if true,
            // then we will not create another one
          );
          let updatedPages = old.pages.map((page) => {
            if (page === old.pages[0]) {
              let updatedMessages;
              if (!isAiResponseCreated) {
                updatedMessages = [
                  {
                    createdAt: new Date().toISOString(),
                    id: "ai-response",
                    text: accResponse,
                    isUserMessage: false,
                  },
                  ...page.messages,
                ];
              } else {
                updatedMessages = page.messages.map((message) => {
                  if (message.id === "ai-response") {
                    return { ...message, text: accResponse };
                  }
                  return message;
                });
              }
              return {
                ...page,
                messages: updatedMessages,
              };
            }

            return page;
          });
          return { ...old, pages: updatedPages };
        });
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData({ fileId }, { messages: context?.prevMessages ?? [] });
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
