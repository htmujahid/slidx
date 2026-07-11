import { useEditor } from "@craftjs/core"
import { Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { buildShareUrl } from "../craft/share"

export function ShareButton() {
  const { query } = useEditor()

  const share = async () => {
    const url = buildShareUrl(query.serialize())
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied to clipboard")
    } catch {
      window.prompt("Copy this share link:", url)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={share}>
      <Share2Icon data-icon="inline-start" />
      Share
    </Button>
  )
}
