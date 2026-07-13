"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AVATAR_BASES,
  AVATAR_ITEMS,
  ITEM_CATEGORIES,
  SLOT_LABELS,
  itemUnlocked,
  tierColor,
  type AvatarItem,
} from "@/lib/avatar-catalog";
import { CoinIcon } from "@/components/icons";
import * as AvatarStudio from "@/server/app/avatar-studio";

export const AvatarStudioPanel = ({
  pseudonym,
  wallet,
}: AvatarStudioPanel.Props) => {
  const router = useRouter();
  const [category, setCategory] = useState<string>("All");
  const [collection, setCollection] = useState(false);
  const [baseError, setBaseError] = useState<string | null>(null);
  const [shopError, setShopError] = useState<string | null>(null);
  const [coins, setCoins] = useState(wallet.coins);
  const [preset, setPreset] = useState(wallet.preset);
  const [ownedAvatars, setOwnedAvatars] = useState(wallet.ownedAvatars);
  const [ownedItems, setOwnedItems] = useState(wallet.ownedItems);
  const [equipped, setEquipped] = useState(wallet.equipped);

  const base = AVATAR_BASES.find((entry) => entry.id === preset) ?? AVATAR_BASES[0];

  const worn = useMemo(
    () => AvatarStudio.equippedCatalog(equipped),
    [equipped],
  );

  const pool = useMemo(() => {
    const source = collection
      ? AVATAR_ITEMS.filter((item) => ownedItems.includes(item.id))
      : AVATAR_ITEMS;
    if (category === "All") return source;
    return source.filter((item) => item.category === category);
  }, [category, collection, ownedItems]);

  const [unlock, unlocking] = useAsyncAction(async (avatar: string) => {
    setBaseError(null);
    const result = await AvatarStudio.unlockAvatar({ avatar });
    if (!result.success || !result.data) {
      const entry = AVATAR_BASES.find((base) => base.id === avatar);
      const message = result.success
        ? "Could not unlock that avatar. Try again."
        : result.error?.message;
      setBaseError(
        message === "insufficient-coins" && entry
          ? `Not enough coins. ${entry.name} costs ${entry.price.toLocaleString()} — you have ${coins.toLocaleString()}.`
          : "Could not unlock that avatar. Try again.",
      );
      return;
    }
    setPreset(result.data.preset);
    setOwnedAvatars(result.data.ownedAvatars ?? []);
    setCoins(result.data.coins);
    router.refresh();
  });

  const [purchase, purchasing] = useAsyncAction(async (item: string) => {
    setShopError(null);
    const result = await AvatarStudio.purchaseItem({ item });
    if (!result.success || !result.data) {
      const catalog = AVATAR_ITEMS.find((entry) => entry.id === item);
      const message = result.success ? "" : result.error?.message;
      switch (message) {
        case "insufficient-coins":
          setShopError(
            catalog
              ? `Not enough coins for ${catalog.name} (${catalog.price}).`
              : "Not enough coins.",
          );
          break;
        case "avatar-tier-locked":
          setShopError(
            catalog?.requires
              ? `Requires the ${AvatarStudio.requiredAvatarName(catalog.requires)} avatar first.`
              : "Unlock a higher base avatar to buy this item.",
          );
          break;
        default:
          setShopError("Could not purchase that item.");
      }
      return;
    }
    setCoins(result.data.coins);
    setOwnedItems(result.data.ownedItems ?? []);
    router.refresh();
  });

  const [wear, wearing] = useAsyncAction(async (item: string) => {
    setShopError(null);
    const catalog = AVATAR_ITEMS.find((entry) => entry.id === item);
    if (!catalog) return;

    const slot = Object.entries(equipped).find(([, id]) => id === item)?.[0];
    if (slot) {
      const result = await AvatarStudio.removeSlot({ slot });
      if (result.success && result.data) setEquipped(result.data.equipped);
      return;
    }

    const result = await AvatarStudio.wearItem({ item });
    if (!result.success || !result.data) {
      setShopError("Could not equip that item.");
      return;
    }
    setEquipped(result.data.equipped);
    router.refresh();
  });

  const [remove, removing] = useAsyncAction(async (slot: string) => {
    const result = await AvatarStudio.removeSlot({ slot });
    if (result.success && result.data) setEquipped(result.data.equipped);
    router.refresh();
  });

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-2xl border border-white/8 bg-background-rich p-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="size-60 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${base.image}')`,
              filter: `drop-shadow(0 0 24px ${base.color}33)`,
            }}
          />
          <p className="font-display font-semibold text-foreground text-lg">
            {base.name}
          </p>
          <p className="font-subtitle text-foreground-dimmed text-xs">
            {pseudonym}&apos;s character
          </p>
        </div>
        <div>
          <h2 className="font-display font-medium text-foreground text-xl">
            Wearing now
          </h2>
          <p className="mt-1 mb-4 font-body text-foreground-dimmed text-sm">
            Buy an item below, then hit{" "}
            <span className="text-primary">Wear</span> — glasses on the eyes,
            hats on the head, pens in the hand.
          </p>
          {worn.length === 0 ? (
            <p className="font-body text-foreground-dimmed text-sm italic">
              Nothing equipped yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {worn.map(({ slot, item }) => (
                <button
                  key={slot}
                  type="button"
                  disabled={removing}
                  onClick={() => void remove(slot)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-subtitle text-foreground text-sm transition hover:border-error/50"
                >
                  <span>{item.icon}</span>
                  {item.name}
                  <span className="text-foreground-dimmed text-2xs">
                    ({SLOT_LABELS[slot as keyof typeof SLOT_LABELS] ?? slot}) ✕
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display font-medium text-foreground text-2xl">
          Choose your base
        </h2>
        <p className="mt-1 mb-5 font-body text-foreground-dimmed text-sm">
          Every smart idea begins with you.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {AVATAR_BASES.map((character) => {
            const owned = ownedAvatars.includes(character.id);
            const selected = preset === character.id;
            const affordable = coins >= character.price;
            return (
              <div
                key={character.id}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border bg-background-rich p-4 text-center",
                  selected
                    ? "border-primary/50"
                    : "border-white/8",
                )}
                style={
                  selected
                    ? { borderColor: `${character.color}80` }
                    : undefined
                }
              >
                <div
                  className="h-36 w-full bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${character.image}')`,
                    filter: `drop-shadow(0 0 24px ${character.color}33)`,
                  }}
                />
                <div>
                  <p
                    className="font-display font-semibold text-sm uppercase tracking-wider"
                    style={{ color: character.color }}
                  >
                    {character.name}
                  </p>
                  <span
                    className="mt-1 inline-flex rounded-full border px-2.5 py-0.5 font-subtitle text-2xs"
                    style={{
                      color: character.color,
                      borderColor: `${character.color}55`,
                    }}
                  >
                    {character.price === 0 ? "Starter" : "Unlock with coins"}
                  </span>
                </div>
                <p className="font-body text-foreground-dimmed text-xs leading-relaxed">
                  {character.meaning}
                </p>
                <Button
                  disabled={unlocking}
                  onClick={() => void unlock(character.id)}
                  className="w-full"
                  variant={selected || owned ? "outline" : "default"}
                  color={!owned && affordable && !selected ? "primary" : "neutral"}
                  style={
                    selected
                      ? {
                          borderColor: `${character.color}80`,
                          background: `${character.color}22`,
                          color: character.color,
                        }
                      : undefined
                  }
                >
                  {selected
                    ? "Selected"
                    : owned
                      ? "Select"
                      : `Unlock · ${character.price.toLocaleString()}`}
                </Button>
              </div>
            );
          })}
        </div>
        {baseError ? (
          <p className="mt-3 font-subtitle text-error text-sm">{baseError}</p>
        ) : null}
      </section>

      <section>
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display font-medium text-foreground text-2xl">
            Items shop
          </h2>
          <span className="font-subtitle text-foreground-dimmed text-sm">
            {AVATAR_ITEMS.length} items
          </span>
        </div>
        <p className="mb-4 font-body text-foreground-dimmed text-sm">
          Customize your avatar. Rarer items need a higher base.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {ITEM_CATEGORIES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setCollection(false);
                setCategory(name);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-subtitle text-sm transition",
                !collection && category === name
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/12 text-foreground-dimmed hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCollection((value) => !value)}
            className={cn(
              "ml-auto rounded-full border px-3.5 py-1.5 font-subtitle text-sm transition",
              collection
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-white/12 text-foreground-dimmed hover:text-foreground",
            )}
          >
            My collection
          </button>
        </div>

        {shopError ? (
          <p className="mb-4 rounded-md border border-error/30 bg-error/10 px-3 py-2 font-subtitle text-error text-sm">
            {shopError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pool.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={ownedItems.includes(item.id)}
              wearing={Object.values(equipped).includes(item.id)}
              coins={coins}
              ownedAvatars={ownedAvatars}
              busy={purchasing || wearing}
              onBuy={() => void purchase(item.id)}
              onWear={() => void wear(item.id)}
            />
          ))}
        </div>

        {collection && pool.length === 0 ? (
          <p className="mt-4 font-body text-foreground-dimmed text-sm">
            Nothing in your collection yet — buy your first item with coins.
          </p>
        ) : null}
      </section>
    </div>
  );
};

