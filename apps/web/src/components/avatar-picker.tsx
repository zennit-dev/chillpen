"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AVATAR_PRESETS, Avatar } from "@/components/avatar";
import * as User from "@/server/app/user";

export const AvatarPicker = ({
  initial,
  name,
  onSelected,
  onError,
}: AvatarPicker.Props) => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(initial ?? null);

  const [choose, isSaving] = useAsyncAction(async (preset: string) => {
    const previous = selected;
    setSelected(preset);
    const result = await User.setAvatarPreset(preset);
    if (!result.success) {
      setSelected(previous);
      onError?.();
      return;
    }
    onSelected?.(preset);
    // Re-render server components (nav avatar, profile) with the new preset.
    router.refresh();
  });

  return (
    <div className="flex flex-wrap gap-3">
      {AVATAR_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          disabled={isSaving}
          onClick={() => void choose(preset.id)}
          aria-pressed={selected === preset.id}
          aria-label={preset.label}
          title={preset.label}
          className={cn(
            "rounded-full p-0.5 transition disabled:opacity-60",
            selected === preset.id
              ? "ring-2 ring-primary"
              : "ring-1 ring-white/10 hover:ring-primary/50",
          )}
        >
          <Avatar
            preset={preset.id}
            name={name}
            className="size-14"
            variant="full"
          />
        </button>
      ))}
    </div>
  );
};

export namespace AvatarPicker {
  export type Props = {
    initial?: string | null;
    name?: string | null;
    onSelected?: (preset: string) => void;
    onError?: () => void;
  };
}
