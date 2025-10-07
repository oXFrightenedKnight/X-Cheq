import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <div
          className="mx-auto mb-4 flex max-w-fit items-center justify-center 
      space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white 
      px-7 py-2 shadow-md backdrop-blur transition-all hover:border-white 
      hover:bg-gray-300"
        >
          <p className="text-sm font-semibold text-gray-700">Check X-Cheq Now</p>
        </div>
        <h1 className="max-w-4xl text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold">
          Get started with <span className="text-blue-600"> X-Cheq AI.</span> No more strain.
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          New Gen X-Cheq allows you to instantly get answers from your docs.
        </p>

        <Link
          className={buttonVariants({
            size: "lg",
            className: "mt-5",
          })}
          href="/dashboard"
          target="_blank"
        >
          Try it now <ArrowRight className="ml-2 h-5 w-5"></ArrowRight>
        </Link>
      </MaxWidthWrapper>

      {/* value proposition section */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div className="relative left-[calc(50% - 11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
        </div>
      </div>
    </>
  );
}
