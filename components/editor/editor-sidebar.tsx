"use client"

import * as React from "react"
import { LayoutGridIcon, PresentationIcon, SearchIcon } from "lucide-react"

import { LIBRARY, LIBRARY_DRAG_TYPE } from "@/lib/editor/library"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartsPanel } from "@/components/editor/panels/charts-panel"
import { ShapesPanel } from "@/components/editor/panels/shapes-panel"
import { SlidesPanel } from "@/components/editor/panels/slides-panel"

function EditorSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [search, setSearch] = React.useState("")
  const { addLibraryItem } = useEditorActions()
  const items = LIBRARY.filter(
    (item) =>
      item.group !== "shape" &&
      item.group !== "chart" &&
      item.label.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent className="gap-0">
        <Tabs defaultValue="elements" className="min-h-0 flex-1 gap-0">
          <SidebarHeader className="shrink-0 p-4 pb-3">
            <TabsList className="w-full">
              <TabsTrigger value="elements">
                <LayoutGridIcon />
                Elements
              </TabsTrigger>
              <TabsTrigger value="slides">
                <PresentationIcon />
                Slides
              </TabsTrigger>
            </TabsList>
          </SidebarHeader>
          <TabsContent
            value="elements"
            className="min-h-0 overflow-y-auto pt-1"
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label="Search elements"
                  placeholder="Search elements…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>
              <p className="text-xs text-muted-foreground">
                Click to insert, or drag onto the slide.
              </p>
              {items.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="justify-start"
                      draggable
                      onClick={() => addLibraryItem(item.id)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData(LIBRARY_DRAG_TYPE, item.id)
                        event.dataTransfer.effectAllowed = "copy"
                      }}
                    >
                      <item.icon data-icon="inline-start" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <ShapesPanel search={search} />
            <ChartsPanel search={search} />
            {!LIBRARY.some((item) =>
              item.label.toLowerCase().includes(search.toLowerCase())
            ) && (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No elements found</EmptyTitle>
                  <EmptyDescription>
                    Try a different name, such as text or circle.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
          <TabsContent
            value="slides"
            className="min-h-0 overflow-y-auto px-4 pt-1 pb-4"
          >
            <SlidesPanel />
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export { EditorSidebar }
