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
  | "pulse"

export type AnimationEasing =
  "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "spring"

/** When an element starts, relative to the slide appearing or the layer below. */
export type AnimationTrigger = "enter" | "with-previous" | "after-previous"

export type ElementAnimation = {
  preset: AnimationPreset
  trigger: AnimationTrigger
  /** Milliseconds. */
  duration: number
  /** Milliseconds, added to the start time the trigger works out. */
  delay: number
  easing: AnimationEasing
  /** Emphasis presets only. 0 repeats forever. */
  repeat: number
}

export const DEFAULT_ANIMATION: ElementAnimation = {
  preset: "none",
  trigger: "enter",
  duration: 600,
  delay: 0,
  easing: "ease-out",
  repeat: 2,
}

export const EASINGS: Record<AnimationEasing, { label: string; css: string }> =
  {
    linear: { label: "Linear", css: "linear" },
    ease: { label: "Ease", css: "ease" },
    "ease-in": { label: "Ease in", css: "ease-in" },
    "ease-out": { label: "Ease out", css: "ease-out" },
    "ease-in-out": { label: "Ease in-out", css: "ease-in-out" },
    spring: { label: "Spring", css: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  }

export const TRIGGERS: Record<AnimationTrigger, string> = {
  enter: "When the slide appears",
  "with-previous": "With the previous",
  "after-previous": "After the previous",
}

const DISTANCE = 160
const DRAWN_ELEMENTS = "path,rect,circle,ellipse,line,polygon,polyline"
const MAX_TYPEWRITER_STEPS = 80

type PresetDefinition = {
  id: Exclude<AnimationPreset, "none">
  label: string
  group: "entrance" | "emphasis"
  /** Node names it applies to; every element when omitted. */
  only?: string[]
  /** `@keyframes` body applied to the element's wrapper. */
  frames?: string
  /** Animates the stroke and fill of the drawn geometry instead. */
  draw?: boolean
  /** Reveals in discrete steps, one per character. */
  stepped?: boolean
  emphasis?: boolean
}

const slideFrames = (axis: "X" | "Y", sign: 1 | -1) =>
  `from{opacity:0;transform:translate${axis}(${sign * DISTANCE}px)}to{opacity:1;transform:none}`

/* A left-to-right reveal. The generous negative insets keep shadows and
   outer stroke halves from being clipped once it has finished. */
const WIPE_FRAMES =
  "from{clip-path:inset(-200px 100% -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

/* Same reveal, but between the measured text edges (--vx-text-l / -r) rather
   than across the whole box; unmeasured it falls back to the box. */
const TYPEWRITER_FRAMES =
  "from{clip-path:inset(-200px calc(100% - var(--vx-text-l,0px)) -200px -200px)}99.9%{clip-path:inset(-200px calc(100% - var(--vx-text-r,100%)) -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

export const PRESETS: PresetDefinition[] = [
  {
    id: "fade-in",
    label: "Fade in",
    group: "entrance",
    frames: "from{opacity:0}to{opacity:1}",
  },
  {
    id: "slide-in-left",
    label: "Slide in from left",
    group: "entrance",
    frames: slideFrames("X", -1),
  },
  {
    id: "slide-in-right",
    label: "Slide in from right",
    group: "entrance",
    frames: slideFrames("X", 1),
  },
  {
    id: "slide-in-up",
    label: "Slide in from bottom",
    group: "entrance",
    frames: slideFrames("Y", 1),
  },
  {
    id: "slide-in-down",
    label: "Slide in from top",
    group: "entrance",
    frames: slideFrames("Y", -1),
  },
  {
    id: "zoom-in",
    label: "Zoom in",
    group: "entrance",
    frames: "from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}",
  },
  {
    id: "blur-in",
    label: "Blur in",
    group: "entrance",
    frames: "from{opacity:0;filter:blur(24px)}to{opacity:1;filter:blur(0)}",
  },
  {
    id: "bounce-in",
    label: "Bounce in",
    group: "entrance",
    frames:
      "0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.08)}70%{transform:scale(.94)}100%{opacity:1;transform:none}",
  },
  {
    id: "wipe-in",
    label: "Wipe in",
    group: "entrance",
    frames: WIPE_FRAMES,
  },
  {
    id: "typewriter",
    label: "Typewriter",
    group: "entrance",
    only: ["TextBox"],
    frames: TYPEWRITER_FRAMES,
    stepped: true,
  },
  {
    id: "draw",
    label: "Draw on",
    group: "entrance",
    only: ["Shape", "IconBox", "ArrowLine"],
    draw: true,
  },
  {
    id: "pulse",
    label: "Pulse",
    group: "emphasis",
    frames: "0%,100%{transform:scale(1)}50%{transform:scale(1.08)}",
    emphasis: true,
  },
]

const PRESETS_BY_ID = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset])
) as Record<PresetDefinition["id"], PresetDefinition>

