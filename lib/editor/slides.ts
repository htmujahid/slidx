import { ROOT_NODE } from "@craftjs/core"

export type SlideData = {
  id: string
  json: string
}

export const rootNode = (children: string[]) => ({
  type: { resolvedName: "Slide" },
  isCanvas: true,
  props: { background: "#ffffff" },
  displayName: "Slide",
  custom: {},
  hidden: false,
  nodes: children,
  linkedNodes: {},
})

export const textNode = (props: Record<string, unknown>) => ({
  type: { resolvedName: "TextBox" },
  isCanvas: false,
  props,
  displayName: "Text",
  custom: { handles: "horizontal" },
  parent: ROOT_NODE,
  hidden: false,
  nodes: [],
  linkedNodes: {},
})

export const shapeNode = (props: Record<string, unknown>) => ({
  type: { resolvedName: "Shape" },
  isCanvas: false,
  props,
  displayName: "Shape",
  custom: { handles: "all" },
  parent: ROOT_NODE,
  hidden: false,
  nodes: [],
  linkedNodes: {},
})

export const BLANK_SLIDE_JSON = JSON.stringify({ [ROOT_NODE]: rootNode([]) })

export const INITIAL_SLIDE_JSON = JSON.stringify({
  [ROOT_NODE]: rootNode(["welcome-title", "welcome-subtitle", "welcome-shape"]),
  "welcome-title": textNode({
    text: "Welcome to Slidx",
    x: 160,
    y: 380,
    width: 1600,
    height: 173,
    fontSize: 144,
    fontWeight: 700,
    align: "center",
  }),
  "welcome-subtitle": textNode({
    text: "Use the Insert menu to add shapes, text and more",
    x: 160,
    y: 580,
    width: 1600,
    height: 58,
    fontSize: 48,
    fill: "#737373",
    align: "center",
  }),
  "welcome-shape": shapeNode({
    kind: "ellipse",
    x: 860,
    y: 220,
    width: 200,
    height: 100,
  }),
})

export const createSlideId = () => crypto.randomUUID()
