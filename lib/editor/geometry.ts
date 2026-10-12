export type Point = { x: number; y: number }

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180
export const toDegrees = (radians: number) => (radians * 180) / Math.PI

export function rotatePoint(point: Point, degrees: number): Point {
  const a = toRadians(degrees)
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  }
}

export function elementBounds(props: {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}) {
  const { x, y, width, height, rotation } = props
  const center = { x: x + width / 2, y: y + height / 2 }
  const corners = [
    { x: -width / 2, y: -height / 2 },
    { x: width / 2, y: -height / 2 },
    { x: width / 2, y: height / 2 },
    { x: -width / 2, y: height / 2 },
  ].map((corner) => rotatePoint(corner, rotation))
  const xs = corners.map((corner) => center.x + corner.x)
  const ys = corners.map((corner) => center.y + corner.y)
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  }
}

export const roundTo = (value: number, precision = 1) => {
  const f = 10 ** precision
  return Math.round(value * f) / f
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function normalizeAngle(degrees: number) {
  const a = ((degrees % 360) + 360) % 360
  return a > 180 ? a - 360 : a
}

export function swallowNextEvents(types: string[], timeout = 250) {
  for (const type of types) {
    const swallow = (event: Event) => event.stopPropagation()
    window.addEventListener(type, swallow, { capture: true, once: true })
    window.setTimeout(
      () => window.removeEventListener(type, swallow, true),
      timeout
    )
  }
}

export const swallowNextClick = (timeout = 250) =>
  swallowNextEvents(["click"], timeout)

export function trackPointer(
  onMove: (event: PointerEvent) => void,
  onEnd?: () => void,
  pointerId?: number
) {
  let ended = false
  const matches = (event: PointerEvent) =>
    pointerId === undefined || event.pointerId === pointerId
  const handleMove = (event: PointerEvent) => {
    if (matches(event)) onMove(event)
  }
  const finish = () => {
    if (ended) return
    ended = true
    window.removeEventListener("pointermove", handleMove)
    window.removeEventListener("pointerup", handleUp)
    window.removeEventListener("pointercancel", handleUp)
    window.removeEventListener("blur", finish)
    window.removeEventListener("keydown", handleKey)
    onEnd?.()
  }
  const handleUp = (event: PointerEvent) => {
    if (matches(event)) finish()
  }
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") finish()
  }
  window.addEventListener("pointermove", handleMove)
  window.addEventListener("pointerup", handleUp)
  window.addEventListener("pointercancel", handleUp)
  window.addEventListener("blur", finish)
  window.addEventListener("keydown", handleKey)
  return finish
}

export type GridSnap = { snap: boolean; size: number }

export const snapValue = (value: number, grid: GridSnap) =>
  grid.snap && grid.size > 0 ? Math.round(value / grid.size) * grid.size : value
