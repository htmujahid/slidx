import { ROOT_NODE } from "@craftjs/core"

import {
  BLANK_SLIDE_JSON,
  rootNode,
  shapeNode,
  textNode,
} from "@/lib/editor/slides"

export type SlideTemplate = {
  id: string
  label: string
  json: string
}

const MUTED = "#737373"
const ACCENT = "#6366f1"

const textHeight = (fontSize: number, lines = 1) =>
  Math.round(fontSize * 1.2 * lines)

const slide = (nodes: Record<string, unknown>) =>
  JSON.stringify({ [ROOT_NODE]: rootNode(Object.keys(nodes)), ...nodes })

const title = (overrides: Record<string, unknown> = {}) =>
  textNode({
    text: "Click to add title",
    x: 120,
    y: 90,
    width: 1680,
    height: textHeight(88),
    fontSize: 88,
    fontWeight: 700,
    ...overrides,
  })

const body = (overrides: Record<string, unknown> = {}) =>
  textNode({
    text: "Click to add text",
    x: 120,
    y: 280,
    width: 1680,
    height: textHeight(44),
    fontSize: 44,
    fill: MUTED,
    ...overrides,
  })

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  { id: "blank", label: "Blank", json: BLANK_SLIDE_JSON },
  {
    id: "title-slide",
    label: "Title slide",
    json: slide({
      title: title({
        x: 160,
        y: 400,
        width: 1600,
        height: textHeight(120),
        fontSize: 120,
        align: "center",
      }),
      subtitle: body({
        text: "Click to add subtitle",
        x: 160,
        y: 600,
        width: 1600,
        height: textHeight(48),
        fontSize: 48,
        align: "center",
      }),
    }),
  },
  {
    id: "title-content",
    label: "Title and content",
    json: slide({ title: title(), content: body() }),
  },
  {
    id: "section-header",
    label: "Section header",
    json: slide({
      title: title({ y: 420, height: textHeight(112), fontSize: 112 }),
      accent: shapeNode({
        kind: "rectangle",
        x: 120,
        y: 600,
        width: 320,
        height: 20,
        fill: ACCENT,
        strokeWidth: 0,
      }),
      subtitle: body({ y: 680 }),
    }),
  },
  {
    id: "two-content",
    label: "Two content",
    json: slide({
      title: title(),
      left: body({ width: 810 }),
      right: body({ x: 990, width: 810 }),
    }),
  },
  {
    id: "comparison",
    label: "Comparison",
    json: slide({
      title: title(),
      "left-heading": body({
        text: "First option",
        y: 260,
        width: 810,
        height: textHeight(56),
        fontSize: 56,
        fontWeight: 700,
        fill: ACCENT,
        align: "center",
      }),
      left: body({ y: 390, width: 810 }),
      "right-heading": body({
        text: "Second option",
        x: 990,
        y: 260,
        width: 810,
        height: textHeight(56),
        fontSize: 56,
        fontWeight: 700,
        fill: ACCENT,
        align: "center",
      }),
      right: body({ x: 990, y: 390, width: 810 }),
    }),
  },
  {
    id: "title-only",
    label: "Title only",
    json: slide({ title: title() }),
  },
]

export const getSlideTemplate = (id: string) =>
  SLIDE_TEMPLATES.find((template) => template.id === id)

type TemplateBounds = {
  x: number
  y: number
  width: number
  height: number
  fill?: string
}

export function getTemplateBounds(json: string): TemplateBounds[] {
  const nodes = JSON.parse(json) as Record<
    string,
    { type: { resolvedName: string }; props: TemplateBounds }
  >
  return Object.entries(nodes)
    .filter(([id]) => id !== ROOT_NODE)
    .map(([, node]) => ({
      x: node.props.x,
      y: node.props.y,
      width: node.props.width,
      height: node.props.height,
      fill: node.type.resolvedName === "Shape" ? node.props.fill : undefined,
    }))
}
