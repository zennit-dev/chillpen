"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import Link from "next/link";
import * as Subscription from "@/server/app/subscription";

export const SubscribeButton = ({ signedIn }: SubscribeButton.Props) => {
  const [start, isPending] = useAsyncAction(async () => {
    const result = await Subscription.checkout();
    if (result.success) window.location.href = result.data.url;
  });

  if (!signedIn)
    return (
      <Link
        href="/sign-up"
        className="block w-full rounded-[4px] bg-primary px-6 py-3 text-center font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
      >
        Start your 30-day free trial
      </Link>
    );

  return (
    <Button
      color="primary"
      disabled={isPending}
      onClick={() => void start()}
      className="w-full"
    >
      Start 30-day free trial
    </Button>
  );
};

export namespace SubscribeButton {
  export type Props = {
    signedIn: boolean;
  };
}
