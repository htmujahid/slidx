import {
  slideFrames,
  slideOutFrames,
  TYPEWRITER_FRAMES,
  WIPE_FRAMES,
  WIPE_OUT_FRAMES,
} from "@/lib/editor/animation/frames"
import type {
  AnimationPreset,
  TransitionSide,
} from "@/lib/editor/animation/timing"

export type PresetDefinition = {
  id: Exclude<AnimationPreset, "none">
  label: string
  group: "enter" | "exit"
  only?: string[]
  frames?: string
  draw?: boolean
  build?: boolean
  stepped?: boolean
}

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

export const PRESETS_BY_ID = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset])
) as Record<PresetDefinition["id"], PresetDefinition>

export const hasEasing = (preset: AnimationPreset) =>
  preset !== "none" && !PRESETS_BY_ID[preset].stepped

export function presetsFor(nodeName: string, side: TransitionSide) {
  return PRESETS.filter(
    (preset) =>
      preset.group === side && (!preset.only || preset.only.includes(nodeName))
  )
}

export const PRESET_LABELS = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset.label])
) as Record<AnimationPreset, string>
