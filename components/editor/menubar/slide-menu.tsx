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
import { useEditorLayout } from "@/components/editor/editor-layout"
import { useSlides } from "@/components/editor/slides-context"

function SlideMenu() {
  const {
    slides,
    activeId,
    activeIndex,
    addSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
    selectSlide,
  } = useSlides()
  const { setDialog } = useEditorLayout()

  return (
    <MenubarMenu>
      <MenubarTrigger>Slide</MenubarTrigger>
      <MenubarContent className="min-w-56">
        <MenubarGroup>
          <MenubarItem onClick={addSlide}>
            <PlusIcon />
            New slide
          </MenubarItem>
          <MenubarItem onClick={() => duplicateSlide(activeId)}>
            <CopyIcon />
            Duplicate slide
          </MenubarItem>
          <MenubarItem
            variant="destructive"
            disabled={slides.length <= 1}
            onClick={() => deleteSlide(activeId)}
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
                disabled={activeIndex === slides.length - 1}
                onClick={() => moveSlide(activeId, activeIndex + 1)}
              >
                <ChevronRightIcon />
                Move later
              </MenubarItem>
              <MenubarItem
                disabled={activeIndex === slides.length - 1}
                onClick={() => moveSlide(activeId, slides.length - 1)}
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
            onClick={() => selectSlide(slides[activeIndex - 1].id)}
          >
            <ChevronLeftIcon />
            Previous slide
          </MenubarItem>
          <MenubarItem
            disabled={activeIndex === slides.length - 1}
            onClick={() => selectSlide(slides[activeIndex + 1].id)}
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
