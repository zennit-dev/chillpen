import type { MetadataRoute } from "next";
import { seo } from "@/lib/seo";

export default (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/me", "/admin", "/write", "/api/", "/onboarding"],
  },
  sitemap: `${seo.host}/sitemap.xml`,
  host: seo.host,
});
