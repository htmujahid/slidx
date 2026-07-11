import type { ShapeProps } from "./create-shape"

export const round = (n: number) => Math.round(n * 10) / 10

export function shiftPoints(points: string, dx: number, dy: number) {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number)
      return `${round(x + dx)},${round(y + dy)}`
    })
    .join(" ")
}

export function pointsCenter(points: string) {
  const coords = points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number))
  const xs = coords.map(([x]) => x)
  const ys = coords.map(([, y]) => y)
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  }
}

export const polyMove = (props: ShapeProps, dx: number, dy: number) => {
  props.points = shiftPoints(props.points as string, dx, dy)
}

export const polyPlaceAt = (props: ShapeProps, x: number, y: number) => {
  const center = pointsCenter(props.points as string)
  props.points = shiftPoints(props.points as string, x - center.x, y - center.y)
}
