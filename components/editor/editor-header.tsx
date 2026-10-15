"use client"

import { PanelLeftIcon, PanelRightIcon, PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { AccountMenu } from "@/components/editor/account-menu"
import { Brand } from "@/components/editor/brand"
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useChrome, usePresenter } from "@/components/editor/editor-stores"
import { EditorMenubar } from "@/components/editor/menubar/editor-menubar"
import { ThemeToggle } from "@/components/editor/theme-toggle"

function EditorHeader() {
  const start = usePresenter((state) => state.start)
  const { syncActive } = useDeckActions()
  const propertiesOpen = useChrome((state) => state.propertiesOpen)
  const toggleProperties = useChrome((state) => state.toggleProperties)
  const { toggleSidebar, isMobile, openMobile, open } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full shrink-0 flex-wrap items-center gap-x-2 gap-y-0 border-b bg-background px-2 sm:flex-nowrap sm:gap-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Toggle elements and slides"
        aria-expanded={isMobile ? openMobile : open}
        onClick={toggleSidebar}
      >
        <PanelLeftIcon />
      </Button>
      <Brand />
      <div className="order-last -mx-1 w-full min-w-0 overflow-x-auto px-1 pb-1 sm:order-none sm:-m-1 sm:w-auto sm:p-1">
        <EditorMenubar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <AccountMenu />
        <Button
          aria-label="Present from current slide"
          onClick={(event) => {
            syncActive()
            start(event.currentTarget)
          }}
        >
          <PlayIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Present</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle properties and layers"
          aria-expanded={propertiesOpen}
          onClick={toggleProperties}
        >
          <PanelRightIcon />
        </Button>
      </div>
    </header>
  )
}

export { EditorHeader }
