import type { GridSnap } from "@/lib/editor/geometry"
import type { ElementTransformProps } from "@/lib/editor/types"

export type AlignmentGuide = {
  axis: "x" | "y"
  position: number
  start: number
  end: number
}

type Bounds = { left: number; right: number; top: number; bottom: number }

export function getElementBounds(element: ElementTransformProps): Bounds {
  const radians = (element.rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const halfWidth = (element.width * cos + element.height * sin) / 2
  const halfHeight = (element.width * sin + element.height * cos) / 2
  const cx = element.x + element.width / 2
  const cy = element.y + element.height / 2
  return {
    left: cx - halfWidth,
    right: cx + halfWidth,
    top: cy - halfHeight,
    bottom: cy + halfHeight,
  }
}

function anchors(bounds: Bounds, axis: "x" | "y") {
  const [start, end] =
    axis === "x" ? [bounds.left, bounds.right] : [bounds.top, bounds.bottom]
  return [(start + end) / 2, start, end]
}

export function snapToAlignment(
  element: ElementTransformProps,
  peers: ElementTransformProps[],
  slide: { width: number; height: number; scale: number },
  grid: GridSnap,
  bypass = false,
  enabled = true
): { x: number; y: number; guides: AlignmentGuide[] } {
  if (bypass) return { x: element.x, y: element.y, guides: [] }
  const threshold = 6 / Math.max(slide.scale, 0.001)
  const moving = getElementBounds(element)
  const targets = [
    { left: 0, top: 0, right: slide.width, bottom: slide.height },
    ...peers.filter((peer) => peer.opacity > 0).map(getElementBounds),
  ]
  const gridValue = (value: number) =>
    grid.snap && grid.size > 0
      ? Math.round(value / grid.size) * grid.size
      : value
  const result = {
    x: gridValue(element.x),
    y: gridValue(element.y),
    guides: [] as AlignmentGuide[],
  }
  if (!enabled) return result
  const matches: Array<{
    axis: "x" | "y"
    delta: number
    position: number
    target: Bounds
  }> = []
  for (const axis of ["x", "y"] as const) {
    let best: (typeof matches)[number] | undefined
    for (const target of targets)
      for (const to of anchors(target, axis))
        for (const from of anchors(moving, axis)) {
          const delta = to - from
          if (
            Math.abs(delta) <= threshold &&
            (!best || Math.abs(delta) < Math.abs(best.delta) - 1e-7)
          )
            best = { axis, delta, position: to, target }
        }
    if (best) {
      result[axis] = element[axis] + best.delta
      matches.push(best)
    }
  }
  const snapped = getElementBounds({ ...element, x: result.x, y: result.y })
  const padding = 12 / Math.max(slide.scale, 0.001)
  result.guides = matches.map(({ axis, position, target }) => ({
    axis,
    position,
    start:
      axis === "x"
        ? Math.max(0, Math.min(snapped.top, target.top) - padding)
        : Math.max(0, Math.min(snapped.left, target.left) - padding),
    end:
      axis === "x"
        ? Math.min(
            slide.height,
            Math.max(snapped.bottom, target.bottom) + padding
          )
        : Math.min(
            slide.width,
            Math.max(snapped.right, target.right) + padding
          ),
  }))
  return result
}
