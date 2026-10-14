import type { ElementValues } from "@/lib/editor/tracks/types"

export function elementValues(props: Record<string, unknown>): ElementValues {
  const pick = (key: keyof ElementValues) =>
    typeof props[key] === "number" ? (props[key] as number) : undefined
  return {
    x: pick("x"),
    y: pick("y"),
    width: pick("width"),
    height: pick("height"),
    rotation: pick("rotation"),
    strokeWidth: pick("strokeWidth"),
  }
}
