"use client"

import { ROOT_NODE, useEditor } from "@craftjs/core"
import { PlayIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { ZOOM_MAX, ZOOM_MIN } from "@/lib/editor/constants"
import { SLIDE_DEFAULTS, type SlideProps } from "@/lib/editor/slide-props"
import { useChrome } from "@/lib/editor/stores/chrome-store"
import { useViewport } from "@/lib/editor/stores/viewport-store"
import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useSidebar } from "@/components/ui/sidebar"
import { usePresenter } from "@/components/editor/editor-stores"
import { Shortcut } from "@/components/editor/menubar/shortcut"

function ViewMenu() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  const slidesOpen = isMobile ? openMobile : open
  const propertiesOpen = useChrome((state) => state.propertiesOpen)
  const toggleProperties = useChrome((state) => state.toggleProperties)
  const timelineOpen = useChrome((state) => state.timelineOpen)
  const toggleTimeline = useChrome((state) => state.toggleTimeline)
  const zoom = useViewport((state) => state.zoom)
  const fitMode = useViewport((state) => state.fitMode)
  const fit = useViewport((state) => state.fit)
  const zoomIn = useViewport((state) => state.zoomIn)
  const zoomOut = useViewport((state) => state.zoomOut)
  const start = usePresenter((state) => state.start)
  const { theme = "system", setTheme } = useTheme()
  const { actions, slide } = useEditor((state) => ({
    slide: {
      ...SLIDE_DEFAULTS,
      ...state.nodes[ROOT_NODE]?.data.props,
    } as SlideProps,
  }))

  const setSlideProp = (patch: Partial<SlideProps>) =>
    actions.setProp(ROOT_NODE, (props) => {
      Object.assign(props, patch)
    })

  return (
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent className="min-w-56">
        <MenubarGroup>
          <MenubarItem onClick={() => start()}>
            <PlayIcon />
            Present from current slide
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarLabel>Canvas</MenubarLabel>
          <MenubarCheckboxItem
            checked={slide.showGrid}
            onCheckedChange={(showGrid) => setSlideProp({ showGrid })}
          >
            Show grid
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={slide.snapToAlignment}
            onCheckedChange={(snapToAlignment) =>
              setSlideProp({ snapToAlignment })
            }
          >
            Snap to alignment
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={slide.snapToGrid}
            onCheckedChange={(snapToGrid) => setSlideProp({ snapToGrid })}
          >
            Snap to grid
          </MenubarCheckboxItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarLabel>Zoom</MenubarLabel>
          <MenubarItem disabled={zoom >= ZOOM_MAX} onClick={zoomIn}>
            Zoom in
            <Shortcut keys="=" />
          </MenubarItem>
          <MenubarItem disabled={zoom <= ZOOM_MIN} onClick={zoomOut}>
            Zoom out
            <Shortcut keys="-" />
          </MenubarItem>
          <MenubarItem
            disabled={fitMode === "view" && zoom === 1}
            onClick={() => fit("view")}
          >
            Fit to view
            <Shortcut keys="0" />
          </MenubarItem>
          <MenubarItem
            disabled={fitMode === "width" && zoom === 1}
            onClick={() => fit("width")}
          >
            Fit to width
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarLabel>Panels</MenubarLabel>
          <MenubarCheckboxItem
            checked={slidesOpen}
            onCheckedChange={toggleSidebar}
          >
            Workspace
            <Shortcut keys="B" />
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={propertiesOpen}
            onCheckedChange={toggleProperties}
          >
            Properties
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={timelineOpen}
            onCheckedChange={toggleTimeline}
          >
            Timeline
          </MenubarCheckboxItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarLabel>Theme</MenubarLabel>
          <MenubarRadioGroup value={theme} onValueChange={setTheme}>
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            <MenubarRadioItem value="system">System</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}

export { ViewMenu }
