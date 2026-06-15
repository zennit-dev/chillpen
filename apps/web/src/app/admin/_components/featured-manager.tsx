"use client";

import { Switch } from "@zenncore/web/components/switch";
import { useState } from "react";
import type * as Universe from "@/server/app/universe";
import * as UniverseApp from "@/server/app/universe";

export const FeaturedManager = ({ universes }: FeaturedManager.Props) => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      universes.map((universe) => [universe.id, universe.featuredEnabled]),
    ),
  );

  const toggle = async (universe: Universe.Card, next: boolean) => {
    setEnabled((current) => ({ ...current, [universe.id]: next }));
    const result = await UniverseApp.toggleFeatured({
      universe: universe.id,
      enabled: next,
      order: universe.featuredOrder,
      hook: universe.featuredHook ?? undefined,
    });
    if (!result.success)
      setEnabled((current) => ({ ...current, [universe.id]: !next }));
  };

  return (
    <section>
      <h2 className="mb-1 font-display font-medium text-foreground text-xl">
        Featured slider
      </h2>
      <p className="mb-4 font-body text-foreground-dimmed text-sm">
        Toggle which universes appear in the homepage hero.
      </p>
      <div className="divide-y divide-white/8 overflow-hidden rounded-[8px] border border-white/8 bg-background-rich">
        {universes.map((universe) => (
          <div key={universe.id} className="flex items-center gap-4 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-medium text-foreground text-sm">
                {universe.title}
              </p>
              <p className="truncate font-subtitle text-foreground-dimmed text-xs">
                {universe.featuredHook ?? universe.author ?? "—"}
              </p>
            </div>
            <Switch
              checked={enabled[universe.id] ?? false}
              onCheckedChange={(next) => void toggle(universe, next)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export namespace FeaturedManager {
  export type Props = {
    universes: Universe.Card[];
  };
}
