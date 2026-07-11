import {
  BlendIcon,
  EclipseIcon,
  FilterIcon,
  Grid2x2Icon,
  NavigationIcon,
  ScissorsIcon,
} from "lucide-react"

import { SvgClipPath } from "./svg-clip-path"
import { SvgDefs } from "./svg-defs"
import { SvgFilter } from "./svg-filter"
import { SvgLinearGradient } from "./svg-linear-gradient"
import { SvgMarker } from "./svg-marker"
import { SvgMask } from "./svg-mask"
import { SvgPattern } from "./svg-pattern"
import { SvgRadialGradient } from "./svg-radial-gradient"

export const EFFECT_MIME = "application/x-visx-effect"

export type DefinitionKind =
  | "filter"
  | "gradient"
  | "clip"
  | "mask"
  | "pattern"
  | "marker"

export type EffectProp =
  | "filter"
  | "fill"
  | "clipPath"
  | "mask"
  | "markerEnd"

export type DefinitionMeta = {
  kind: DefinitionKind
  icon: typeof FilterIcon
  applyProp: EffectProp
  shapeChildren?: boolean
}

const metas = new Map<unknown, DefinitionMeta>([
  [SvgFilter, { kind: "filter", icon: FilterIcon, applyProp: "filter" }],
  [SvgLinearGradient, { kind: "gradient", icon: BlendIcon, applyProp: "fill" }],
  [SvgRadialGradient, { kind: "gradient", icon: BlendIcon, applyProp: "fill" }],
  [
    SvgClipPath,
    { kind: "clip", icon: ScissorsIcon, applyProp: "clipPath", shapeChildren: true },
  ],
  [
    SvgMask,
    { kind: "mask", icon: EclipseIcon, applyProp: "mask", shapeChildren: true },
  ],
  [
    SvgPattern,
    { kind: "pattern", icon: Grid2x2Icon, applyProp: "fill", shapeChildren: true },
  ],
  [
    SvgMarker,
    {
      kind: "marker",
      icon: NavigationIcon,
      applyProp: "markerEnd",
      shapeChildren: true,
    },
  ],
])

export const EFFECT_PROPS: EffectProp[] = [
  "filter",
  "fill",
  "clipPath",
  "mask",
  "markerEnd",
]

export function definitionMeta(type: unknown) {
  return metas.get(type)
}

export function isDefinitionType(type: unknown) {
  return metas.has(type)
}

export function isDefsType(type: unknown) {
  return type === SvgDefs
}

export function buildRef(defId: string) {
  return `url(#fx-${defId})`
}

export function parseRef(value: unknown): string | null {
  if (typeof value !== "string") return null
  const match = value.match(/^url\(#fx-(.+)\)$/)
  return match ? match[1] : null
}
