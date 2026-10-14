import { chartItems } from "@/lib/editor/library/chart-items"
import { codeItems } from "@/lib/editor/library/code-items"
import { equationItems } from "@/lib/editor/library/equation-items"
import { mediaItems } from "@/lib/editor/library/media-items"
import { arrowLineItems, shapeItems } from "@/lib/editor/library/shape-items"
import { tableItems } from "@/lib/editor/library/table-items"
import { textItems } from "@/lib/editor/library/text-items"
import type { LibraryItem } from "@/lib/editor/library/types"

export const LIBRARY: LibraryItem[] = [
  ...shapeItems,
  ...arrowLineItems,
  ...textItems,
  ...equationItems,
  ...tableItems,
  ...chartItems,
  ...codeItems,
  ...mediaItems,
]

export const getLibraryItem = (id: string) =>
  LIBRARY.find((item) => item.id === id)
