import type * as React from "react"
import {
  ChartAreaIcon,
  ChartBarIcon,
  ChartColumnIcon,
  ChartLineIcon,
  ChartPieIcon,
  RadarIcon,
} from "lucide-react"

export type ChartKind =
  "bar" | "bar-horizontal" | "line" | "area" | "pie" | "radar"

export type ChartSeries = { name: string; color: string }

export type ChartRow = { label: string; values: number[] }

type IconComponent = React.ComponentType<{ className?: string }>

export const CHART_KINDS: {
  kind: ChartKind
  label: string
  icon: IconComponent
}[] = [
  { kind: "bar", label: "Bar chart", icon: ChartColumnIcon },
  { kind: "bar-horizontal", label: "Horizontal bar chart", icon: ChartBarIcon },
  { kind: "line", label: "Line chart", icon: ChartLineIcon },
  { kind: "area", label: "Area chart", icon: ChartAreaIcon },
  { kind: "pie", label: "Pie chart", icon: ChartPieIcon },
  { kind: "radar", label: "Radar chart", icon: RadarIcon },
]

export const CHARTS_BY_KIND = Object.fromEntries(
  CHART_KINDS.map((entry) => [entry.kind, entry])
) as Record<ChartKind, (typeof CHART_KINDS)[number]>

export const MAX_CHART_SERIES = 6
export const MAX_CHART_ROWS = 12

export const CHART_PALETTE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
]

export const seriesColor = (index: number) =>
  CHART_PALETTE[index % CHART_PALETTE.length]

export const sliceColor = (index: number) => CHART_PALETTE[index] ?? "#a1a1aa"

export const DEFAULT_CHART_SERIES: ChartSeries[] = [
  { name: "Desktop", color: CHART_PALETTE[0] },
  { name: "Mobile", color: CHART_PALETTE[1] },
]

export const DEFAULT_CHART_ROWS: ChartRow[] = [
  { label: "Jan", values: [186, 80] },
  { label: "Feb", values: [305, 200] },
  { label: "Mar", values: [237, 120] },
  { label: "Apr", values: [73, 190] },
  { label: "May", values: [209, 130] },
  { label: "Jun", values: [214, 140] },
]
