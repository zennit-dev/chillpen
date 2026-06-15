"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import type { MouseEvent } from "react";
import { useState } from "react";
import { HeartIcon } from "@/components/icons";
import * as Save from "@/server/app/save";

export const SaveButton = ({
  universe,
  saved = false,
  className,
}: SaveButton.Props) => {
  const [active, setActive] = useState(saved);

  const [toggle, isPending] = useAsyncAction(async () => {
    setActive((current) => !current);
    const result = await Save.toggle({
      targetType: "universe",
      target: universe,
    });
    if (!result.success) setActive((current) => !current);
  });

  const handle = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void toggle();
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      aria-label={active ? "Remove from saved" : "Save story"}
      aria-pressed={active}
      className={cn(
        "flex size-8 items-center justify-center rounded-full border border-white/15 bg-background/55 text-foreground backdrop-blur transition hover:border-primary/50 hover:text-primary",
        active && "border-primary/50 text-primary",
        className,
      )}
    >
      <HeartIcon className={cn("size-4", active && "fill-current")} />
    </button>
  );
};

export namespace SaveButton {
  export type Props = {
    universe: string;
    saved?: boolean;
    className?: string;
  };
}
