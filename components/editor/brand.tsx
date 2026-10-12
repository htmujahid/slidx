import Link from "next/link"

import { cn } from "@/lib/utils"

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-7 shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <rect
        x="6"
        y="8.5"
        width="20"
        height="12.5"
        rx="2.5"
        fill="none"
        strokeWidth="2"
        className="stroke-primary-foreground"
      />
      <path
        d="M10.5 18l3.5-4.5 3 3 4-5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M12 24.5h8"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
    </svg>
  )
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Visx home"
      className="flex shrink-0 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <BrandMark />
    </Link>
  )
}

export { Brand, BrandMark }
