"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CopyIcon,
  PlusIcon,
  RulerDimensionLineIcon,
  Trash2Icon,
} from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { useDeckActions } from "@/hooks/use-deck-actions"
import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  selectActiveIndex,
  useChrome,
  useDeck,
} from "@/components/editor/editor-stores"

function SlideMenu() {
  const slideIds = useDeck(useShallow((state) => state.slides.map((s) => s.id)))
  const activeId = useDeck((state) => state.activeId)
  const activeIndex = useDeck(selectActiveIndex)
  const moveSlide = useDeck((state) => state.moveSlide)
  const {
    addSlide,
    duplicateSlide,
    deleteSlide,
    select: selectSlide,
  } = useDeckActions()
  const setDialog = useChrome((state) => state.setDialog)

  return (
    <MenubarMenu>
      <MenubarTrigger>Slide</MenubarTrigger>
      <MenubarContent className="min-w-56">
        <MenubarGroup>
          <MenubarItem onClick={addSlide}>
            <PlusIcon />
            New slide
          </MenubarItem>
          <MenubarItem onClick={() => duplicateSlide()}>
            <CopyIcon />
            Duplicate slide
          </MenubarItem>
          <MenubarItem
            variant="destructive"
            disabled={slideIds.length <= 1}
            onClick={() => deleteSlide()}
          >
            <Trash2Icon />
            Delete slide
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Move slide</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarGroup>
              <MenubarItem
                disabled={activeIndex === 0}
                onClick={() => moveSlide(activeId, 0)}
              >
                <ChevronsLeftIcon />
                Move to start
              </MenubarItem>
              <MenubarItem
                disabled={activeIndex === 0}
                onClick={() => moveSlide(activeId, activeIndex - 1)}
              >
                <ChevronLeftIcon />
                Move earlier
              </MenubarItem>
              <MenubarItem
                disabled={activeIndex === slideIds.length - 1}
                onClick={() => moveSlide(activeId, activeIndex + 1)}
              >
                <ChevronRightIcon />
                Move later
              </MenubarItem>
              <MenubarItem
                disabled={activeIndex === slideIds.length - 1}
                onClick={() => moveSlide(activeId, slideIds.length - 1)}
              >
                <ChevronsRightIcon />
                Move to end
              </MenubarItem>
            </MenubarGroup>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem
            disabled={activeIndex === 0}
            onClick={() => selectSlide(slideIds[activeIndex - 1])}
          >
            <ChevronLeftIcon />
            Previous slide
          </MenubarItem>
          <MenubarItem
            disabled={activeIndex === slideIds.length - 1}
            onClick={() => selectSlide(slideIds[activeIndex + 1])}
          >
            <ChevronRightIcon />
            Next slide
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem onClick={() => setDialog("size")}>
            <RulerDimensionLineIcon />
            Slide size…
          </MenubarItem>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}

export { SlideMenu }
