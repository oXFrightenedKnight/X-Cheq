"use client";
import { toast } from "sonner";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const BillingForm = ({
  subscriptionPlan,
}: {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}) => {
  const { mutate: createStripeSession, isPending } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
      if (!url) {
        toast.error("Something went wrong!");
      }
    },
  });

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();

          if (!subscriptionPlan.name) return toast.error("No plan found");
          createStripeSession({ plan: subscriptionPlan.name });
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on a <strong>{subscriptionPlan.name ?? "Free"}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isPending ? <Loader2 className="mr-4 h-4 w-4 animate-spin"></Loader2> : null}
              {subscriptionPlan.isSubscribed ? "Manage Subscription" : "Upgrade Now"}
            </Button>

            {subscriptionPlan.isSubscribed && (
              <p className="text-xs font-medium">
                {subscriptionPlan.isOnGracePeriod
                  ? "Your plan will be canceled on "
                  : "Your plan renews on "}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "MMMM d, yyyy")}.
              </p>
            )}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};

export default BillingForm;
