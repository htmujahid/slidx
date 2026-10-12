"use client"

import { ROOT_NODE, useEditor } from "@craftjs/core"
import { useTheme } from "next-themes"

import { ZOOM_MAX, ZOOM_MIN } from "@/lib/editor/constants"
import { SLIDE_DEFAULTS, type SlideProps } from "@/lib/editor/slide-props"
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
import { useEditorLayout } from "@/components/editor/editor-layout"
import { Shortcut } from "@/components/editor/menubar/shortcut"

function ViewMenu() {
  const { open: slidesOpen, toggleSidebar } = useSidebar()
  const { propertiesOpen, toggleProperties, zoom, zoomIn, zoomOut, zoomReset } =
    useEditorLayout()
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
          <MenubarItem disabled={zoom === 1} onClick={zoomReset}>
            Zoom to fit
            <Shortcut keys="0" />
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
