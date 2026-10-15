import { ROOT_NODE } from "@craftjs/core"

import { SLIDE_DEFAULTS } from "@/lib/editor/slide-props"
import type { SlideData } from "@/lib/editor/slides"
import { DEFAULT_TRANSFORM } from "@/lib/editor/types"

type SerializedNode = {
  type: { resolvedName: string }
  props: Record<string, unknown>
  parent?: string
  nodes: string[]
}

export type AssistantFocus = { slideId: string; elementId?: string }

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const stripHtml = (html: string) =>
  html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()

// Props that still hold their default are left out: they only cost tokens.
function changedProps(
  props: Record<string, unknown>,
  defaults: Record<string, unknown>
) {
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !same(value, defaults[key]))
  )
}

function describeSlide(json: string) {
  const nodes = JSON.parse(json) as Record<string, SerializedNode>
  const root = nodes[ROOT_NODE]
  const elements: Record<string, unknown>[] = []

  // Document order is stacking order: later elements paint over earlier ones.
  const visit = (ids: string[], parent?: string) => {
    for (const id of ids) {
      const node = nodes[id]
      if (!node) continue
      const props = changedProps(node.props, DEFAULT_TRANSFORM)
      // When rich text is set it wins over `text`, so show the visible text.
      if (typeof props.html === "string" && props.html) {
        props.text = stripHtml(props.html)
      }
      delete props.html
      elements.push({ id, type: node.type.resolvedName, parent, ...props })
      visit(node.nodes, id)
    }
  }
  visit(root.nodes)

  return {
    props: changedProps(root.props, SLIDE_DEFAULTS),
    elements,
  }
}

// A readable snapshot of the deck for the model. Slides are numbered from 1,
// and every element keeps the id the edit operations refer to.
export function describeDeck({
  title,
  slides,
  activeId,
  focus,
}: {
  title: string
  slides: SlideData[]
  activeId: string
  focus: AssistantFocus[]
}) {
  const lines = [`Presentation title: ${JSON.stringify(title)}`]

  slides.forEach((slide, index) => {
    const described = describeSlide(slide.json)
    const marks = [
      slide.id === activeId ? "currently open" : null,
      focus.some((ref) => ref.slideId === slide.id && !ref.elementId)
        ? "in the user's focus"
        : null,
    ].filter(Boolean)

    lines.push(
      "",
      `## Slide ${index + 1}${marks.length ? ` (${marks.join(", ")})` : ""}`,
      `slide props (non-default only): ${JSON.stringify(described.props)}`,
      "elements, back to front:"
    )
    if (described.elements.length === 0) lines.push("(empty)")
    for (const element of described.elements) {
      const selected = focus.some(
        (ref) => ref.slideId === slide.id && ref.elementId === element.id
      )
      lines.push(
        `${JSON.stringify(element)}${selected ? "  <- user selected this" : ""}`
      )
    }
  })

  return lines.join("\n")
}
