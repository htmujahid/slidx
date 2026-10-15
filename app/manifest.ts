import type { MetadataRoute } from "next"

import { BRAND_COLOR, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: BRAND_COLOR,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
