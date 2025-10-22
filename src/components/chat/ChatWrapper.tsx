"use client";

import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";

interface ChatWrapperProps {
  fileId: string;
}

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (query) => {
        const data = query.state.data;
        const status = query.state.data?.status; // prefix everything with query.state
        return status === "SUCCESS" || status === "FAILED" ? false : 500;
      },
    }
  );

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin"></Loader2>
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">We&apos;re preparing your PDF</p>
          </div>
        </div>
        <ChatInput isDisabled></ChatInput>
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin"></Loader2>
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long</p>
          </div>
        </div>
        <ChatInput isDisabled></ChatInput>
      </div>
    );

  return (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zince-200 flex-col justify-between gap-2">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <Messages></Messages>
      </div>

      <ChatInput></ChatInput>
    </div>
  );
};

export default ChatWrapper;
