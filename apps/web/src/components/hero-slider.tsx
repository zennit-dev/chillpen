"use client";

import { cn } from "@zenncore/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlayIcon, StarIcon } from "@/components/icons";
import { Chip, formatCount } from "@/components/ui";

export type HeroSlide = {
  slug: string;
  title: string;
  hook: string;
  cover: string;
  genre: string;
  readCount: number;
  forkCount: number;
  rating: number;
};

const ADVANCE_MS = 7000;

export const HeroSlider = ({ slides }: HeroSlider.Props) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ADVANCE_MS,
    );
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pause-on-hover is a decorative enhancement, not a control
    <section
      className="relative h-[78vh] min-h-[520px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, position) => (
        <div
          key={slide.slug}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            position === index
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <Image
            src={slide.cover}
            alt={slide.title}
            fill
            priority={position === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 sm:px-6 lg:pb-28">
        <div className="max-w-xl">
          <Chip active className="mb-4">
            {slides[index]?.genre}
          </Chip>
          <h1 className="font-display font-semibold text-5xl text-foreground leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {slides[index]?.title}
          </h1>
          <p className="mt-4 max-w-md font-body text-base text-foreground-rich leading-relaxed sm:text-lg">
            {slides[index]?.hook}
          </p>
          <div className="mt-5 flex items-center gap-4 font-subtitle text-foreground-dimmed text-sm">
            <span className="inline-flex items-center gap-1 text-primary">
              <StarIcon className="size-4 fill-current" />
              <span className="font-medium">
                {((slides[index]?.rating ?? 0) / 10).toFixed(1)}
              </span>
            </span>
            <span>{formatCount(slides[index]?.readCount ?? 0)} reads</span>
            <span>{formatCount(slides[index]?.forkCount ?? 0)} branches</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/story/${slides[index]?.slug}`}
              className="inline-flex items-center gap-2 rounded-[4px] bg-foreground px-7 py-2.5 font-medium text-background text-sm transition hover:bg-foreground/90"
            >
              <PlayIcon className="size-4" />
              Read
            </Link>
            <Link
              href={`/story/${slides[index]?.slug}/map`}
              className="glass inline-flex items-center gap-2 rounded-[4px] px-6 py-2.5 font-medium text-foreground text-sm transition hover:border-primary/40"
            >
              Explore Universe
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, position) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Go to ${slide.title}`}
            onClick={() => setIndex(position)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              position === index
                ? "w-8 bg-primary"
                : "w-4 bg-white/30 hover:bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
};

export namespace HeroSlider {
  export type Props = {
    slides: HeroSlide[];
  };
}
