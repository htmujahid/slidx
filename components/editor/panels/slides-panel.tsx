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

import type { SlideData } from "@/lib/editor/slides"
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
import { useSlides } from "@/components/editor/slides-context"

const getSlideId = (slide: SlideData) => slide.id

function SlideListItem({
  value,
  index,
  className,
}: {
  value: string
  index: number
  className?: string
}) {
  const {
    slides,
    activeId,
    selectSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
  } = useSlides()
  const active = value === activeId
  const first = index === 0
  const last = index === slides.length - 1

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
            onClick={() => moveSlide(value, slides.length - 1)}
          >
            <ArrowDownToLineIcon />
            Make last slide
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            variant="destructive"
            disabled={slides.length <= 1}
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

function SlidesPanel() {
  const { slides, addSlide, moveSlide } = useSlides()
  return (
    <div className="flex flex-col gap-3" data-slide-list="">
      <Button variant="outline" onClick={addSlide}>
        <PlusIcon data-icon="inline-start" />
        Add slide
      </Button>
      <Sortable
        value={slides}
        getItemValue={getSlideId}
        onValueChange={() => {}}
        onMove={({ activeIndex, overIndex }) =>
          moveSlide(slides[activeIndex].id, overIndex)
        }
        className="flex flex-col gap-3"
        role="list"
        aria-label="Slides. Use the drag handles to reorder."
      >
        {slides.map((slide, index) => (
          <SlideListItem key={slide.id} value={slide.id} index={index} />
        ))}
      </Sortable>
    </div>
  )
}

export { SlidesPanel }
