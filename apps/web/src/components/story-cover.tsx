"use client";

import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import type { MouseEvent } from "react";
import { useRef } from "react";
import { Chip } from "@/components/ui";

/**
 * Cover that morphs into the story page hero via the View Transitions API.
 * The shared `view-transition-name` is assigned to the *clicked* cover only,
 * right before navigation — so the same universe appearing in several shelves
 * never produces a duplicate name.
 */
export const StoryCover = ({ slug, cover, title, genre }: StoryCover.Props) => {
  const router = useTransitionRouter();
  const frame = useRef<HTMLDivElement>(null);

  const open = (event: MouseEvent) => {
    event.preventDefault();
    if (frame.current) frame.current.style.viewTransitionName = "story-cover";
    router.push(`/story/${slug}`);
  };

  return (
    // biome-ignore lint/a11y/useValidAnchor: progressive-enhancement link with a real href
    <a
      href={`/story/${slug}`}
      onClick={open}
      className="block overflow-hidden rounded-t-md"
    >
      <div ref={frame} className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 60vw, 280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-rich via-background-rich/20 to-transparent" />
        {genre ? (
          <div className="absolute top-2.5 left-2.5">
            <Chip>{genre}</Chip>
          </div>
        ) : null}
      </div>
    </a>
  );
};

export namespace StoryCover {
  export type Props = {
    slug: string;
    cover: string;
    title: string;
    genre?: string;
  };
}
