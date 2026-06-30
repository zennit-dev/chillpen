"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Subscription from "@/server/app/subscription";

export const PaymentStep = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Card capture happens on Stripe's hosted checkout (PCI-safe) which also
  // arms the 30-day trial. If Stripe isn't configured (e.g. preview), the trial
  // is already open from sign-up, so we surface a clear path forward instead of
  // failing silently.
  const [addPayment, isAdding] = useAsyncAction(async () => {
    setError(null);
    const result = await Subscription.checkout();
    if (result.success) {
      window.location.href = result.data.url;
      return;
    }
    setError(
      "We couldn't open secure checkout right now. Your 30-day free trial is already active — you can add a card later from Settings.",
    );
  });

  const [skip, isSkipping] = useAsyncAction(async () => {
    await Subscription.startTrial();
    router.push("/discover");
  });

  return (
    <div className="space-y-3">
      {error ? (
        <div className="space-y-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2.5">
          <p className="font-subtitle text-foreground-rich text-sm">{error}</p>
          <Button
            color="primary"
            variant="soft"
            onClick={() => router.push("/discover")}
            className="w-full"
          >
            Continue to chillpen
          </Button>
        </div>
      ) : null}
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
