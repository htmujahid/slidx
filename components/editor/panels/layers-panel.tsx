"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  LayersIcon,
  LockIcon,
  UnlockIcon,
} from "lucide-react"

import { ElementIcon, getElementLabel } from "@/lib/editor/labels"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable"

const getLayerId = (layer: { id: string }) => layer.id

function RenameInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const cancelled = React.useRef(false)
  return (
    <Input
      autoFocus
      defaultValue={initial}
      aria-label="Element name"
      maxLength={80}
      className="h-6 flex-1 rounded-sm px-1.5 text-sm"
      onFocus={(event) => event.currentTarget.select()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === "Enter") event.currentTarget.blur()
        if (event.key === "Escape") {
          cancelled.current = true
          event.currentTarget.blur()
        }
      }}
      onBlur={(event) => {
        if (cancelled.current) onCancel()
        else onCommit(event.currentTarget.value)
      }}
    />
  )
}

function LayersPanel() {
  const { actions, layers, selectedId } = useEditor((state) => {
    const ids = state.nodes[ROOT_NODE]?.data.nodes ?? []
    return {
      selectedId: [...state.events.selected][0],
      layers: [...ids].reverse().map((id) => {
        const { name, props, hidden, custom } = state.nodes[id].data
        return {
          id,
          name,
          props,
          hidden: Boolean(hidden),
          locked: Boolean(custom.locked),
          label: getElementLabel({ name, props }),
          children: state.nodes[id].data.nodes.map((childId) => {
            const child = state.nodes[childId].data
            return {
              id: childId,
              name: child.name,
              props: child.props,
              label: getElementLabel({ name: child.name, props: child.props }),
            }
          }),
        }
      }),
    }
  })
  const [renamingId, setRenamingId] = React.useState<string | null>(null)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const handleMove = React.useCallback(
    ({
      activeIndex,
      overIndex,
    }: {
      activeIndex: number
      overIndex: number
    }) => {
      const last = layers.length - 1
      const id = layers[activeIndex].id
      const target = last - overIndex
      const movingForward = target > last - activeIndex
      actions.move(id, ROOT_NODE, movingForward ? target + 1 : target)
    },
    [actions, layers]
  )

  if (layers.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayersIcon />
          </EmptyMedia>
          <EmptyTitle>No layers yet</EmptyTitle>
          <EmptyDescription>
            Add a shape or text to see it listed here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Layers</SidebarGroupLabel>
      <SidebarGroupContent>
        <Sortable
          value={layers}
          getItemValue={getLayerId}
          onValueChange={() => {}}
          onMove={handleMove}
          render={<SidebarMenu className="gap-1" />}
        >
          {layers.map((layer) => {
            const isGroup = layer.children.length > 0
            const row = (
              <SortableItem
                value={layer.id}
                role="listitem"
                tabIndex={-1}
                className="rounded-md data-[dragging=true]:bg-sidebar-accent data-[dragging=true]:shadow-md"
                render={<SidebarMenuItem />}
              >
                {isGroup && layer.id !== renamingId ? (
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="group absolute top-1 left-1 size-6 hover:bg-transparent aria-expanded:bg-transparent aria-expanded:hover:bg-transparent dark:hover:bg-transparent"
                      />
                    }
                    aria-label="Toggle group"
                  >
                    <ChevronRightIcon className="transition-transform group-aria-expanded:rotate-90" />
                  </CollapsibleTrigger>
                ) : null}
                {layer.id === renamingId ? (
                  <div
                    className={cn(
                      "flex h-8 items-center gap-2 pr-2",
                      isGroup ? "pl-9" : "pl-2"
                    )}
                  >
                    <ElementIcon
                      name={layer.name}
                      props={layer.props}
                      className="size-4 shrink-0"
                    />
                    <RenameInput
                      initial={
                        typeof layer.props.name === "string"
                          ? layer.props.name
                          : ""
                      }
                      onCommit={(value) => {
                        actions.setProp(layer.id, (props) => {
                          props.name = value.trim()
                        })
                        setRenamingId(null)
                      }}
                      onCancel={() => setRenamingId(null)}
                    />
                  </div>
                ) : (
                  <SortableItemHandle
                    cursor={false}
                    render={
                      <SidebarMenuButton
                        isActive={layer.id === selectedId}
                        className={cn(
                          "pr-[4.5rem]",
                          isGroup &&
                            "pl-9 group-has-[[data-slot=collapsible-trigger]:hover]/menu-item:bg-sidebar-accent group-has-[[data-slot=collapsible-trigger]:hover]/menu-item:text-sidebar-accent-foreground"
                        )}
                        onClick={() => actions.selectNode(layer.id)}
                        onDoubleClick={() => setRenamingId(layer.id)}
                      />
                    }
                  >
                    <ElementIcon name={layer.name} props={layer.props} />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        layer.hidden && "text-muted-foreground line-through"
                      )}
                    >
                      {layer.label}
                    </span>
                  </SortableItemHandle>
                )}
                {layer.id === renamingId ? null : (
                  <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "pointer-events-auto size-6",
                        !layer.locked &&
                          "opacity-0 group-hover/menu-item:opacity-100 focus-visible:opacity-100"
                      )}
                      aria-label={layer.locked ? "Unlock" : "Lock"}
                      aria-pressed={layer.locked}
                      title={layer.locked ? "Unlock" : "Lock"}
                      onClick={() =>
                        actions.setCustom(layer.id, (custom) => {
                          custom.locked = !layer.locked
                        })
                      }
                    >
                      {layer.locked ? <LockIcon /> : <UnlockIcon />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "pointer-events-auto size-6",
                        !layer.hidden &&
                          "opacity-0 group-hover/menu-item:opacity-100 focus-visible:opacity-100"
                      )}
                      aria-label={layer.hidden ? "Show" : "Hide"}
                      aria-pressed={layer.hidden}
                      title={layer.hidden ? "Show" : "Hide"}
                      onClick={() => actions.setHidden(layer.id, !layer.hidden)}
                    >
                      {layer.hidden ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                )}
              </SortableItem>
            )

            if (!isGroup)
              return <React.Fragment key={layer.id}>{row}</React.Fragment>

            return (
              <Collapsible
                key={layer.id}
                className="contents"
                open={expandedIds.has(layer.id)}
                onOpenChange={(open) =>
                  setExpandedIds((current) => {
                    const next = new Set(current)
                    if (open) next.add(layer.id)
                    else next.delete(layer.id)
                    return next
                  })
                }
              >
                {row}
                <CollapsibleContent>
                  <div className="flex flex-col gap-1">
                    {layer.children.map((child) => (
                      <SidebarMenuItem key={child.id}>
                        <SidebarMenuButton
                          size="sm"
                          className="pl-9 text-muted-foreground"
                          title="Select the group"
                          onClick={() => actions.selectNode(layer.id)}
                        >
                          <ElementIcon name={child.name} props={child.props} />
                          <span className="min-w-0 flex-1 truncate">
                            {child.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </Sortable>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { LayersPanel }
