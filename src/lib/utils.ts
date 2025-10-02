import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // If you have px-2 py-2 (padding-x, y), it can be merged into just p-2 (padding-2)
  return twMerge(clsx(inputs));
}
