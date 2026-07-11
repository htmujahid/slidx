import { ROOT_NODE, useEditor } from "@craftjs/core"
import { Grid3x3Icon } from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function GridToggle() {
  const { actions, showGrid } = useEditor((state) => ({
    showGrid: !!(
      state.nodes[ROOT_NODE]?.data.custom as { showGrid?: boolean } | undefined
    )?.showGrid,
  }))

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            size="sm"
            aria-label="Toggle design grid"
            pressed={showGrid}
            onPressedChange={(pressed) =>
              actions.history
                .ignore()
                .setCustom(ROOT_NODE, (custom: { showGrid?: boolean }) => {
                  custom.showGrid = pressed
                })
            }
          >
            <Grid3x3Icon />
          </Toggle>
        }
      />
      <TooltipContent>Design grid (editor only, not exported)</TooltipContent>
    </Tooltip>
  )
}
