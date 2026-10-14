import { EASINGS } from "@/lib/editor/easing"
import { TRACK_PROPERTIES } from "@/lib/editor/tracks/properties"
import type { AnimationTrack, ElementValues } from "@/lib/editor/tracks/types"

export function compileTracks(options: {
  scope: string
  id: string
  tracks: AnimationTrack[]
  values: ElementValues
  durationMs: number
  delay: number
}) {
  const { scope, id, values, durationMs } = options
  const keyframes = new Map<string, string>()
  const registrations = new Map<string, string>()
  const animations: string[] = []
  const declarations = new Set<string>()
  const drawn = new Set<string>()
  const percent = (ms: number) =>
    +((Math.min(Math.max(ms, 0), durationMs) / durationMs) * 100).toFixed(4)

  for (const { property, keyframes: points } of options.tracks) {
    const def = TRACK_PROPERTIES[property]
    if (!def || points.length === 0) continue
    const name = `vx-${scope}-${id}-${property}`
    const rest = def.rest(values)
    const ordered = [...points].sort((a, b) => a.at - b.at)
    const first = ordered[0]
    const last = ordered[ordered.length - 1]
    const frames = [
      ...(percent(first.at) > 0 ? [{ ...first, at: 0 }] : []),
      ...ordered,
      ...(percent(last.at) < 100 ? [{ ...last, at: durationMs }] : []),
    ]
    keyframes.set(
      name,
      frames
        .map(
          (point) =>
            `${percent(point.at)}%{${def.variable}:${def.toCss(point.value, rest)};animation-timing-function:${EASINGS[point.easing].css}}`
        )
        .join("")
    )
    registrations.set(
      def.variable,
      `@property ${def.variable}{syntax:"${def.syntax}";inherits:${def.inherits ? "true" : "false"};initial-value:${def.initial}}`
    )
    animations.push(`${name} ${durationMs}ms linear ${options.delay}ms 1 both`)

    if (property === "x" || property === "y")
      declarations.add("translate:var(--vx-x,0px) var(--vx-y,0px)")
    else if (["scale", "width", "height"].includes(property))
      declarations.add(
        "scale:calc(var(--vx-scale,1)*var(--vx-w,1)) calc(var(--vx-scale,1)*var(--vx-h,1))"
      )
    else if (property === "rotation")
      declarations.add("rotate:var(--vx-r,0deg)")
    else if (property === "opacity") declarations.add("opacity:var(--vx-o,1)")
    else if (["blur", "brightness", "grayscale"].includes(property))
      declarations.add(
        "filter:blur(var(--vx-b,0px)) brightness(var(--vx-br,1)) grayscale(var(--vx-g,0))"
      )
    else if (property === "strokeWidth")
      drawn.add(`stroke-width:var(--vx-sw,${values.strokeWidth ?? 0})`)
  }

  return { keyframes, registrations, animations, declarations, drawn }
}
