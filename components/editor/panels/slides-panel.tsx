"use client"

import { PlusIcon } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sortable } from "@/components/reui/sortable"
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useDeck } from "@/components/editor/editor-stores"
import { SlideListItem } from "@/components/editor/panels/slide-list-item"

const getSlideId = (id: string) => id

function SlidesPanel() {
  const slideIds = useDeck(useShallow((state) => state.slides.map((s) => s.id)))
  const { addSlide, moveSlide } = useDeckActions()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Slides</h2>
          <Badge variant="secondary">{slideIds.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={addSlide}>
          <PlusIcon data-icon="inline-start" />
          Add slide
        </Button>
      </div>
      <Sortable
        value={slideIds}
        getItemValue={getSlideId}
        onValueChange={() => {}}
        onMove={({ activeIndex, overIndex }) =>
          moveSlide(slideIds[activeIndex], overIndex)
        }
        className="flex flex-col gap-1"
        role="list"
        aria-label="Slides. Use the drag handles to reorder."
      >
        {slideIds.map((id, index) => (
          <SlideListItem key={id} value={id} index={index} />
        ))}
      </Sortable>
    </div>
  )
}

export { SlidesPanel }
