import { ROOT_NODE } from "@craftjs/core"

import type { ChartKind } from "@/lib/editor/chart"
import { EASINGS, type AnimationEasing } from "@/lib/editor/easing"
import {
  compileTracks,
  type AnimationTrack,
  type ElementValues,
} from "@/lib/editor/tracks"

export { EASINGS, type AnimationEasing }

export type AnimationPreset =
  | "none"
  | "fade-in"
  | "slide-in-left"
  | "slide-in-right"
  | "slide-in-up"
  | "slide-in-down"
  | "zoom-in"
  | "blur-in"
  | "bounce-in"
  | "wipe-in"
  | "typewriter"
  | "draw"
  | "chart-build"
  | "fade-out"
  | "slide-out-left"
  | "slide-out-right"
  | "slide-out-up"
  | "slide-out-down"
  | "zoom-out"
  | "blur-out"
  | "wipe-out"

/** An element's entrance plays at the start of its span, its exit at the end. */
export type TransitionSide = "enter" | "exit"

export type Transition = {
  preset: AnimationPreset
  /** Milliseconds. */
  duration: number
  easing: AnimationEasing
}

/**
 * One stretch of time an element is on the slide, in milliseconds from the
 * slide appearing. The transitions play inside it, at its edges.
 */
export type ElementSpan = {
  start: number
  /** `null` runs to the end of the slide. */
  end: number | null
  enter: Transition
  exit: Transition
}

/**
 * When an element is on the slide. By default it is there throughout, as one
 * span. Trimming a span hides the element outside it; splitting one into two
 * and trimming between them shows the element, hides it, and shows it again.
 */
export type ElementTiming = {
  spans: ElementSpan[]
  /** Property keyframes, at slide milliseconds; they run alongside the spans. */
  tracks: AnimationTrack[]
}

export const DEFAULT_SLIDE_DURATION = 5000
/** The shortest an element can be on the slide in one go. */
export const MIN_VISIBLE_MS = 100

const DEFAULT_ENTER: Transition = {
  preset: "none",
  duration: 600,
  easing: "ease-out",
}
const DEFAULT_EXIT: Transition = { ...DEFAULT_ENTER, easing: "ease-in" }

export const DEFAULT_SPAN: ElementSpan = {
  start: 0,
  end: null,
  enter: DEFAULT_ENTER,
  exit: DEFAULT_EXIT,
}

export const DEFAULT_TIMING: ElementTiming = {
  spans: [DEFAULT_SPAN],
  tracks: [],
}

export const resolveSpan = (span?: Partial<ElementSpan>): ElementSpan => ({
  ...DEFAULT_SPAN,
  ...span,
  enter: { ...DEFAULT_ENTER, ...span?.enter },
  exit: { ...DEFAULT_EXIT, ...span?.exit },
})

/** Fills in whatever a saved timing leaves out. */
export function resolveTiming(timing?: Partial<ElementTiming>): ElementTiming {
  return {
    spans:
      timing?.spans && timing.spans.length > 0
        ? timing.spans.map(resolveSpan)
        : [DEFAULT_SPAN],
    tracks: timing?.tracks ?? [],
  }
}

const DISTANCE = 160
const DRAWN_ELEMENTS = "path,rect,circle,ellipse,line,polygon,polyline"
const MAX_TYPEWRITER_STEPS = 80

type PresetDefinition = {
  id: Exclude<AnimationPreset, "none">
  label: string
  group: "enter" | "exit"
  /** Node names it applies to; every element when omitted. */
  only?: string[]
  /** `@keyframes` body applied to the element's wrapper. */
  frames?: string
  /** Animates the stroke and fill of the drawn geometry instead. */
  draw?: boolean
  /** Builds a chart up piece by piece; what that means depends on its kind. */
  build?: boolean
  /** Reveals in discrete steps, one per character. */
  stepped?: boolean
}

