import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import type { Point } from "@/lib/editor/geometry"

export const center = (
  at: Point | undefined,
  width: number,
  height: number
) => ({
  x: Math.round((at?.x ?? SLIDE_WIDTH / 2) - width / 2),
  y: Math.round((at?.y ?? SLIDE_HEIGHT / 2) - height / 2),
})
