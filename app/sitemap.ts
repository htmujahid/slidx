import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site"

// Only the public landing page; everything else needs a login.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl().origin,
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
