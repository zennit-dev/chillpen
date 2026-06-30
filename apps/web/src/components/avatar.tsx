import { cn } from "@zenncore/utils";

/**
 * Starter avatars — five on-brand gold-on-dark presets every writer can pick at
 * onboarding or in settings. Rendered from static SVGs in /public/avatars so the
 * same component works in server and client trees. (Swap the SVGs for richer art
 * later without touching call sites.)
 */
export const AVATAR_PRESETS = [
  { id: "quill", label: "The Scribe" },
  { id: "tome", label: "The Sage" },
  { id: "moon", label: "The Dreamer" },
  { id: "ember", label: "The Spark" },
  { id: "mask", label: "The Trickster" },
] as const;

export type AvatarPreset = (typeof AVATAR_PRESETS)[number]["id"];

const PRESET_IDS = new Set<string>(AVATAR_PRESETS.map((preset) => preset.id));

export const Avatar = ({ preset, image, name, className }: Avatar.Props) => {
  const source =
    image ||
    (preset != null && PRESET_IDS.has(preset)
      ? `/avatars/${preset}.svg`
      : null);

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
  };
}
