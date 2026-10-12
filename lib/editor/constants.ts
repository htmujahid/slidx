export const SLIDE_WIDTH = 1920
export const SLIDE_HEIGHT = 1080
export const SLIDE_ASPECT_RATIO = SLIDE_WIDTH / SLIDE_HEIGHT

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 4
export const ZOOM_STEP = 1.25

export const MIN_ELEMENT_SIZE = 16
export const NUDGE = 1
export const NUDGE_LARGE = 10
export const DUPLICATE_OFFSET = 32

export const FONT_FAMILIES = [
  { label: "Sans", value: "var(--font-sans), system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "var(--font-mono), ui-monospace, monospace" },
  { label: "Rounded", value: "'Trebuchet MS', 'Segoe UI', sans-serif" },
] as const
