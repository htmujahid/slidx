import * as React from "react"
import {
  CodeIcon,
  ImageIcon,
  SquareFunctionIcon,
  TableIcon,
  TypeIcon,
} from "lucide-react"

import { CHARTS_BY_KIND, type ChartKind } from "@/lib/editor/chart"
import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"
import { ShapePreview } from "@/components/editor/shape-preview"

type NodeLike = { name: string; props: Record<string, unknown> }

export function getElementLabel({ name, props }: NodeLike) {
  switch (name) {
    case "Shape":
      return SHAPES_BY_KIND[props.kind as ShapeKind]?.label ?? "Shape"
    case "TextBox":
      return (
        String(props.text ?? "")
          .split("\n")[0]
          .trim() || "Text"
      )
    case "Equation":
      return "Equation"
    case "Table":
      return `Table ${props.rows}×${props.columns}`
    case "ImageBox":
      return "Image"
    case "CodeBlock":
      return `Code · ${props.language}`
    case "ChartBox":
      return CHARTS_BY_KIND[props.kind as ChartKind]?.label ?? "Chart"
    default:
      return name
  }
}

export function ElementIcon({
  name,
  props,
  className,
}: NodeLike & { className?: string }) {
  switch (name) {
    case "Shape":
      return (
        <ShapePreview kind={props.kind as ShapeKind} className={className} />
      )
    case "Equation":
      return <SquareFunctionIcon className={className} />
    case "Table":
      return <TableIcon className={className} />
    case "ImageBox":
      return <ImageIcon className={className} />
    case "CodeBlock":
      return <CodeIcon className={className} />
    case "ChartBox": {
      const Icon = CHARTS_BY_KIND[props.kind as ChartKind]?.icon
      return Icon ? <Icon className={className} /> : null
    }
    default:
      return <TypeIcon className={className} />
  }
}
