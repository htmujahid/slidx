import { roundTo, toRadians } from "@/lib/editor/geometry"
import type { SlideSize } from "@/lib/editor/slide-size"
import type { ElementTransformProps } from "@/lib/editor/types"

export type Alignment =
  "left" | "center" | "right" | "top" | "middle" | "bottom"

export function alignToSlide(
  { width, height, rotation }: ElementTransformProps,
  alignment: Alignment,
  { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }: SlideSize
): Partial<Pick<ElementTransformProps, "x" | "y">> {
  const a = toRadians(rotation)
  const cos = Math.abs(Math.cos(a))
  const sin = Math.abs(Math.sin(a))
  const halfWidth = (width * cos + height * sin) / 2
  const halfHeight = (width * sin + height * cos) / 2

  switch (alignment) {
    case "left":
      return { x: roundTo(halfWidth - width / 2) }
    case "center":
      return { x: roundTo((SLIDE_WIDTH - width) / 2) }
    case "right":
      return { x: roundTo(SLIDE_WIDTH - halfWidth - width / 2) }
    case "top":
      return { y: roundTo(halfHeight - height / 2) }
    case "middle":
      return { y: roundTo((SLIDE_HEIGHT - height) / 2) }
    case "bottom":
      return { y: roundTo(SLIDE_HEIGHT - halfHeight - height / 2) }
  }
}
