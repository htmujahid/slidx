"use client"

import { PlusIcon } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { useDeckActions } from "@/hooks/use-deck-actions"
import { Button } from "@/components/ui/button"
import { Sortable } from "@/components/reui/sortable"
import { useDeck } from "@/components/editor/editor-stores"
import { SlideListItem } from "@/components/editor/panels/slide-list-item"

const getSlideId = (id: string) => id

function SlidesPanel() {
  const slideIds = useDeck(useShallow((state) => state.slides.map((s) => s.id)))
  const { addSlide } = useDeckActions()
  const moveSlide = useDeck((state) => state.moveSlide)
  return (
    <div className="flex flex-col gap-3" data-slide-list="">
      <Button variant="outline" onClick={addSlide}>
        <PlusIcon data-icon="inline-start" />
        Add slide
      </Button>
      <Sortable
        value={slideIds}
        getItemValue={getSlideId}
        onValueChange={() => {}}
        onMove={({ activeIndex, overIndex }) =>
          moveSlide(slideIds[activeIndex], overIndex)
        }
        className="flex flex-col gap-3"
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
