/** Shown when a universe is submitted/published without a cover image. */
export const COVER_REQUIRED_MESSAGE =
  "Your cover is missing — add it please.";

export const hasCover = (cover?: string | null) =>
  Boolean(cover?.trim());
