import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og";
import { seo } from "@/lib/seo";

export const alt = seo.title;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default () =>
  createOgImage({
    title: "Build worlds together",
    description: seo.description,
  });
