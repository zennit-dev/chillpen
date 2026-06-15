import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";

export const alt = "A living universe on chillpen";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const universe = await Universe.bySlug(Environment.SERVER, slug);
  const data = universe.success ? universe.data : null;

  return createOgImage({
    eyebrow: "Living universe",
    title: data?.title ?? "A living universe",
    description:
      data?.description ??
      "Read, branch, and build worlds together on chillpen.",
  });
};