export function presetsFor(nodeName: string) {
  return PRESETS.filter(
    (preset) => !preset.only || preset.only.includes(nodeName)
  )
}

export const isEmphasis = (preset: AnimationPreset) =>
  preset !== "none" && Boolean(PRESETS_BY_ID[preset]?.emphasis)

export type TimelineInput = {
  id: string
  /** The node type, e.g. "TextBox". */
  name: string
  animation?: Partial<ElementAnimation>
  /** Plain text, used to size the typewriter's steps. */
  text?: string
}

export type TimelineEntry = {
  id: string
  name: string
  animation: ElementAnimation
  text?: string
  /** Milliseconds from the slide appearing. */
  start: number
  end: number
}

/**
 * Works out when each animated element starts. Elements are taken in the
 * order given (layer order, bottom to top); `with-previous` and
 * `after-previous` refer to the animated element before it.
 */
export function buildTimeline(inputs: TimelineInput[]) {
  const entries: TimelineEntry[] = []
  let previousStart = 0
  let previousEnd = 0

  for (const input of inputs) {
    const animation = { ...DEFAULT_ANIMATION, ...input.animation }
    const definition =
      animation.preset === "none" ? undefined : PRESETS_BY_ID[animation.preset]
    if (!definition) continue
    if (definition.only && !definition.only.includes(input.name)) continue

    const delay = Math.max(0, animation.delay)
    const start =
      animation.trigger === "enter"
        ? delay
        : animation.trigger === "with-previous"
          ? previousStart + delay
          : previousEnd + delay
    const cycles = definition.emphasis ? animation.repeat || 1 : 1
    const end = start + Math.max(0, animation.duration) * cycles

    entries.push({
      id: input.id,
      name: input.name,
      animation,
      text: input.text,
      start,
      end,
    })
    previousStart = start
    previousEnd = end
  }

  return {
    entries,
    totalMs: entries.reduce((latest, entry) => Math.max(latest, entry.end), 0),
  }
}

export type Timeline = ReturnType<typeof buildTimeline>

const stepCount = (text = "") =>
  Math.min(
    Math.max(Array.from(text.replace(/\s+/g, " ").trim()).length, 4),
    MAX_TYPEWRITER_STEPS
  )

/**
 * The CSS that plays a slide's animations. Class and keyframe names carry a
 * per-slide scope, and the class a per-run number, so slides never collide
 * and a new run restarts the animations.
 */
export function buildAnimationCss(
  scope: string,
  run: number,
  timeline: Timeline,
  options: { pausedAt?: number } = {}
) {
  const { pausedAt } = options
  const classes: Record<string, string> = {}
  const keyframes = new Map<string, string>()
  const rules: string[] = []

  for (const entry of timeline.entries) {
    const definition =
      PRESETS_BY_ID[entry.animation.preset as PresetDefinition["id"]]
    const className = `a-${entry.id}-${run}`
    classes[entry.id] = className
    const selector = `.vx-${scope} .${className}`

    const easing = definition.stepped
      ? `steps(${stepCount(entry.text)},end)`
      : EASINGS[entry.animation.easing].css
    const iterations = definition.emphasis
      ? entry.animation.repeat === 0
        ? "infinite"
        : entry.animation.repeat
      : 1
    // Backwards fill shows the first frame during the delay and then hands
    // control back to the element, so the finished state is the plain one.
    // Held at a moment: every animation is paused at its start with its delay
    // shifted, which leaves it exactly `pausedAt` into the slide.
    const delay = pausedAt === undefined ? entry.start : entry.start - pausedAt
    const paused = pausedAt === undefined ? "" : ";animation-play-state:paused"
    const timing = `${entry.animation.duration}ms ${easing} ${delay}ms ${iterations} backwards`

    if (definition.frames) {
      const name = `vx-${scope}-${definition.id}`
      keyframes.set(name, definition.frames)
      rules.push(
        `${selector}{transform-box:fill-box;transform-origin:center;animation:${name} ${timing}${paused}}`
      )
    }
    if (definition.draw) {
      const stroke = `vx-${scope}-draw-stroke`
      const fill = `vx-${scope}-draw-fill`
      keyframes.set(
        stroke,
        "from{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:var(--vx-len)}to{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:0}"
      )
      keyframes.set(fill, "0%,55%{fill-opacity:0}100%{fill-opacity:1}")
      rules.push(
        `${selector} :is(${DRAWN_ELEMENTS}){animation:${stroke} ${timing},${fill} ${timing}${paused}}`
      )
    }
  }

  if (rules.length === 0) return { css: "", classes }

  const frames = [...keyframes].map(
    ([name, body]) => `@keyframes ${name}{${body}}`
  )
  return {
    css: `@media (prefers-reduced-motion:no-preference){${rules.join("")}${frames.join("")}}`,
    classes,
  }
}

export const PRESET_LABELS = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset.label])
) as Record<AnimationPreset, string>