const ItemCard = ({
  item,
  owned,
  wearing,
  coins,
  ownedAvatars,
  busy,
  onBuy,
  onWear,
}: {
  item: AvatarItem;
  owned: boolean;
  wearing: boolean;
  coins: number;
  ownedAvatars: string[];
  busy: boolean;
  onBuy: () => void;
  onWear: () => void;
}) => {
  const unlocked = itemUnlocked(item, ownedAvatars);

  const affordable = coins >= item.price;
  const tier = tierColor(item.tier);

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border bg-background-rich p-2.5",
        unlocked ? "border-white/8" : "border-white/5 opacity-60",
      )}
    >
      <div
        className="flex aspect-square items-center justify-center rounded-md text-3xl"
        style={{
          background: `linear-gradient(135deg, ${tier}22, transparent)`,
        }}
      >
        {item.icon}
      </div>
      <div className="min-h-11">
        <p className="font-display font-medium text-foreground text-xs leading-snug">
          {item.name}
        </p>
        <p
          className="mt-0.5 font-subtitle text-2xs uppercase tracking-wider"
          style={{ color: tier }}
        >
          {item.tier}
        </p>
      </div>
      {owned ? (
        <Button
          variant="outline"
          color={wearing ? "primary" : "neutral"}
          disabled={busy}
          onClick={onWear}
          className="w-full text-xs"
        >
          {wearing ? "Wearing ✓" : "Wear"}
        </Button>
      ) : unlocked ? (
        <Button
          color="primary"
          variant={affordable ? "default" : "outline"}
          disabled={busy || !affordable}
          onClick={onBuy}
          className="w-full text-xs"
        >
          <CoinIcon className="size-3" />
          {item.price}
        </Button>
      ) : (
        <p className="py-2 text-center font-subtitle text-2xs text-foreground-dimmed">
          🔒 Needs {AvatarStudio.requiredAvatarName(item.requires)}
        </p>
      )}
    </div>
  );
};

export namespace AvatarStudioPanel {
  export type Props = {
    pseudonym: string;
    wallet: AvatarStudio.AvatarWallet;
  };
}
