import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const config = {
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
} satisfies NextConfig;

export default withSentryConfig(config, {
  silent: !process.env.CI,
  disableLogger: true,
  widenClientFileUpload: true,
});