const slideFrames = (axis: "X" | "Y", sign: 1 | -1) =>
  `from{opacity:0;transform:translate${axis}(${sign * DISTANCE}px)}to{opacity:1;transform:none}`

const slideOutFrames = (axis: "X" | "Y", sign: 1 | -1) =>
  `from{opacity:1;transform:none}to{opacity:0;transform:translate${axis}(${sign * DISTANCE}px)}`

/* A left-to-right reveal. The generous negative insets keep shadows and
   outer stroke halves from being clipped once it has finished. */
const WIPE_FRAMES =
  "from{clip-path:inset(-200px 100% -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

/* The reverse: the element is wiped away from the left. */
const WIPE_OUT_FRAMES =
  "from{clip-path:inset(-200px -200px -200px -200px)}to{clip-path:inset(-200px -200px -200px 100%)}"

/* Same reveal, but between the measured text edges (--vx-text-l / -r) rather
   than across the whole box; unmeasured it falls back to the box. */
const TYPEWRITER_FRAMES =
  "from{clip-path:inset(-200px calc(100% - var(--vx-text-l,0px)) -200px -200px)}99.9%{clip-path:inset(-200px calc(100% - var(--vx-text-r,100%)) -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

export const PRESETS: PresetDefinition[] = [
  {
    id: "fade-in",
    label: "Fade in",
    group: "enter",
    frames: "from{opacity:0}to{opacity:1}",
  },
  {
    id: "slide-in-left",
    label: "Slide in from left",
    group: "enter",
    frames: slideFrames("X", -1),
  },
  {
    id: "slide-in-right",
    label: "Slide in from right",
    group: "enter",
    frames: slideFrames("X", 1),
  },
  {
    id: "slide-in-up",
    label: "Slide in from bottom",
    group: "enter",
    frames: slideFrames("Y", 1),
  },
  {
    id: "slide-in-down",
    label: "Slide in from top",
    group: "enter",
    frames: slideFrames("Y", -1),
  },
  {
    id: "zoom-in",
    label: "Zoom in",
    group: "enter",
    frames: "from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}",
  },
  {
    id: "blur-in",
    label: "Blur in",
    group: "enter",
    frames: "from{opacity:0;filter:blur(24px)}to{opacity:1;filter:blur(0)}",
  },
  {
    id: "bounce-in",
    label: "Bounce in",
    group: "enter",
    frames:
      "0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.08)}70%{transform:scale(.94)}100%{opacity:1;transform:none}",
  },
  {
    id: "wipe-in",
    label: "Wipe in",
    group: "enter",
    frames: WIPE_FRAMES,
  },
  {
    id: "typewriter",
    label: "Typewriter",
    group: "enter",
    only: ["TextBox"],
    frames: TYPEWRITER_FRAMES,
    stepped: true,
  },
  {
    id: "draw",
    label: "Draw on",
    group: "enter",
    only: ["Shape", "IconBox", "ArrowLine"],
    draw: true,
  },
  {
    id: "chart-build",
    label: "Build chart",
    group: "enter",
    only: ["ChartBox"],
    build: true,
  },
  {
    id: "fade-out",
    label: "Fade out",
    group: "exit",
    frames: "from{opacity:1}to{opacity:0}",
  },
  {
    id: "slide-out-left",
    label: "Slide out to left",
    group: "exit",
    frames: slideOutFrames("X", -1),
  },
  {
    id: "slide-out-right",
    label: "Slide out to right",
    group: "exit",
    frames: slideOutFrames("X", 1),
  },
  {
    id: "slide-out-up",
    label: "Slide out to top",
    group: "exit",
    frames: slideOutFrames("Y", -1),
  },
  {
    id: "slide-out-down",
    label: "Slide out to bottom",
    group: "exit",
    frames: slideOutFrames("Y", 1),
  },
  {
    id: "zoom-out",
    label: "Zoom out",
    group: "exit",
    frames: "from{opacity:1;transform:none}to{opacity:0;transform:scale(.6)}",
  },
  {
    id: "blur-out",
    label: "Blur out",
    group: "exit",
    frames: "from{opacity:1;filter:blur(0)}to{opacity:0;filter:blur(24px)}",
  },
  {
    id: "wipe-out",
    label: "Wipe out",
    group: "exit",
    frames: WIPE_OUT_FRAMES,
  },
]

