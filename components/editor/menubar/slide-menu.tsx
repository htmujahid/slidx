"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useSlides } from "@/components/editor/slides-context"

function SlideMenu() {
  const {
    slides,
    activeId,
    activeIndex,
    addSlide,
    duplicateSlide,
    deleteSlide,
    selectSlide,
  } = useSlides()

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
      </MenubarContent>
    </MenubarMenu>
  )
}

export { SlideMenu }
