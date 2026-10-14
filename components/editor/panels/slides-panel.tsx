"use client"

import {
  ArrowDownIcon,
  ArrowDownToLineIcon,
  ArrowUpIcon,
  ArrowUpToLineIcon,
  CopyIcon,
  GripVerticalIcon,
  PlusIcon,
  PresentationIcon,
  Trash2Icon,
} from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable"
import { useDeck } from "@/components/editor/editor-stores"

const getSlideId = (id: string) => id

function SlideListItem({
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
  const selectSlide = useDeck((state) => state.select)
  const duplicateSlide = useDeck((state) => state.duplicateSlide)
  const deleteSlide = useDeck((state) => state.deleteSlide)
  const moveSlide = useDeck((state) => state.moveSlide)
  const first = index === 0
  const last = index === slideCount - 1

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) selectSlide(value)
      }}
    >
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
          <ContextMenuItem onClick={() => duplicateSlide()}>
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
            onClick={() => deleteSlide()}
          >
            <Trash2Icon />
            Delete slide
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function SlidesPanel() {
  const slideIds = useDeck(useShallow((state) => state.slides.map((s) => s.id)))
  const addSlide = useDeck((state) => state.addSlide)
  const moveSlide = useDeck((state) => state.moveSlide)
  return (
    <div className="flex flex-col gap-3" data-slide-list="">
      <Button variant="outline" onClick={addSlide}>
        <PlusIcon data-icon="inline-start" />
        Add slide
      </Button>
      <Sortable
        value={slideIds}
        getItemValue={getSlideId}
        onValueChange={() => {}}
        onMove={({ activeIndex, overIndex }) =>
          moveSlide(slideIds[activeIndex], overIndex)
        }
        className="flex flex-col gap-3"
        role="list"
        aria-label="Slides. Use the drag handles to reorder."
      >
        {slideIds.map((id, index) => (
          <SlideListItem key={id} value={id} index={index} />
        ))}
      </Sortable>
    </div>
  )
}

export { SlidesPanel }