const PRESETS_BY_ID = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset])
) as Record<PresetDefinition["id"], PresetDefinition>

/** Whether easing shapes this preset (stepped ones like the typewriter ignore it). */
export const hasEasing = (preset: AnimationPreset) =>
  preset !== "none" && !PRESETS_BY_ID[preset].stepped

/** The presets that suit this element at one edge of its span. */
export function presetsFor(nodeName: string, side: TransitionSide) {
  return PRESETS.filter(
    (preset) =>
      preset.group === side && (!preset.only || preset.only.includes(nodeName))
  )
}

export type ChartMeta = { kind: ChartKind; categories: number }

export type TimelineInput = {
  id: string
  /** The node type, e.g. "TextBox". */
  name: string
  timing?: Partial<ElementTiming>
  /** Plain text, used to size the typewriter's steps. */
  text?: string
  /** A chart's kind and how many categories it has, which shape its build. */
  chart?: ChartMeta
  /** The element's own position, size, rotation and stroke, which keyframes are measured from. */
  values?: ElementValues
}

/** A span settled within the slide: `end` is always a time. */
export type ResolvedSpan = Omit<ElementSpan, "end"> & {
  end: number
  /** Whether this span runs to the end of the slide. */
  toEnd: boolean
}

export type TimelineEntry = {
  id: string
  name: string
  spans: ResolvedSpan[]
  tracks: AnimationTrack[]
  values?: ElementValues
  text?: string
  chart?: ChartMeta
}

/** Settles every element's spans within the slide's length, in order and apart. */
export function buildTimeline(inputs: TimelineInput[], durationMs: number) {
  const entries: TimelineEntry[] = inputs.map((input) => {
    const timing = resolveTiming(input.timing)
    // A preset that doesn't suit this element at this edge does nothing.
    const valid = (side: TransitionSide, transition: Transition) => {
      const definition =
        transition.preset === "none"
          ? undefined
          : PRESETS_BY_ID[transition.preset]
      return definition &&
        definition.group === side &&
        (!definition.only || definition.only.includes(input.name))
        ? transition
        : { ...transition, preset: "none" as const }
    }
    const spans: ResolvedSpan[] = []
    let floor = 0
    for (const span of [...timing.spans].sort((a, b) => a.start - b.start)) {
      const start = Math.min(
        Math.max(span.start, floor),
        Math.max(durationMs - MIN_VISIBLE_MS, 0)
      )
      const end =
        span.end === null
          ? durationMs
          : Math.min(Math.max(span.end, start + MIN_VISIBLE_MS), durationMs)
      if (end <= start) continue
      spans.push({
        start,
        end,
        toEnd: span.end === null || end >= durationMs,
        enter: valid("enter", span.enter),
        exit: valid("exit", span.exit),
      })
      floor = end
    }
    return {
      id: input.id,
      name: input.name,
      spans,
      tracks: timing.tracks,
      values: input.values,
      text: input.text,
      chart: input.chart,
    }
  })
  return { entries, durationMs }
}

export type Timeline = ReturnType<typeof buildTimeline>

/** Whether an element's timing changes anything about how it plays. */
export const isTimed = (entry: TimelineEntry, durationMs: number) =>
  entry.tracks.length > 0 ||
  entry.spans.length !== 1 ||
  entry.spans[0].start > 0 ||
  entry.spans[0].end < durationMs ||
  entry.spans[0].enter.preset !== "none" ||
  entry.spans[0].exit.preset !== "none"

const stepCount = (text = "") =>
  Math.min(
    Math.max(Array.from(text.replace(/\s+/g, " ").trim()).length, 4),
    MAX_TYPEWRITER_STEPS
  )

