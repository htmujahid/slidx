import { ROOT_NODE } from "@craftjs/core"

import type { EditOperation } from "@/lib/ai/edit-schema"
import {
  BLANK_SLIDE_JSON,
  createSlideId,
  type SlideData,
} from "@/lib/editor/slides"

type Node = {
  type: { resolvedName: string }
  isCanvas: boolean
  props: Record<string, unknown>
  displayName: string
  custom: Record<string, unknown>
  parent?: string
  hidden: boolean
  nodes: string[]
  linkedNodes: Record<string, string>
}

type Tree = Record<string, Node>

// Mirrors each element's `craft` definition so created nodes look like the
// ones the editor makes.
const NODE_META: Record<string, { displayName: string; handles: string }> = {
  TextBox: { displayName: "Text", handles: "horizontal" },
  Shape: { displayName: "Shape", handles: "all" },
  Table: { displayName: "Table", handles: "all" },
  ChartBox: { displayName: "Chart", handles: "all" },
  IconBox: { displayName: "Icon", handles: "all" },
  EmojiBox: { displayName: "Emoji", handles: "all" },
  Equation: { displayName: "Equation", handles: "all" },
  CodeBlock: { displayName: "Code", handles: "horizontal" },
  ArrowLine: { displayName: "ArrowLine", handles: "all" },
}

function parseProps(raw: string | undefined) {
  if (!raw) return {}
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("props must be a JSON object")
  }
  return value as Record<string, unknown>
}

// Rich text wins over plain text, so a new `text` must clear it.
function normalize(props: Record<string, unknown>) {
  if ("text" in props && !("html" in props)) props.html = ""
  return props
}

function descendants(tree: Tree, id: string): string[] {
  return [id, ...(tree[id]?.nodes ?? []).flatMap((c) => descendants(tree, c))]
}

function applyToTree(tree: Tree, op: EditOperation) {
  const root = tree[ROOT_NODE]

  if (op.op === "update_slide") {
    root.props = { ...root.props, ...parseProps(op.props) }
    return
  }

  if (op.op === "add_element") {
    const meta = op.elementType && NODE_META[op.elementType]
    if (!op.elementType || !meta)
      throw new Error("add_element needs an elementType")
    const id = createSlideId()
    tree[id] = {
      type: { resolvedName: op.elementType },
      isCanvas: false,
      props: normalize(parseProps(op.props)),
      displayName: meta.displayName,
      custom: { handles: meta.handles },
      parent: ROOT_NODE,
      hidden: false,
      nodes: [],
      linkedNodes: {},
    }
    root.nodes.push(id)
    return
  }

  const node = op.elementId ? tree[op.elementId] : undefined
  if (!op.elementId || !node || op.elementId === ROOT_NODE) {
    throw new Error(`Element ${op.elementId ?? "(none)"} not found`)
  }

  if (op.op === "update_element") {
    node.props = { ...node.props, ...normalize(parseProps(op.props)) }
    return
  }

  // delete_element
  const parent = tree[node.parent ?? ROOT_NODE]
  parent.nodes = parent.nodes.filter((id) => id !== op.elementId)
  for (const id of descendants(tree, op.elementId)) delete tree[id]
}

export type ApplyResult = { slides: SlideData[]; errors: string[] }

// Applies the operations in order. A failing operation is skipped and
// reported; the rest still apply.
export function applyOperations(
  slides: SlideData[],
  operations: EditOperation[]
): ApplyResult {
  let next = slides
  const errors: string[] = []

  operations.forEach((op, index) => {
    try {
      if (op.op === "add_slide") {
        const position = Math.max(1, Math.min(op.slide, next.length + 1)) - 1
        const created: SlideData = {
          id: createSlideId(),
          json: BLANK_SLIDE_JSON,
        }
        if (op.props) {
          const tree = JSON.parse(created.json) as Tree
          applyToTree(tree, { ...op, op: "update_slide" })
          created.json = JSON.stringify(tree)
        }
        next = [...next.slice(0, position), created, ...next.slice(position)]
        return
      }

      const target = next[op.slide - 1]
      if (!target) throw new Error(`Slide ${op.slide} not found`)

      if (op.op === "delete_slide") {
        if (next.length <= 1) throw new Error("Cannot delete the only slide")
        next = next.filter((slide) => slide !== target)
        return
      }

      const tree = JSON.parse(target.json) as Tree
      applyToTree(tree, op)
      const json = JSON.stringify(tree)
      next = next.map((slide) =>
        slide === target ? { ...slide, json } : slide
      )
    } catch (error) {
      errors.push(
        `Step ${index + 1} (${op.op}): ${error instanceof Error ? error.message : "failed"}`
      )
    }
  })

  return { slides: next, errors }
}

const LABELS: Record<EditOperation["op"], string> = {
  update_element: "Update",
  add_element: "Insert",
  delete_element: "Delete",
  update_slide: "Update slide",
  add_slide: "Add slide",
  delete_slide: "Delete slide",
}

export type OperationSummary = { label: string; detail: string }

// One readable line per operation, for the review card.
export function summarizeOperation(
  op: EditOperation,
  slides: SlideData[]
): OperationSummary {
  let target = ""
  try {
    const node = op.elementId
      ? (JSON.parse(slides[op.slide - 1]?.json ?? "{}") as Tree)[op.elementId]
      : undefined
    if (node) {
      const text = node.props.text
      target =
        typeof text === "string" && text
          ? `${node.displayName} “${text.slice(0, 40)}”`
          : node.displayName
    }
  } catch {}

  let changes = ""
  try {
    changes = Object.entries(parseProps(op.props))
      .filter(([key]) => key !== "html")
      .map(([key, value]) =>
        typeof value === "object"
          ? key
          : `${key}: ${String(value).slice(0, 40)}`
      )
      .join(", ")
  } catch {}

  const subject =
    op.op === "add_element"
      ? (op.elementType ?? "element")
      : target || (op.elementId ?? "")

  return {
    label: LABELS[op.op],
    detail: [`Slide ${op.slide}`, subject, changes].filter(Boolean).join(" · "),
  }
}
