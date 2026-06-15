import type { MetadataRoute } from "next";
import { seo } from "@/lib/seo";

export default (): MetadataRoute.Manifest => ({
  name: seo.title,
  short_name: seo.name,
  description: seo.description,
  start_url: "/",
  display: "standalone",
  background_color: "#0a0a0d",
  theme_color: "#0a0a0d",
  categories: ["entertainment", "books", "social"],
  icons: [
    { src: "/icon", sizes: "256x256", type: "image/png" },
    { src: "/apple-icon", sizes: "180x180", type: "image/png" },
  ],
});