const FADE_LATE = "0%,60%{opacity:0}to{opacity:1}"

/**
 * How a chart builds up, as rules aimed at the classes Recharts gives its
 * parts. Bars grow in turn from their baseline, lines draw themselves, areas
 * wipe in, a pie sweeps round and a radar opens out from its centre.
 */
/** One part of a chart's build: what to style, and the animation that plays on it. */
type ChartPiece = {
  selector: string
  /** Declarations that stay as they are, whatever animation plays. */
  declarations?: string
  animation?: string
}

function chartBuildCss(
  scope: string,
  /** Tells apart the builds of one chart's parts, which each need their own keyframes. */
  buildId: string,
  selector: string,
  meta: ChartMeta,
  timing: {
    duration: number
    easing: string
    start: number
    fill: "backwards" | "none"
  }
) {
  const { duration, easing, start, fill } = timing
  const keyframes = new Map<string, string>()
  const pieces: ChartPiece[] = []
  const run = (name: string, ms: number, delay: number) =>
    `${name} ${ms}ms ${easing} ${delay}ms 1 ${fill}`
  const key = (name: string, body: string) => {
    const full = `vx-${scope}-${name}`
    keyframes.set(full, body)
    return full
  }
  const late = () => key("fade-late", FADE_LATE)

  if (meta.kind === "bar" || meta.kind === "bar-horizontal") {
    const horizontal = meta.kind === "bar-horizontal"
    const count = Math.max(1, meta.categories)
    // Bars start spread over the first half and each grows for the second. The
    // stagger is inside each bar's keyframes, so every bar starts with the part
    // and waits at its first frame, even where nothing holds that frame for it.
    const barMs = count > 1 ? duration / 2 : duration
    const step = count > 1 ? (duration - barMs) / (count - 1) : 0
    const percent = (ms: number) => +((ms / duration) * 100).toFixed(4)
    const origin = horizontal ? "0% 50%" : "50% 100%"
    const axis = horizontal ? "X" : "Y"
    pieces.push(
      {
        selector: `${selector} .recharts-bar-rectangle`,
        declarations: `transform-box:fill-box;transform-origin:${origin}`,
      },
      {
        selector: `${selector} .recharts-label-list`,
        animation: run(late(), duration, start),
      }
    )
    for (let index = 0; index < count; index++) {
      const from = percent(index * step)
      const to = percent(index * step + barMs)
      const grow = key(
        `${buildId}-grow-${index}`,
        `0%${from > 0 ? `,${from}%` : ""}{transform:scale${axis}(0);animation-timing-function:${easing}}${to}%,100%{transform:scale${axis}(1)}`
      )
      pieces.push({
        selector: `${selector} .recharts-bar-rectangle:nth-child(${index + 1})`,
        animation: `${grow} ${duration}ms linear ${start}ms 1 ${fill}`,
      })
    }
  } else if (meta.kind === "line") {
    const draw = key(
      "draw-stroke",
      "from{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:var(--vx-len)}to{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:0}"
    )
    pieces.push(
      {
        selector: `${selector} .recharts-line-curve`,
        animation: run(draw, duration, start),
      },
      {
        selector: `${selector} :is(.recharts-line-dots,.recharts-label-list)`,
        animation: run(late(), duration, start),
      }
    )
  } else if (meta.kind === "area") {
    const wipe = key("wipe-in", WIPE_FRAMES)
    pieces.push(
      {
        selector: `${selector} .recharts-area`,
        animation: run(wipe, duration, start),
      },
      {
        selector: `${selector} .recharts-label-list`,
        animation: run(late(), duration, start),
      }
    )
  } else if (meta.kind === "pie") {
    const sweep = key("sweep", "from{--vx-sweep:0deg}to{--vx-sweep:360deg}")
    // The mask is permanent but the angle returns to 360deg when the
    // animation ends, so the finished chart is whole.
    pieces.push({
      selector: `${selector} .recharts-surface`,
      declarations:
        "mask-image:conic-gradient(from 0deg at 50% 50%,#000 var(--vx-sweep),transparent var(--vx-sweep))",
      animation: run(sweep, duration, start),
    })
  } else {
    const open = key(
      "radar-open",
      "from{opacity:0;transform:scale(0)}to{opacity:1;transform:none}"
    )
    pieces.push({
      selector: `${selector} .recharts-radar`,
      declarations: "transform-box:view-box;transform-origin:50% 50%",
      animation: run(open, duration, start),
    })
  }

  return { pieces, keyframes }
}

