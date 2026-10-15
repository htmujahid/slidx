"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ArrowDownIcon,
  ArrowDownToLineIcon,
  ArrowUpIcon,
  ArrowUpToLineIcon,
  ChevronRightIcon,
  CopyIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { LayersPanel } from "@/components/editor/panels/layers-panel"

export function SlideListItem({
  value,
  index,
  className,
}: {
  value: string
  index: number
  className?: string
}) {
  const json = useDeck(
    (state) => state.slides.find((slide) => slide.id === value)?.json
  )
  const { liveTitle, liveCount } = useEditor((state) => ({
    liveTitle: Object.values(state.nodes).find(
      (node) =>
        node.data.name === "TextBox" &&
        String(node.data.props.text ?? "").trim()
    )?.data.props.text as string | undefined,
    liveCount: state.nodes[ROOT_NODE]?.data.nodes.length ?? 0,
  }))
  const summary = React.useMemo(() => {
    try {
      const nodes = JSON.parse(json ?? "{}") as Record<
        string,
        {
          type?: { resolvedName?: string }
          props?: { text?: string }
          nodes?: string[]
        }
      >
      return {
        title: Object.values(nodes).find(
          (node) =>
            node.type?.resolvedName === "TextBox" &&
            String(node.props?.text ?? "").trim()
        )?.props?.text,
        count: nodes[ROOT_NODE]?.nodes?.length ?? 0,
      }
    } catch {
      return { title: undefined, count: 0 }
    }
  }, [json])
  const slideCount = useDeck((state) => state.slides.length)
  const active = useDeck((state) => state.activeId === value)
  const {
    select: selectSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
  } = useDeckActions()
  const title = String(
    (active ? liveTitle : summary.title) || "Untitled slide"
  ).split("\n")[0]
  const layerCount = active ? liveCount : summary.count
  const first = index === 0
  const last = index === slideCount - 1

  return (
    <div className="overflow-hidden rounded-lg border border-sidebar-border">
      <ContextMenu>
        <SortableItem
          value={value}
          role="listitem"
          tabIndex={-1}
          data-slide-list=""
          className={cn(
            "group/slide flex items-center gap-1 p-1",
            active && "bg-sidebar-accent text-sidebar-accent-foreground",
            className
          )}
          render={<ContextMenuTrigger />}
        >
          <SidebarMenuButton
            isActive={active}
            className="h-auto min-w-0 flex-1 gap-2.5 bg-transparent py-2 hover:bg-transparent active:bg-transparent data-active:bg-transparent"
            aria-current={active ? "page" : undefined}
            title={`Slide ${index + 1}: ${title}`}
            onClick={() => {
              selectSlide(value)
            }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-background text-xs text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-medium">{title}</span>
              <span className="truncate text-xs text-muted-foreground">
                Slide {index + 1} · {layerCount}{" "}
                {layerCount === 1 ? "layer" : "layers"}
              </span>
            </span>
          </SidebarMenuButton>
          <SortableItemHandle
            cursor={false}
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-100 md:opacity-0 md:group-focus-within/slide:opacity-100 md:group-hover/slide:opacity-100"
                aria-label={`Reorder slide ${index + 1}. Press Space, then use arrow keys.`}
              />
            }
          >
            <GripVerticalIcon />
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
            <ContextMenuItem
              disabled={first}
              onClick={() => moveSlide(value, 0)}
            >
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
      {active ? (
        <Collapsible
          key={value}
          defaultOpen={false}
          className="border-t border-sidebar-border bg-background px-1 py-2"
        >
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="group w-full justify-start"
              />
            }
          >
            Layers
            <span className="ml-auto text-xs text-muted-foreground">
              {layerCount}
            </span>
            <ChevronRightIcon className="transition-transform group-aria-expanded:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <LayersPanel embedded />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  )
}
