"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  CopyIcon,
  GroupIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import { getElementLabel } from "@/lib/editor/labels"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { useIsMobile } from "@/hooks/use-mobile"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { LayersPanel } from "@/components/editor/panels/layers-panel"

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function PropertiesSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { propertiesOpen, setPropertiesOpen } = useEditorLayout()
  const isMobile = useIsMobile()
  return (
    <SidebarProvider
      open={propertiesOpen}
      openMobile={isMobile && propertiesOpen}
      onOpenMobileChange={(next) =>
        setPropertiesOpen(
          typeof next === "function" ? next(propertiesOpen) : next
        )
      }
      onOpenChange={setPropertiesOpen}
      className="min-h-0 min-w-0 flex-1"
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      {children}
    </SidebarProvider>
  )
}

function PropertiesPanel() {
  const { duplicate, remove, reorder, group } = useEditorActions()
  const { id, count, title, Settings } = useEditor((state) => {
    const selected = [...state.events.selected].filter(
      (nodeId) => nodeId !== ROOT_NODE && state.nodes[nodeId]
    )
    const id = selected[0] ?? ROOT_NODE
    const node = state.nodes[id]
    return {
      id,
      count: selected.length,
      title:
        selected.length > 1
          ? `${selected.length} elements`
          : id === ROOT_NODE
            ? "Slide"
            : getElementLabel({ name: node.data.name, props: node.data.props }),
      Settings:
        selected.length > 1
          ? undefined
          : (node.related.settings as React.ElementType | undefined),
    }
  })
  const isElement = id !== ROOT_NODE

  return (
    <Sidebar
      side="right"
      aria-label="Properties"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent className="gap-0 bg-background">
        <Tabs defaultValue="properties" className="min-h-0 flex-1 gap-0">
          <SidebarHeader className="shrink-0 p-4">
            <TabsList className="w-full">
              <TabsTrigger value="properties">
                <SlidersHorizontalIcon />
                Properties
              </TabsTrigger>
              <TabsTrigger value="layers">
                <LayersIcon />
                Layers
              </TabsTrigger>
            </TabsList>
          </SidebarHeader>
          <Separator />
          <TabsContent value="properties" className="flex min-h-0 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 pr-2 pl-4">
              <h2 className="truncate text-sm font-semibold">{title}</h2>
              {isElement ? (
                <div className="flex items-center">
                  {count === 1 ? (
                    <>
                      <ActionButton
                        label="Bring forward"
                        onClick={() => reorder("forward", id)}
                      >
                        <ArrowUpToLineIcon />
                      </ActionButton>
                      <ActionButton
                        label="Send backward"
                        onClick={() => reorder("backward", id)}
                      >
                        <ArrowDownToLineIcon />
                      </ActionButton>
                    </>
                  ) : null}
                  <ActionButton label="Duplicate" onClick={() => duplicate()}>
                    <CopyIcon />
                  </ActionButton>
                  <ActionButton label="Delete" onClick={() => remove()}>
                    <Trash2Icon />
                  </ActionButton>
                </div>
              ) : null}
            </div>
            {!isElement && (
              <p className="px-4 pb-3 text-xs text-muted-foreground">
                Select an element on the slide to edit its appearance.
              </p>
            )}
            {count > 1 && (
              <div className="flex flex-col gap-3 px-4 pb-3">
                <p className="text-xs text-muted-foreground">
                  Select a single element to edit its appearance. Duplicate,
                  delete, move and align apply to the whole selection.
                </p>
                <Button variant="outline" size="sm" onClick={() => group()}>
                  <GroupIcon data-icon="inline-start" />
                  Group selection
                  <Kbd className="ml-auto">⌘G</Kbd>
                </Button>
              </div>
            )}
            <ScrollArea className="min-h-0 flex-1 overflow-hidden">
              <ScrollAreaPrimitive.Content>
                <Accordion
                  key={id}
                  multiple
                  defaultValue={[
                    "Layout",
                    "Background",
                    "Canvas",
                    "Text",
                    "Table",
                    "Chart",
                    "Style",
                    "Appearance",
                    "Image",
                    "Equation",
                    "Code",
                    "Group",
                    "Icon",
                    "Emoji",
                    "Arrow",
                    "Shape",
                    "Effects",
                  ]}
                  className="px-4 pt-1 pb-4"
                >
                  {Settings ? <Settings /> : null}
                </Accordion>
              </ScrollAreaPrimitive.Content>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="layers" className="min-h-0 overflow-y-auto">
            <LayersPanel />
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export { PropertiesPanel, PropertiesSidebarProvider }
