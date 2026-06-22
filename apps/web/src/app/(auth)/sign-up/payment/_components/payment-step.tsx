"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useRouter } from "next/navigation";
import * as Subscription from "@/server/app/subscription";

export const PaymentStep = () => {
  const router = useRouter();

  // Card capture happens on Stripe's hosted checkout (PCI-safe) which also
  // arms the 30-day trial. If Stripe isn't configured (e.g. preview), the trial
  // is already open from sign-up, so we just walk the writer into the platform.
  const [addPayment, isAdding] = useAsyncAction(async () => {
    const result = await Subscription.checkout();
    if (result.success) {
      window.location.href = result.data.url;
      return;
    }
    router.push("/discover");
  });

  const [skip, isSkipping] = useAsyncAction(async () => {
    await Subscription.startTrial();
    router.push("/discover");
  });

  return (
    <div className="space-y-3">
      <Button
        color="primary"
        disabled={isAdding || isSkipping}
        onClick={() => void addPayment()}
        className="w-full"
      >
        Add payment & start trial
      </Button>
      <button
        type="button"
        disabled={isAdding || isSkipping}
        onClick={() => void skip()}
        className="w-full font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground disabled:opacity-50"
      >
        Start trial without a card
      </button>
      <p className="text-center font-subtitle text-2xs text-foreground-dimmed">
        Secured by Stripe · Cancel anytime
      </p>
    </div>
  );
};
