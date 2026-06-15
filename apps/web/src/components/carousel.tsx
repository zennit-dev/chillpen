"use client";

import { cn } from "@zenncore/utils";
import type { ReactNode } from "react";
import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

/**
 * Netflix-style horizontal shelf. The @zenncore Carousel is an unimplemented
 * placeholder, so this is the in-app row: snap track, edge-peek, hover paging
 * chevrons, touch-swipeable. Cards (children) set their own width + snap-start.
 */
export const Carousel = ({ children, className }: Carousel.Props) => {
  const track = useRef<HTMLDivElement>(null);

  const page = (direction: 1 | -1) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("group/row relative", className)}>
      <Arrow side="left" onClick={() => page(-1)} />
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {children}
      </div>
      <Arrow side="right" onClick={() => page(1)} />
    </div>
  );
};

export namespace Carousel {
  export type Props = {
    children: ReactNode;
    className?: string;
  };
}

const Arrow = ({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={side === "left" ? "Scroll back" : "Scroll forward"}
    onClick={onClick}
    className={cn(
      "absolute top-0 bottom-1 z-20 hidden w-12 items-center justify-center bg-gradient-to-r from-background to-transparent text-foreground opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 md:flex",
      side === "left"
        ? "left-0 rounded-l-md"
        : "right-0 rotate-180 rounded-l-md",
    )}
  >
    <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-background-rich/70 backdrop-blur transition hover:border-primary/40 hover:bg-background-rich">
      {side === "left" ? (
        <ChevronLeftIcon className="size-5" />
      ) : (
        <ChevronRightIcon className="size-5 rotate-180" />
      )}
    </span>
  </button>
);
