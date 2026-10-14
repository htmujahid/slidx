import * as React from "react"

import type { Point } from "@/lib/editor/geometry"

export type IconComponent = React.ComponentType<{ className?: string }>

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

export type LibraryItem = {
  id: string
  group: LibraryGroup
  label: string
  section?: string
  icon: IconComponent
  create: (at?: Point) => React.ReactElement
}

export const LIBRARY_DRAG_TYPE = "application/x-visx-library-item"
