"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import Link from "next/link";
import { useState } from "react";
import { CoinIcon } from "@/components/icons";
import * as Coin from "@/server/app/coin";

const presets = [10, 50, 100] as const;

export const TipButton = ({ writer, signedIn }: TipButton.Props) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tip, isPending] = useAsyncAction(async (amount: number) => {
    setError(null);
    const result = await Coin.tip({ to: writer, amount });
    if (!result.success) {
      setError("Not enough coins for that tip.");
      return;
    }
    setDone(amount);
    setOpen(false);
  });

  if (!signedIn)
    return (
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-medium font-subtitle text-primary text-sm transition hover:bg-primary/15"
      >
        <CoinIcon className="size-4" />
        Tip coins
      </Link>
    );

  if (done !== null)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-4 py-2 font-medium font-subtitle text-success text-sm">
        <CoinIcon className="size-4" />
        Tipped {done}!
      </span>
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-medium font-subtitle text-primary text-sm transition hover:bg-primary/15"
      >
        <CoinIcon className="size-4" />
        Tip coins
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-white/10 bg-background-rich p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)]">
            <p className="mb-2 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
              Send a tip
            </p>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={isPending}
                  onClick={() => void tip(amount)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border border-white/10 py-2 font-medium font-subtitle text-foreground text-sm transition hover:border-primary/40 hover:text-primary disabled:opacity-50",
                  )}
                >
                  <CoinIcon className="size-3.5" />
                  {amount}
                </button>
              ))}
            </div>
            {error ? (
              <p className="mt-2 font-subtitle text-error text-xs">{error}</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};

export namespace TipButton {
  export type Props = {
    writer: string;
    signedIn: boolean;
  };
}
