import * as React from "react"
import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  SquareFunctionIcon,
  TableIcon,
  TypeIcon,
} from "lucide-react"

import { CHART_KINDS } from "@/lib/editor/chart"
import { measureCodeHeight } from "@/lib/editor/code"
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import type { Point } from "@/lib/editor/geometry"
import { SHAPE_CATEGORIES, SHAPES, type ShapeKind } from "@/lib/editor/shapes"
import { measureTextHeight } from "@/lib/editor/text"
import { ChartBox } from "@/components/editor/nodes/chart-box"
import { CodeBlock, DEFAULT_CODE } from "@/components/editor/nodes/code-block"
import { Equation } from "@/components/editor/nodes/equation"
import { ImageBox } from "@/components/editor/nodes/image-box"
import { Shape } from "@/components/editor/nodes/shape"
import { Table } from "@/components/editor/nodes/table"
import { TextBox } from "@/components/editor/nodes/text-box"
import { ShapePreview } from "@/components/editor/shape-preview"

export type LibraryGroup =
  "shape" | "text" | "equation" | "table" | "chart" | "code" | "media"

export const LIBRARY_GROUPS: { id: LibraryGroup; label: string }[] = [
  { id: "shape", label: "Shapes" },
  { id: "text", label: "Text" },
  { id: "equation", label: "Equation" },
  { id: "table", label: "Table" },
  { id: "chart", label: "Charts" },
  { id: "code", label: "Code" },
  { id: "media", label: "Media" },
]

type IconComponent = React.ComponentType<{ className?: string }>

export type LibraryItem = {
  id: string
  group: LibraryGroup
  label: string
  section?: string
  icon: IconComponent
  create: (at?: Point) => React.ReactElement
}

const center = (at: Point | undefined, width: number, height: number) => ({
  x: Math.round((at?.x ?? SLIDE_WIDTH / 2) - width / 2),
  y: Math.round((at?.y ?? SLIDE_HEIGHT / 2) - height / 2),
})

const SHAPE_SIZES: Partial<Record<ShapeKind, [number, number]>> = {
  line: [400, 24],
  arrow: [400, 200],
  "double-arrow": [400, 200],
  chevron: [300, 240],
  parallelogram: [360, 240],
  trapezoid: [360, 240],
  "speech-bubble": [380, 300],
  cloud: [400, 260],
}

const shapeItems: LibraryItem[] = SHAPES.map((shape) => {
  const [width, height] = SHAPE_SIZES[shape.kind] ?? [300, 300]
  return {
    id: `shape:${shape.kind}`,
    group: "shape",
    label: shape.label,
    section: SHAPE_CATEGORIES.find((category) =>
      category.kinds.includes(shape.kind)
    )?.label,
    icon: ({ className }) => (
      <ShapePreview kind={shape.kind} className={className} />
    ),
    create: (at) => (
      <Shape
        kind={shape.kind}
        width={width}
        height={height}
        {...center(at, width, height)}
        {...(shape.kind === "line" ? { fill: "#0a0a0a", strokeWidth: 6 } : {})}
      />
    ),
  }
})

const LIST_ITEMS = ["First item", "Second item", "Third item"]
const listHtml = (tag: "ul" | "ol") =>
  `<${tag}>${LIST_ITEMS.map((item) => `<li>${item}</li>`).join("")}</${tag}>`

const textItems: LibraryItem[] = [
  {
    id: "text:heading",
    group: "text",
    label: "Title",
    icon: Heading1Icon,
    create: (at) => (
      <TextBox
        text="Title"
        html="<h1>Title</h1>"
        fontSize={56}
        width={1200}
        height={129}
        {...center(at, 1200, 129)}
      />
    ),
  },
  {
    id: "text:subheading",
    group: "text",
    label: "Heading",
    icon: Heading2Icon,
    create: (at) => (
      <TextBox
        text="Heading"
        html="<h2>Heading</h2>"
        fontSize={56}
        width={1200}
        height={97}
        {...center(at, 1200, 97)}
      />
    ),
  },
  {
    id: "text:heading-3",
    group: "text",
    label: "Subheading",
    icon: Heading3Icon,
    create: (at) => (
      <TextBox
        text="Subheading"
        html="<h3>Subheading</h3>"
        fontSize={56}
        width={1200}
        height={81}
        {...center(at, 1200, 81)}
      />
    ),
  },
  {
    id: "text:text",
    group: "text",
    label: "Text",
    icon: TypeIcon,
    create: (at) => {
      const width = 800
      const height = measureTextHeight("Text", 64)
      return (
        <TextBox
          text="Text"
          fontSize={64}
          width={width}
          height={height}
          {...center(at, width, height)}
        />
      )
    },
  },
  {
    id: "text:bullet-list",
    group: "text",
    label: "Bullet list",
    icon: ListIcon,
    create: (at) => (
      <TextBox
        text={LIST_ITEMS.join("\n")}
        html={listHtml("ul")}
        fontSize={48}
        width={1000}
        height={measureTextHeight(LIST_ITEMS.join("\n"), 48)}
        {...center(at, 1000, 173)}
      />
    ),
  },
  {
    id: "text:numbered-list",
    group: "text",
    label: "Number list",
    icon: ListOrderedIcon,
    create: (at) => (
      <TextBox
        text={LIST_ITEMS.join("\n")}
        html={listHtml("ol")}
        fontSize={48}
        width={1000}
        height={measureTextHeight(LIST_ITEMS.join("\n"), 48)}
        {...center(at, 1000, 173)}
      />
    ),
  },
]

const equationItems: LibraryItem[] = [
  {
    id: "equation:equation",
    group: "equation",
    label: "Equation",
    icon: SquareFunctionIcon,
    create: (at) => <Equation {...center(at, 900, 220)} />,
  },
]

const tableItems: LibraryItem[] = [
  {
    id: "table:table",
    group: "table",
    label: "Table",
    icon: TableIcon,
    create: (at) => <Table {...center(at, 1200, 520)} />,
  },
]

const chartItems: LibraryItem[] = CHART_KINDS.map(({ kind, label, icon }) => ({
  id: `chart:${kind}`,
  group: "chart",
  label,
  icon,
  create: (at) => <ChartBox kind={kind} {...center(at, 960, 540)} />,
}))

const codeItems: LibraryItem[] = [
  {
    id: "code:block",
    group: "code",
    label: "Code block",
    icon: CodeIcon,
    create: (at) => {
      const width = 1200
      const height = measureCodeHeight(DEFAULT_CODE, 36)
      return <CodeBlock {...center(at, width, height)} />
    },
  },
]

const mediaItems: LibraryItem[] = [
  {
    id: "media:image",
    group: "media",
    label: "Image",
    icon: ImageIcon,
    create: (at) => <ImageBox {...center(at, 640, 400)} />,
  },
]

export const LIBRARY: LibraryItem[] = [
  ...shapeItems,
  ...textItems,
  ...equationItems,
  ...tableItems,
  ...chartItems,
  ...codeItems,
  ...mediaItems,
]

export const getLibraryItem = (id: string) =>
  LIBRARY.find((item) => item.id === id)

export const LIBRARY_DRAG_TYPE = "application/x-visx-library-item"
