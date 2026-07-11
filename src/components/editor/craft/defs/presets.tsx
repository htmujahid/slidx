import type { ReactElement } from "react"
import { Element } from "@craftjs/core"
import {
  BlendIcon,
  CircleDotIcon,
  ContrastIcon,
  CopyIcon,
  DropletIcon,
  EclipseIcon,
  Grid2x2Icon,
  NavigationIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react"

import { SvgCircle, SvgPolygon, SvgRect } from "../shapes"
import { FeColorMatrix } from "./fe-color-matrix"
import { FeDropShadow } from "./fe-drop-shadow"
import { FeGaussianBlur } from "./fe-gaussian-blur"
import { FeMerge } from "./fe-merge"
import { FeMergeNode } from "./fe-merge-node"
import { SvgClipPath } from "./svg-clip-path"
import { SvgFilter } from "./svg-filter"
import { SvgLinearGradient } from "./svg-linear-gradient"
import { SvgMarker } from "./svg-marker"
import { SvgMask } from "./svg-mask"
import { SvgPattern } from "./svg-pattern"
import { SvgRadialGradient } from "./svg-radial-gradient"

export type EffectPreset = {
  id: string
  label: string
  description: string
  icon: typeof DropletIcon
  create: (name: string) => ReactElement
}

export const effectPresets: EffectPreset[] = [
  {
    id: "blur",
    label: "Blur",
    description: "Gaussian blur filter",
    icon: DropletIcon,
    create: (name) => (
      <Element canvas is={SvgFilter} name={name}>
        <FeGaussianBlur stdDeviation={4} />
      </Element>
    ),
  },
  {
    id: "drop-shadow",
    label: "Drop shadow",
    description: "Soft offset shadow filter",
    icon: CopyIcon,
    create: (name) => (
      <Element canvas is={SvgFilter} name={name}>
        <FeDropShadow dx={2} dy={4} stdDeviation={3} floodColor="#0F172A" floodOpacity={0.4} />
      </Element>
    ),
  },
  {
    id: "glow",
    label: "Glow",
    description: "Blurred copy merged under the source",
    icon: SparklesIcon,
    create: (name) => (
      <Element canvas is={SvgFilter} name={name}>
        <FeGaussianBlur stdDeviation={6} result="blur" />
        <Element canvas is={FeMerge}>
          <FeMergeNode in="blur" />
          <FeMergeNode in="SourceGraphic" />
        </Element>
      </Element>
    ),
  },
  {
    id: "grayscale",
    label: "Grayscale",
    description: "Desaturate colors filter",
    icon: ContrastIcon,
    create: (name) => (
      <Element canvas is={SvgFilter} name={name}>
        <FeColorMatrix type="saturate" values="0" />
      </Element>
    ),
  },
  {
    id: "linear-gradient",
    label: "Linear gradient",
    description: "Two-stop gradient fill",
    icon: BlendIcon,
    create: (name) => <SvgLinearGradient name={name} />,
  },
  {
    id: "radial-gradient",
    label: "Radial gradient",
    description: "Two-stop radial fill",
    icon: CircleDotIcon,
    create: (name) => <SvgRadialGradient name={name} />,
  },
  {
    id: "clip-circle",
    label: "Circle clip",
    description: "Clip to a circular region",
    icon: ScissorsIcon,
    create: (name) => (
      <Element canvas is={SvgClipPath} name={name}>
        <Element canvas is={SvgCircle} cx={200} cy={200} r={120} />
      </Element>
    ),
  },
  {
    id: "hole-mask",
    label: "Hole mask",
    description: "Visible everywhere except a circular hole",
    icon: EclipseIcon,
    create: (name) => (
      <Element canvas is={SvgMask} name={name}>
        <Element canvas is={SvgRect} x={0} y={0} width={400} height={400} fill="#FFFFFF" />
        <Element canvas is={SvgCircle} cx={200} cy={200} r={100} fill="#000000" />
      </Element>
    ),
  },
  {
    id: "dots-pattern",
    label: "Dots pattern",
    description: "Repeating dot fill",
    icon: Grid2x2Icon,
    create: (name) => (
      <Element canvas is={SvgPattern} name={name}>
        <Element canvas is={SvgCircle} cx={10} cy={10} r={3} fill="#0F172A" />
      </Element>
    ),
  },
  {
    id: "arrowhead-marker",
    label: "Arrowhead",
    description: "Arrow marker for line ends",
    icon: NavigationIcon,
    create: (name) => (
      <Element canvas is={SvgMarker} name={name}>
        <Element
          canvas
          is={SvgPolygon}
          points="0,0 10,5 0,10"
          fill="#0F172A"
          stroke="none"
          strokeWidth={0}
        />
      </Element>
    ),
  },
]