/**
 * The CSS that plays a slide's animations. Class and keyframe names carry a
 * per-slide scope, and the class a per-run number, so slides never collide
 * and a new run restarts the animations.
 */

/**
 * Visible exactly within the element's spans. Each keyframe holds its value
 * until the next (`step-end`), so the element switches at the boundaries
 * rather than fading through them.
 */
function visibilityFrames(entry: TimelineEntry, durationMs: number) {
  const states = new Map<number, "visible" | "hidden">([[0, "hidden"]])
  for (const span of entry.spans) {
    states.set(span.start, "visible")
    if (span.end < durationMs) states.set(span.end, "hidden")
  }
  const times = [...states.keys()].sort((a, b) => a - b)
  const last = states.get(times[times.length - 1])!
  const frame = (percent: number, state: string) =>
    `${+percent.toFixed(4)}%{visibility:${state};animation-timing-function:step-end}`
  return [
    ...times.map((time) => frame((time / durationMs) * 100, states.get(time)!)),
    ...(times[times.length - 1] < durationMs ? [frame(100, last)] : []),
  ].join("")
}

/**
 * The CSS that plays a slide's timing. Class and keyframe names carry a
 * per-slide scope, and the class a per-run number, so slides never collide
 * and a new run restarts the animations.
 *
 * The element is held hidden outside its spans; each span's entrance plays
 * from its start and its exit ends exactly at its end.
 */
