import { createElement } from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  FrameIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAnimationMeta } from "../craft/animation-registry"
import { clearEffectRefs } from "../craft/defs/apply-effect"
import { isFilterPrimitiveType } from "../craft/defs/create-filter-primitive"
import { definitionMeta } from "../craft/defs/defs-registry"
import { getShapeMeta } from "../craft/shapes"
import { kindIcons } from "../kind-icons"

export function PropertiesPanel() {
  const { actions, query: editorQuery, selected } = useEditor((state, query) => {
    const selectedId = query.getEvent("selected").last() || ROOT_NODE
    const node = state.nodes[selectedId]
    if (!node) return { selected: null }

    return {
      selected: {
        id: selectedId,
        type: node.data.type,
        displayName: node.data.displayName,
        customName: (node.data.custom as { name?: string } | undefined)?.name,
        settings: node.related?.settings,
        deletable:
          selectedId !== ROOT_NODE && query.node(selectedId).isDeletable(),
      },
    }
  })

  if (!selected) return null

  const shapeMeta = getShapeMeta(selected.type)
  const animationMeta = getAnimationMeta(selected.type)
  const defMeta = definitionMeta(selected.type)

  const Icon = shapeMeta
    ? kindIcons[shapeMeta.kind]
    : animationMeta
      ? (animationMeta.icon ?? ZapIcon)
      : defMeta
        ? defMeta.icon
        : isFilterPrimitiveType(selected.type)
          ? SlidersHorizontalIcon
          : FrameIcon
  const title =
    selected.id === ROOT_NODE
      ? "Canvas"
      : selected.customName
        ? `${selected.displayName}#${selected.customName}`
        : selected.displayName

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate font-mono text-sm font-medium">
          {title}
        </span>
        <Badge variant="secondary" className="ml-auto font-mono">
          {`<${selected.displayName}>`}
        </Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          {selected.settings ? createElement(selected.settings) : null}

          {selected.deletable ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full text-destructive"
              onClick={() => {
                clearEffectRefs(actions, editorQuery, selected.id)
                actions.delete(selected.id)
              }}
            >
              <Trash2Icon data-icon="inline-start" />
              Delete {selected.displayName}
            </Button>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
