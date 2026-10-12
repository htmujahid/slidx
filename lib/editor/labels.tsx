import * as React from "react"
import {
  CodeIcon,
  GroupIcon,
  ImageIcon,
  MoveDownRightIcon,
  PresentationIcon,
  SmileIcon,
  SquareFunctionIcon,
  TableIcon,
  TypeIcon,
} from "lucide-react"

import { CHARTS_BY_KIND, type ChartKind } from "@/lib/editor/chart"
import { DEFAULT_ICON, ICONS } from "@/lib/editor/icons"
import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"
import { ShapePreview } from "@/components/editor/shape-preview"

type NodeLike = { name: string; props: Record<string, unknown> }

const EDITABLE_NODES = new Set(["TextBox", "Table", "CodeBlock", "Equation"])

export function canEditContent({ name, props }: NodeLike) {
  if (name === "Shape")
    return Boolean(SHAPES_BY_KIND[props.kind as ShapeKind]?.filled)
  return EDITABLE_NODES.has(name)
}

export function getElementLabel({ name, props }: NodeLike) {
  const customName = typeof props.name === "string" ? props.name.trim() : ""
  if (customName) return customName
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
    case "Group":
      return "Group"
    case "IconBox":
      return `Icon · ${props.icon ?? "star"}`
    case "EmojiBox":
      return `Emoji ${props.emoji ?? ""}`.trim()
    case "ArrowLine":
      return "Diagonal arrow"
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
    case "Slide":
      return <PresentationIcon className={className} />
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
    case "Group":
      return <GroupIcon className={className} />
    case "IconBox": {
      const Icon = ICONS[String(props.icon)] ?? ICONS[DEFAULT_ICON]
      return <Icon className={className} />
    }
    case "EmojiBox":
      return <SmileIcon className={className} />
    case "ArrowLine":
      return <MoveDownRightIcon className={className} />
    default:
      return <TypeIcon className={className} />
  }
}
