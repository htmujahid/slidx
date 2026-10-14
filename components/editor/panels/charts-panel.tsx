"use client"

import { LIBRARY } from "@/lib/editor/library/items"
import { LIBRARY_DRAG_TYPE } from "@/lib/editor/library/types"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

function ChartsPanel({ search = "" }: { search?: string }) {
  const { addLibraryItem } = useEditorActions()
  const items = LIBRARY.filter(
    (item) =>
      item.group === "chart" &&
      item.label.toLowerCase().includes(search.toLowerCase())
  )
  if (items.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Charts</SidebarGroupLabel>
      <SidebarGroupContent className="grid grid-cols-3 gap-2">
        {items.map((item) => (
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
  )
}

export { ChartsPanel }
