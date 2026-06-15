import type { Metadata } from "next";

export const seo = {
  host: "https://chillpen.club",
  name: "chillpen",
  title: "chillpen — build worlds together",
  description:
    "Where books become living, branching universes that readers explore and writers build together. Netflix-grade browsing meets a branching narrative engine.",
  twitter: "@chillpenclub",
  links: [
    "https://x.com/chillpenclub",
    "https://www.instagram.com/chillpen.club/",
  ],
} as const;

export const absoluteUrl = (path = "/") => new URL(path, seo.host).toString();

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: seo.name,
  url: seo.host,
  logo: absoluteUrl("/icon"),
  description: seo.description,
  sameAs: [...seo.links],
} as const;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: seo.name,
  url: seo.host,
  description: seo.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${seo.host}/search?q={query}`,
    },
    "query-input": "required name=query",
  },
} as const;

export const createMetadata = ({
  title,
  description,
  path,
  keywords = [],
  type = "website",
  noindex = false,
}: createMetadata.Props): Metadata => ({
  title,
  description,
  keywords: [...keywords],
  alternates: { canonical: path },
  robots: noindex ? { index: false, follow: false } : undefined,
  openGraph: {
    type,
    url: absoluteUrl(path),
    siteName: seo.name,
    title: `${title} — ${seo.name}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    site: seo.twitter,
    title: `${title} — ${seo.name}`,
    description,
  },
});

export namespace createMetadata {
  export type Props = {
    title: string;
    description: string;
    path: string;
    keywords?: readonly string[];
    type?: "article" | "website" | "profile" | "book";
    noindex?: boolean;
  };
}

export const createUniverseSchema = ({
  title,
  description,
  slug,
  author,
  genres,
  rating,
}: createUniverseSchema.Props) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: title,
  description,
  url: absoluteUrl(`/story/${slug}`),
  genre: [...genres],
  author: { "@type": "Person", name: author },
  ...(rating > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (rating / 10).toFixed(1),
          bestRating: "5",
        },
      }
    : {}),
});

export namespace createUniverseSchema {
  export type Props = {
    title: string;
    description: string;
    slug: string;
    author: string;
    genres: readonly string[];
    rating: number;
  };
}

export const createPersonSchema = ({
  pseudonym,
  bio,
}: createPersonSchema.Props) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: pseudonym,
    description: bio,
    url: absoluteUrl(`/u/${pseudonym}`),
  },
});

export namespace createPersonSchema {
  export type Props = {
    pseudonym: string;
    bio: string;
  };
}

export const createBreadcrumbSchema = (
  items: readonly createBreadcrumbSchema.Item[],
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export namespace createBreadcrumbSchema {
  export type Item = {
    name: string;
    path: string;
  };
}