export function buildAnimationCss(
  scope: string,
  run: number,
  timeline: Timeline,
  options: { pausedAt?: number } = {}
) {
  const { pausedAt } = options
  const { durationMs } = timeline
  const classes: Record<string, string> = {}
  const keyframes = new Map<string, string>()
  const registrations = new Map<string, string>()
  const wrapper = new Map<string, string[]>()
  const drawn = new Map<string, string[]>()
  const declared = new Map<string, string[]>()
  const strokes = new Map<string, string[]>()
  // A chart's pieces can be built by several parts, so each piece's animations
  // are gathered into one list before its rule is written.
  const chartPieces = new Map<
    string,
    { declarations: Set<string>; animations: string[] }
  >()
  const push = (map: Map<string, string[]>, id: string, value: string) =>
    map.set(id, [...(map.get(id) ?? []), value])
  const paused = pausedAt === undefined ? "" : ";animation-play-state:paused"
  // Held at a moment: every animation is paused at its start with its delay
  // shifted, which leaves it exactly `pausedAt` into the slide.
  const at = (ms: number) => ms - (pausedAt ?? 0)
  // The slide's own class sits on the element that carries the scope.
  const target = (id: string) =>
    id === ROOT_NODE
      ? `.vx-${scope}.${classes[id]}`
      : `.vx-${scope} .${classes[id]}`

  for (const entry of timeline.entries) {
    if (!isTimed(entry, durationMs)) continue
    const className = `a-${entry.id}-${run}`
    classes[entry.id] = className

    if (entry.tracks.length > 0) {
      const compiled = compileTracks({
        scope,
        id: entry.id,
        tracks: entry.tracks,
        values: entry.values ?? {},
        durationMs,
        delay: at(0),
      })
      for (const [name, body] of compiled.keyframes) keyframes.set(name, body)
      for (const [name, body] of compiled.registrations)
        registrations.set(name, body)
      for (const value of compiled.animations) push(wrapper, entry.id, value)
      for (const value of compiled.declarations) push(declared, entry.id, value)
      for (const value of compiled.drawn) push(strokes, entry.id, value)
    }

    const visible =
      entry.spans.length === 1 &&
      entry.spans[0].start === 0 &&
      entry.spans[0].toEnd
    if (!visible) {
      const name = `vx-${scope}-visible-${entry.id}`
      keyframes.set(name, visibilityFrames(entry, durationMs))
      push(
        wrapper,
        entry.id,
        `${name} ${durationMs}ms linear ${at(0)}ms 1 forwards`
      )
    }

    entry.spans.forEach((span, index) => {
      const sides = [
        { side: "enter", transition: span.enter },
        { side: "exit", transition: span.exit },
      ] as const
      for (const { side, transition } of sides) {
        if (transition.preset === "none") continue
        const definition =
          PRESETS_BY_ID[transition.preset as PresetDefinition["id"]]
        const duration = Math.min(transition.duration, span.end - span.start)
        const start = side === "enter" ? span.start : span.end - duration
        const easing = definition.stepped
          ? `steps(${stepCount(entry.text)},end)`
          : EASINGS[transition.easing].css
        // Before it starts the element is hidden by the visibility frames, and
        // after it ends the next span or the visibility frames take over, so
        // a transition only holds a frame where nothing else will: the first
        // entrance shows its first frame from the beginning, and an exit at
        // the very end of the slide stays put.
        const fill =
          side === "enter"
            ? index === 0
              ? "backwards"
              : "none"
            : span.toEnd && index === entry.spans.length - 1
              ? "forwards"
              : "none"
        const timing = `${duration}ms ${easing} ${at(start)}ms 1 ${fill}`

        if (definition.frames) {
          const name = `vx-${scope}-${definition.id}`
          keyframes.set(name, definition.frames)
          push(wrapper, entry.id, `${name} ${timing}`)
        }
        if (definition.build && entry.chart) {
          const built = chartBuildCss(
            scope,
            `${entry.id}-${index}`,
            `.vx-${scope} .${className}`,
            entry.chart,
            {
              duration,
              easing,
              start: at(start),
              fill: fill as "backwards" | "none",
            }
          )
          for (const piece of built.pieces) {
            const merged = chartPieces.get(piece.selector) ?? {
              declarations: new Set<string>(),
              animations: [] as string[],
            }
            if (piece.declarations) merged.declarations.add(piece.declarations)
            if (piece.animation) merged.animations.push(piece.animation)
            chartPieces.set(piece.selector, merged)
          }
          for (const [name, body] of built.keyframes) keyframes.set(name, body)
        }
        if (definition.draw) {
          const stroke = `vx-${scope}-draw-stroke`
          const fillName = `vx-${scope}-draw-fill`
          keyframes.set(
            stroke,
            "from{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:var(--vx-len)}to{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:0}"
          )
          keyframes.set(fillName, "0%,55%{fill-opacity:0}100%{fill-opacity:1}")
          push(drawn, entry.id, `${stroke} ${timing}`)
          push(drawn, entry.id, `${fillName} ${timing}`)
        }
      }
    })
  }

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

  if (rules.length === 0) return { css: "", classes }

  const frames = [...keyframes].map(
    ([name, body]) => `@keyframes ${name}{${body}}`
  )
  // Registered so the pie's sweep angle can animate. At rest it is a full turn.
  if (frames.some((frame) => frame.includes("--vx-sweep")))
    registrations.set(
      "--vx-sweep",
      '@property --vx-sweep{syntax:"<angle>";inherits:false;initial-value:360deg}'
    )
  return {
    css: `${[...registrations.values()].join("")}@media (prefers-reduced-motion:no-preference){${rules.join("")}${frames.join("")}}`,
    classes,
  }
}

export const PRESET_LABELS = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset.label])
) as Record<AnimationPreset, string>
