import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { presetsFor, type AnimationPreset } from "@/lib/editor/animation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const GROUPS = [
  { id: "entrance", label: "Entrance" },
  { id: "emphasis", label: "Emphasis" },
] as const

/**
 * The row's one control: add an animation (a menu of the presets that suit
 * this element), or remove the one it has.
 */
function RowAction({
  name,
  label,
  animated,
  onAdd,
  onRemove,
}: {
  /** The element's node type, which decides the presets offered. */
  name: string
  label: string
  animated: boolean
  onAdd: (preset: AnimationPreset) => void
  onRemove: () => void
}) {
  if (animated) {
    return (
      <Button
        variant="ghost"
        size="icon-xs"
        className="size-5 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
        aria-label={`Remove animation from ${label}`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    )
  }

  const available = presetsFor(name)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-5 text-muted-foreground"
            aria-label={`Add animation to ${label}`}
          />
        }
      >
        <PlusIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {GROUPS.map((group, index) => (
          <React.Fragment key={group.id}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {available
                .filter((preset) => preset.group === group.id)
                .map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => onAdd(preset.id)}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { RowAction }
