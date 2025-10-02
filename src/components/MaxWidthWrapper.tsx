import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MaxWidthWrapper = ({ className, children }: { className?: string; children: ReactNode }) => {
  return (
    // cn allows you to merge deafult and custom styles without overriding it
    <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;

// The purpose is to reuse this wrapper so that spacing on the left and right
// sides of your pages stays consistent.

// The classname can be modified for every specific MaxWidthWrapper to make
// it more reusable
