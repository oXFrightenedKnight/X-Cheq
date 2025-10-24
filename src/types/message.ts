import { AppRouter } from "@/app/trpc";
import { inferRouterOutputs } from "@trpc/server";
import { JSX } from "react";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"]; // if that type changes, this dynamic type will change with it.

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
