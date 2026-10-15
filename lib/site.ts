export const SITE_NAME = "Slidx"
export const SITE_TAGLINE = "Slides that move"
export const SITE_DESCRIPTION =
  "Design, animate and present slides in your browser. Slidx is a slide editor with a timeline, charts, code blocks and an AI assistant, with export to PDF, PNG and HTML."

// Brand colors, matching --primary in app/globals.css.
export const BRAND_COLOR = "#4338ca"
export const BRAND_FOREGROUND = "#e0e7ff"

// Absolute origin for canonical URLs and social images. Set
// NEXT_PUBLIC_SITE_URL in production; Vercel's own variables are the fallback.
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return new URL(explicit)
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return new URL(`https://${vercel}`)
  return new URL("http://localhost:3000")
}
