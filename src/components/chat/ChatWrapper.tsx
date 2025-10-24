"use client";

import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { trpc } from "@/app/_trpc/client";
import { ChevronLeft, Loader2, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

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

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500"></XCircle>
            <h3 className="font-semibold text-xl">Your PDF is too big</h3>
            <p className="text-zinc-500 text-sm">
              Your <span className="font-medium">Free</span> plan currently supports up to 2MB file
              size
            </p>
            <Link
              href="/pricing"
              className={buttonVariants({
                className: "mt-4",
              })}
            >
              <Zap className="h-3 w-3 mr-1.5"></Zap>Upgrade Plan
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "ghost",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5"></ChevronLeft>Back to Homepage
            </Link>
          </div>
        </div>
        <ChatInput isDisabled></ChatInput>
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zince-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages></Messages>
        </div>

        <ChatInput></ChatInput>
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
