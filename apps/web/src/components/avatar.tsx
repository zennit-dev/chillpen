import { cn } from "@zenncore/utils";
import { AVATAR_BASES } from "@/lib/avatar-catalog";

/**
 * Starter avatars from the chillpen prototype — PNG character rigs in /public/avatars.
 */
export const AVATAR_PRESETS = AVATAR_BASES.map((base) => ({
  id: base.id,
  label: base.name,
  image: base.image,
  head: base.head,
}));

export type AvatarPreset = (typeof AVATAR_PRESETS)[number]["id"];

const PRESET_MAP = new Map(AVATAR_PRESETS.map((preset) => [preset.id, preset]));

const LEGACY_PRESETS: Record<string, AvatarPreset> = {
  quill: "bird",
  tome: "owl",
  moon: "owl",
  ember: "fox",
  mask: "alien",
};

export const resolveAvatarPreset = (
  preset?: string | null,
): (typeof AVATAR_PRESETS)[number] | null => {
  if (!preset) return null;
  const resolved = PRESET_MAP.has(preset as AvatarPreset)
    ? (preset as AvatarPreset)
    : LEGACY_PRESETS[preset];
  return resolved ? (PRESET_MAP.get(resolved) ?? null) : null;
};

export const Avatar = ({
  preset,
  image,
  name,
  className,
  variant = "head",
}: Avatar.Props) => {
  const resolved = resolveAvatarPreset(preset);
  const source =
    image ||
    (resolved ? (variant === "full" ? resolved.image : resolved.head) : null);

  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-display font-semibold text-primary",
        className,
      )}
    >
      {source ? (
        // biome-ignore lint/performance/noImgElement: avatar is a small upload or static preset, not a layout image
        <img src={source} alt="" className="size-full object-cover" />
      ) : (
        (name ?? "?").charAt(0).toUpperCase()
      )}
    </span>
  );
};

export namespace Avatar {
  export type Props = {
    preset?: string | null;
    image?: string | null;
    name?: string | null;
    className?: string;
    variant?: "head" | "full";
  };
}
