import { ROOT_NODE } from "@craftjs/core"

import {
  addTracks,
  addTransitions,
  addVisibility,
  createParts,
  type AnimationParts,
  type EntryContext,
} from "@/lib/editor/animation/parts"
import { isTimed, type Timeline } from "@/lib/editor/animation/timeline"

const DRAWN_ELEMENTS = "path,rect,circle,ellipse,line,polygon,polyline"

function renderRules(parts: AnimationParts, scope: string, paused: string) {
  const { classes, wrapper, declared, strokes, drawn, chartPieces } = parts
  const target = (id: string) =>
    id === ROOT_NODE
      ? `.vx-${scope}.${classes[id]}`
      : `.vx-${scope} .${classes[id]}`
  const rules: string[] = []
  for (const [id, list] of wrapper) {
    const extra = [...new Set(declared.get(id) ?? [])]
      .map((declaration) => `${declaration};`)
      .join("")
    rules.push(
      `${target(id)}{transform-origin:center;${extra}animation:${list.join(",")}${paused}}`
    )
  }
  for (const [id, list] of strokes) {
    rules.push(
      `.vx-${scope} .${classes[id]} :is(${DRAWN_ELEMENTS}){${[...new Set(list)].join(";")}}`
    )
  }
  for (const [id, list] of drawn) {
    rules.push(
      `.vx-${scope} .${classes[id]} :is(${DRAWN_ELEMENTS}){animation:${list.join(",")}${paused}}`
    )
  }
  for (const [selector, piece] of chartPieces) {
    const declarations = [...piece.declarations]
      .map((value) => `${value};`)
      .join("")
    const animation =
      piece.animations.length > 0
        ? `animation:${piece.animations.join(",")}${paused}`
        : ""
    rules.push(`${selector}{${declarations}${animation}}`)
  }
  return rules
}

function renderCss(parts: AnimationParts, rules: string[]) {
  const { keyframes, registrations } = parts
  const frames = [...keyframes].map(
    ([name, body]) => `@keyframes ${name}{${body}}`
  )
  if (frames.some((frame) => frame.includes("--vx-sweep")))
    registrations.set(
      "--vx-sweep",
      '@property --vx-sweep{syntax:"<angle>";inherits:false;initial-value:360deg}'
    )
  return `${[...registrations.values()].join("")}@media (prefers-reduced-motion:no-preference){${rules.join("")}${frames.join("")}}`
}

export function buildAnimationCss(
  scope: string,
  run: number,
  timeline: Timeline,
  options: { pausedAt?: number } = {}
) {
  const { pausedAt } = options
  const { durationMs } = timeline
  const parts = createParts()
  const context: EntryContext = {
    scope,
    durationMs,
    at: (ms) => ms - (pausedAt ?? 0),
  }

  for (const entry of timeline.entries) {
    if (!isTimed(entry, durationMs)) continue
    parts.classes[entry.id] = `a-${entry.id}-${run}`
    addTracks(parts, entry, context)
    addVisibility(parts, entry, context)
    addTransitions(parts, entry, context)
  }

  const paused = pausedAt === undefined ? "" : ";animation-play-state:paused"
  const rules = renderRules(parts, scope, paused)
  if (rules.length === 0) return { css: "", classes: parts.classes }
  return { css: renderCss(parts, rules), classes: parts.classes }
}
