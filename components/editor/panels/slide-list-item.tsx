"use client"

import {
  ArrowDownIcon,
  ArrowDownToLineIcon,
  ArrowUpIcon,
  ArrowUpToLineIcon,
  CopyIcon,
  GripVerticalIcon,
  PresentationIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { SortableItem, SortableItemHandle } from "@/components/reui/sortable"
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useDeck } from "@/components/editor/editor-stores"

export function SlideListItem({
  value,
  index,
  className,
}: {
  value: string
  index: number
  className?: string
}) {
  const slideCount = useDeck((state) => state.slides.length)
  const active = useDeck((state) => state.activeId === value)
  const {
    select: selectSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
  } = useDeckActions()
  const first = index === 0
  const last = index === slideCount - 1

  return (
    <ContextMenu>
      <SortableItem
        value={value}
        role="listitem"
        tabIndex={-1}
        data-slide-list=""
        className={cn("rounded-lg", className)}
        render={<ContextMenuTrigger />}
      >
        <SortableItemHandle
          cursor={false}
          render={
            <SidebarMenuButton
              isActive={active}
              className="h-16 gap-3 rounded-lg border border-sidebar-border px-3 transition-colors"
              aria-current={active ? "page" : undefined}
              aria-label={`Slide ${index + 1}. Drag to reorder, or press Space and use arrow keys.`}
              onClick={() => selectSlide(value)}
            />
          }
        >
          <GripVerticalIcon className="text-muted-foreground" />
          <PresentationIcon />
          <span className="min-w-0 flex-1 truncate font-medium">
            Slide {index + 1}
          </span>
          <span
            className={cn(
              "size-2 shrink-0 rounded-full bg-primary",
              !active && "invisible"
            )}
            aria-hidden="true"
          />
        </SortableItemHandle>
      </SortableItem>
      <ContextMenuContent
        className="w-52"
        onKeyDown={(event) => event.stopPropagation()}
      >
        <ContextMenuGroup>
          <ContextMenuLabel>Slide {index + 1}</ContextMenuLabel>
          <ContextMenuItem onClick={() => duplicateSlide(value)}>
            <CopyIcon />
            Duplicate slide
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Slide order</ContextMenuLabel>
          <ContextMenuItem
            disabled={first}
            onClick={() => moveSlide(value, index - 1)}
          >
            <ArrowUpIcon />
            Move earlier
          </ContextMenuItem>
          <ContextMenuItem
            disabled={last}
            onClick={() => moveSlide(value, index + 1)}
          >
            <ArrowDownIcon />
            Move later
          </ContextMenuItem>
          <ContextMenuItem disabled={first} onClick={() => moveSlide(value, 0)}>
            <ArrowUpToLineIcon />
            Make first slide
          </ContextMenuItem>
          <ContextMenuItem
            disabled={last}
            onClick={() => moveSlide(value, slideCount - 1)}
          >
            <ArrowDownToLineIcon />
            Make last slide
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            variant="destructive"
            disabled={slideCount <= 1}
            onClick={() => deleteSlide(value)}
          >
            <Trash2Icon />
            Delete slide
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
