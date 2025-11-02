import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UpgradeButton from "@/components/UpgradeButton";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const { userId } = await auth();

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: PLANS.find((p) => p.slug === "free")!.maxFiles,
      features: [
        {
          text: "2MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "100 messages limit",
          footnote: "The maximum number of messages you can send to AI monthly.",
        },
        {
          text: "10 pages per PDF",
          footnote: "The maximum number of pages per PDF",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
          negative: true,
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Advanced",
      tagline: "One fits all.",
      quota: PLANS.find((p) => p.slug === "advanced")!.maxFiles,
      features: [
        {
          text: "8MB max file size",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "500 messages limit",
          footnote: "The maximum number of messages you can send to AI monthly.",
        },
        {
          text: "50 pages per PDF",
          footnote: "The maximum number of pages per PDF",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For larger projects with bigger needs.",
      quota: PLANS.find((p) => p.slug === "pro")!.maxFiles,
      features: [
        {
          text: "32MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "2000 messages limit",
          footnote: "The maximum number of messages you can send to AI monthly.",
        },
        {
          text: "300 pages per PDF",
          footnote: "The maximum number of pages per PDF",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
        },
        {
          text: "Priority support",
        },
      ],
    },
  ];

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl ">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just exploring or need more, we&apos;ve got different plans for
            every need.
          </p>
        </div>

        <div className="pd-12 grid grid-cols-1 gap-10 lg:grid-cols-3 items-stretch">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price = PLANS.find((p) => p.slug === plan.toLowerCase())?.pricing.amount || 0;
              return (
                <div
                  key={plan}
                  className={cn(
                    "relative flex flex-col justify-between rounded-2xl bg-white shadow-lg p-6 min-h-[640px]",
                    {
                      "border-2 border-blue-800 shadow-blue-200": plan === "Pro",
                      "border-2 border-blue-500 shadow-blue-200": plan === "Advanced",
                      "border border-gray-200": plan != "Pro" && plan != "Advanced",
                    }
                  )}
                >
                  {plan === "Advanced" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade Now
                    </div>
                  )}
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-800 to-cyan-800 px-3 py-2 text-sm font-medium text-white">
                      Upgrade Now
                    </div>
                  )}

                  <div className="grow flex flex-col justify-between">
                    {/* Upper content */}
                    <div>
                      <h3 className="my-3 text-center font-display text-3xl font-bold">{plan}</h3>
                      <p className="text-gray-500 text-center">{tagline}</p>
                    </div>

                    {/* Lower content */}
                    <div className="mt-auto text-center">
                      <p className="my-5 font-display text-5xl font-semibold">${price}</p>
                      <p className="text-gray-500">per month</p>
                    </div>
                  </div>

                  <div className="flex py-3 items-center justify-center border-b border-t border-gray-200 bg-gray-50 rounded-2xl mt-5">
                    <div className="flex items-center space-x-1">
                      <p>Store up to {quota} files at a time</p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5 mr-1.5">
                          <HelpCircle className="h-4 w-4 text-zinc-500"></HelpCircle>
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          The number of PDF files that can be stored at a time.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center ">
                    <ul className="my-10 space-y-5 px-8">
                      {features.map(({ text, negative, footnote }) => {
                        return (
                          <li key={text} className="flex space-x-5">
                            <div className="flex-shrink-0">
                              {negative ? (
                                <Minus className="h-6 w-6 text-gray-300"></Minus>
                              ) : (
                                <Check className="h-6 w-6 text-blue-500"></Check>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {footnote ? (
                                <div className="flex items-center space-x-1">
                                  <p
                                    className={cn(
                                      "text-gray-600 text-sm leading-tight flex items-center gap-1",
                                      {
                                        "text-gray-400": negative,
                                      }
                                    )}
                                  >
                                    {text}
                                  </p>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                      <HelpCircle className="h-4 w-4 text-zinc-500"></HelpCircle>
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">{footnote}</TooltipContent>
                                  </Tooltip>
                                </div>
                              ) : (
                                <p
                                  className={cn("text-gray-600", {
                                    "text-gray-400": negative,
                                  })}
                                >
                                  {text}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="p-5">
                    {plan === "Free" ? (
                      <Link
                        href={userId ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {userId ? "Upgrade Now" : "Sign Up"}
                        <ArrowRight className="h-5 w-5 ml-1.5"></ArrowRight>
                      </Link>
                    ) : userId ? (
                      <UpgradeButton plan={plan}></UpgradeButton>
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {userId ? "Upgrade Now" : "Sign Up"}
                        <ArrowRight className="h-5 w-5 ml-1.5"></ArrowRight>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
