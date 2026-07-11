import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { RAIL_WIDTH_PX } from "./constants"

export function RailCell({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "sticky left-0 z-20 flex h-full shrink-0 items-center gap-2 border-r bg-background px-2",
        className
      )}
      style={{ width: RAIL_WIDTH_PX }}
      {...props}
    >
      {children}
    </div>
  )
}
