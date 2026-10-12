export type AnimationEasing =
  "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "spring"

export const EASINGS: Record<AnimationEasing, { label: string; css: string }> =
  {
    linear: { label: "Linear", css: "linear" },
    ease: { label: "Ease", css: "ease" },
    "ease-in": { label: "Ease in", css: "ease-in" },
    "ease-out": { label: "Ease out", css: "ease-out" },
    "ease-in-out": { label: "Ease in-out", css: "ease-in-out" },
    spring: { label: "Spring", css: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  }
