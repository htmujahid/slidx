import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function RowReset({
  label,
  timed,
  onReset,
}: {
  label: string
  timed: boolean
  onReset: () => void
}) {
  if (!timed) return <span className="size-5 shrink-0" />
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="size-5 text-muted-foreground"
      aria-label={`Reset timing of ${label}`}
      onClick={onReset}
    >
      <RotateCcwIcon />
    </Button>
  )
}

export { RowReset }
