import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  TypeIcon,
} from "lucide-react"

import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { measureTextHeight } from "@/lib/editor/text"
import { TextBox } from "@/components/editor/nodes/text-box"

const LIST_ITEMS = ["First item", "Second item", "Third item"]

const listHtml = (tag: "ul" | "ol") =>
  `<${tag}>${LIST_ITEMS.map((item) => `<li>${item}</li>`).join("")}</${tag}>`

export const textItems: LibraryItem[] = [
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
