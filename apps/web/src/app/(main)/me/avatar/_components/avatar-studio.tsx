"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CheckIcon, CoinIcon } from "@/components/icons";
import { RarityTag } from "@/components/ui";
import * as Cosmetic from "@/server/app/cosmetic";

const rarityGradient = {
  common: "from-white/10 to-white/5",
  rare: "from-info/30 to-info/5",
  legendary: "from-primary/40 to-primary/10",
} as const;

export const AvatarStudio = ({ coins, shop, owned }: AvatarStudio.Props) => {
  const router = useRouter();
  const ownedIds = new Set(owned.map((entry) => entry.cosmeticId));

  const [buy, buying] = useAsyncAction(async (id: string) => {
    const result = await Cosmetic.purchase({ cosmetic: id });
    if (result.success) router.refresh();
  });
  const [equip, equipping] = useAsyncAction(async (id: string) => {
    const result = await Cosmetic.equip({ cosmetic: id });
    if (result.success) router.refresh();
  });

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display font-medium text-foreground text-xl">
            Trophy case
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-medium font-subtitle text-primary text-sm">
            <CoinIcon className="size-4" />
            {coins}
          </span>
        </div>
        {owned.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {owned.map((entry) =>
              entry.cosmetic ? (
                <Tile
                  key={entry.id}
                  cosmetic={entry.cosmetic}
                  equipped={entry.equipped}
                  action={
                    <Button
                      variant={entry.equipped ? "soft" : "outline"}
                      color={entry.equipped ? "primary" : "neutral"}
                      disabled={equipping}
                      onClick={() => void equip(entry.cosmeticId)}
                      className="w-full"
                    >
                      {entry.equipped ? "Equipped" : "Equip"}
                    </Button>
                  }
                />
              ) : null,
            )}
          </div>
        ) : (
          <p className="font-body text-foreground-dimmed text-sm">
            Win challenges or spend coins to start your collection.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display font-medium text-foreground text-xl">
          Coin shop
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {shop.map((cosmetic) => {
            const has = ownedIds.has(cosmetic.id);
            const affordable = (cosmetic.price ?? 0) <= coins;
            return (
              <Tile
                key={cosmetic.id}
                cosmetic={cosmetic}
                action={
                  has ? (
                    <p className="flex items-center justify-center gap-1 py-2 font-subtitle text-2xs text-primary">
                      <CheckIcon className="size-3.5" />
                      Owned
                    </p>
                  ) : (
                    <Button
                      color="primary"
                      variant={affordable ? "default" : "outline"}
                      disabled={buying || !affordable}
                      onClick={() => void buy(cosmetic.id)}
                      className="w-full"
                    >
                      <CoinIcon className="size-3.5" />
                      {cosmetic.price}
                    </Button>
                  )
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export namespace AvatarStudio {
  export type Props = {
    coins: number;
    shop: Cosmetic.Type[];
    owned: Cosmetic.OwnedCosmetic[];
  };
}

const Tile = ({
  cosmetic,
  equipped,
  action,
}: {
  cosmetic: Cosmetic.Type;
  equipped?: boolean;
  action: ReactNode;
}) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-[6px] border bg-background-rich p-3",
      equipped ? "border-primary/40" : "border-white/8",
    )}
  >
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-[4px] bg-gradient-to-br",
        rarityGradient[cosmetic.rarity as keyof typeof rarityGradient] ??
          rarityGradient.common,
      )}
    >
      <span className="font-display font-semibold text-2xl text-foreground/80">
        {cosmetic.name.charAt(0)}
      </span>
    </div>
    <div>
      <p className="truncate font-display font-medium text-foreground text-sm">
        {cosmetic.name}
      </p>
      <div className="mt-1">
        <RarityTag
          rarity={cosmetic.rarity as "common" | "rare" | "legendary"}
        />
      </div>
    </div>
    {action}
  </div>
);
