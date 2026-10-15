import { ImageResponse } from "next/og"

import { BRAND_COLOR, BRAND_FOREGROUND } from "@/lib/site"

// The mark from components/editor/brand.tsx, with literal colors.
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={BRAND_COLOR} />
      <rect
        x="6"
        y="8.5"
        width="20"
        height="12.5"
        rx="2.5"
        fill="none"
        stroke={BRAND_FOREGROUND}
        strokeWidth="2"
      />
      <path
        d="M10.5 18l3.5-4.5 3 3 4-5"
        fill="none"
        stroke={BRAND_FOREGROUND}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 24.5h8"
        stroke={BRAND_FOREGROUND}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function iconImage(size: number) {
  return new ImageResponse(<Mark size={size} />, { width: size, height: size })
}
