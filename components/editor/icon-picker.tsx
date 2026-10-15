"use client"

import * as React from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { DEFAULT_ICON, ICON_NAMES, ICONS } from "@/lib/editor/icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

const VISIBLE_LIMIT = 240

function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (name: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const Current = ICONS[value] ?? ICONS[DEFAULT_ICON]

  const matches = React.useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return ICON_NAMES
    return ICON_NAMES.filter((name) =>
      terms.every((term) => name.includes(term))
    )
  }, [query])
  const visible = matches.slice(0, VISIBLE_LIMIT)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start font-normal"
          />
        }
      >
        <Current data-icon="inline-start" />
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b p-2">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              value={query}
              placeholder="Search icons…"
              aria-label="Search icons"
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        <ScrollArea className="h-64">
          {visible.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No icons found.
            </p>
          ) : (
            <div
              role="listbox"
              aria-label="Icons"
              className="grid grid-cols-8 gap-0.5 p-2"
            >
              {visible.map((name) => {
                const Icon = ICONS[name]
                const selected = name === value
                return (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={name}
                    title={name}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border border-transparent text-foreground/80 hover:bg-muted",
                      selected && "border-primary bg-primary/10 text-foreground"
                    )}
                    onClick={() => {
                      onChange(name)
                      setOpen(false)
                    }}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}
            </div>
          )}
          {matches.length > visible.length && (
            <p className="px-3 pb-2 text-center text-xs text-muted-foreground">
              Showing {visible.length} of {matches.length} · type to narrow
              down.
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { IconPicker }
