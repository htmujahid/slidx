"use client"

import { LIBRARY } from "@/lib/editor/library/items"
import { LIBRARY_DRAG_TYPE } from "@/lib/editor/library/types"
import { SHAPE_CATEGORIES } from "@/lib/editor/shapes"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

function ShapesPanel({ search = "" }: { search?: string }) {
  const { addLibraryItem } = useEditorActions()

  return (
    <>
      {SHAPE_CATEGORIES.filter((category) =>
        LIBRARY.some(
          (item) =>
            item.group === "shape" &&
            item.section === category.label &&
            item.label.toLowerCase().includes(search.toLowerCase())
        )
      ).map((category) => (
        <SidebarGroup key={category.label}>
          <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
          <SidebarGroupContent className="grid grid-cols-3 gap-2">
            {LIBRARY.filter(
              (item) =>
                item.group === "shape" &&
                item.section === category.label &&
                item.label.toLowerCase().includes(search.toLowerCase())
            ).map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                aria-label={item.label}
                title={item.label}
                className="h-14 min-w-0"
                draggable
                onClick={() => addLibraryItem(item.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(LIBRARY_DRAG_TYPE, item.id)
                  event.dataTransfer.effectAllowed = "copy"
                }}
              >
                <item.icon />
              </Button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

export { ShapesPanel }
