import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl().origin
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in pages and the API have nothing to index.
      disallow: ["/dashboard", "/editor", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
