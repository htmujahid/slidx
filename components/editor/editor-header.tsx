"use client"

import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Brand } from "@/components/editor/brand"
import { EditorMenubar } from "@/components/editor/menubar/editor-menubar"
import { usePresentation } from "@/components/editor/presentation-mode"
import { ThemeToggle } from "@/components/editor/theme-toggle"

function EditorHeader() {
  const { start } = usePresentation()

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-3 border-b bg-background px-4">
      <Brand />
      <div className="-m-1 min-w-0 overflow-x-auto p-1">
        <EditorMenubar />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button
          aria-label="Present from current slide"
          onClick={(event) => start(event.currentTarget)}
        >
          <PlayIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Present</span>
        </Button>
      </div>
    </header>
  )
}

export { EditorHeader }
