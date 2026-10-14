import { ROOT_NODE, useEditor } from "@craftjs/core"

import { slideSizeOf, type SlideSize } from "@/lib/editor/slide-size"

export function useSlideSize(): SlideSize {
  return useEditor((state) =>
    slideSizeOf(state.nodes[ROOT_NODE]?.data.props)
  ) as SlideSize
}
