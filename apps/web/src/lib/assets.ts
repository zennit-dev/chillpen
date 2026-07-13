/**
 * Absolute URL for a file under apps/web/public.
 *
 * Local `/covers` and `/avatars` paths 404 on the current Vercel deploy (static
 * assets from the zip rebuild never shipped). Serve them via jsDelivr from the
 * `main` branch until a clean deploy includes `public/` again. Same-origin is
 * still used in development.
 */
export const publicAsset = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (process.env.NODE_ENV !== "production") return normalized;

  const origin =
    process.env["NEXT_PUBLIC_ASSET_ORIGIN"] ??
    "https://cdn.jsdelivr.net/gh/zennit-dev/chillpen@main/apps/web/public";

  return `${origin}${normalized}`;
};

/** Rewrite stored cover/avatar paths that point at missing Vercel static files. */
export const resolveMediaUrl = (source: string | null | undefined) => {
  if (!source) return null;
  if (
    source.startsWith("/covers/") ||
    source.startsWith("/avatars/") ||
    source.startsWith("/favicon") ||
    source === "/logo-mark.png" ||
    source === "/thumbnail.jpg"
  ) {
    return publicAsset(source);
  }
  return source;
};
