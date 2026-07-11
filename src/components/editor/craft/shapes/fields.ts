import type { FieldDef } from "../field-def"

export const paintFields: FieldDef[] = [
  { type: "color", key: "fill", label: "Fill" },
  { type: "color", key: "stroke", label: "Stroke" },
  { type: "slider", key: "strokeWidth", label: "Stroke width", max: 20, unit: "px" },
  { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
]

export const strokeFields: FieldDef[] = [
  { type: "color", key: "stroke", label: "Stroke" },
  { type: "slider", key: "strokeWidth", label: "Stroke width", min: 1, max: 20, unit: "px" },
  { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
]
