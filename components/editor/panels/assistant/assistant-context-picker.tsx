"use client"

import { ROOT_NODE, useEditor } from "@craftjs/core"
import { AtSignIcon } from "lucide-react"

import { getElementLabel } from "@/lib/editor/labels"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { InputGroupButton } from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDeck } from "@/components/editor/editor-stores"
import type { Reference } from "@/components/editor/panels/assistant/types"

export function AssistantContextPicker({
  open,
  onOpenChange,
  onAdd,
  onClear,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (reference: Reference) => void
  onClear: () => void
}) {
  const slides = useDeck((state) => state.slides)
  const activeId = useDeck((state) => state.activeId)
  const { selection } = useEditor((state) => ({
    selection: [...state.events.selected]
      .filter((id) => id !== ROOT_NODE && state.nodes[id])
      .map((id) => ({
        id: `${activeId}:${id}`,
        slideId: activeId,
        elementId: id,
        label: `Slide ${slides.findIndex((slide) => slide.id === activeId) + 1} · ${getElementLabel({ name: state.nodes[id].data.name, props: state.nodes[id].data.props })}`,
      })),
  }))

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <InputGroupButton aria-label="Mention a slide or selected element" />
        }
      >
        <AtSignIcon />
        Context
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Find context…" />
          <CommandList>
            <CommandEmpty>No matching context.</CommandEmpty>
            <CommandGroup heading="Presentation">
              <CommandItem onSelect={onClear}>Entire presentation</CommandItem>
            </CommandGroup>
            {selection.length > 0 && (
              <CommandGroup heading="Selected elements">
                {selection.map((reference) => (
                  <CommandItem
                    key={reference.id}
                    onSelect={() => onAdd(reference)}
                  >
                    {reference.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Slides">
              {slides.map((slide, index) => (
                <CommandItem
                  key={slide.id}
                  onSelect={() =>
                    onAdd({
                      id: slide.id,
                      slideId: slide.id,
                      label: `Slide ${index + 1}`,
                    })
                  }
                >
                  Slide {index + 1}
                  {slide.id === activeId ? " · Current" : ""}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
