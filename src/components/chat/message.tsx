import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          // display the message dynamically using cn helper to display user message in blue on the right and ai on the left
          "justify-end": message.isUserMessage,
        })}
      >
        {/* Avatar wrapper + avatars */}
        <div
          className={cn("relative flex h-6 w-6 aspect-square items-center justify-center", {
            "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
            "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
            invisible: isNextMessageSamePerson,
          })}
        >
          {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
          )}
        </div>

        {/* Bubble column */}
        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          {/* Bubble itself */}
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-blue-600 text-white": message.isUserMessage,
              "bg-gray-200 text-gray-900": !message.isUserMessage,
              "rounded-br-none": !isNextMessageSamePerson && message.isUserMessage,
              "rounded-bl-none": !isNextMessageSamePerson && !message.isUserMessage,
            })}
          >
            {/* Markdown - can render formatted chatgpt responses that use #, ##, **, etc. to format text into bold, italic, etc. */}
            {typeof message.text === "string" ? (
              <div
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessage,
                })}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              message.text
            )}

            {/* Timestamp */}
            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !message.isUserMessage,
                  "text-blue-300": message.isUserMessage,
                })}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export default Message;
