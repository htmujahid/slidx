import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ClapperboardIcon,
  DownloadIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { ShareButton } from "./share-button"

export function EditorHeader() {
  const { actions, query, canUndo, canRedo } = useEditor((_, editorQuery) => ({
    canUndo: editorQuery.history.canUndo(),
    canRedo: editorQuery.history.canRedo(),
  }))

  const exportSvg = () => {
    const svg = query.node(ROOT_NODE).get()?.dom as SVGSVGElement | null
    if (!svg) return
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll("[data-editor-overlay]").forEach((el) => el.remove())
    clone.removeAttribute("style")
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    const markup = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([markup], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "animation.svg"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <div className="flex min-w-0 items-center gap-2">
        <ClapperboardIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-semibold">
          Untitled Animation
        </span>
        <Badge variant="secondary">Draft</Badge>
      </div>

      <div className="flex-1" />

      <ButtonGroup>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!canUndo}
          onClick={() => actions.history.undo()}
        >
          <Undo2Icon />
          <span className="sr-only">Undo</span>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!canRedo}
          onClick={() => actions.history.redo()}
        >
          <Redo2Icon />
          <span className="sr-only">Redo</span>
        </Button>
      </ButtonGroup>

      <ShareButton />
      <Button size="sm" onClick={exportSvg}>
        <DownloadIcon data-icon="inline-start" />
        Export
      </Button>
    </header>
  )
}
