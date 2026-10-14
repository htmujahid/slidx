import { ImageIcon, SmileIcon, StarIcon } from "lucide-react"

import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { EmojiBox } from "@/components/editor/nodes/emoji-box"
import { IconBox } from "@/components/editor/nodes/icon-box"
import { ImageBox } from "@/components/editor/nodes/image-box"

export const mediaItems: LibraryItem[] = [
  {
    id: "media:image",
    group: "media",
    label: "Image",
    icon: ImageIcon,
    create: (at) => <ImageBox {...center(at, 640, 400)} />,
  },
  {
    id: "media:icon",
    group: "media",
    label: "Icon",
    icon: StarIcon,
    create: (at) => <IconBox {...center(at, 160, 160)} />,
  },
  {
    id: "media:emoji",
    group: "media",
    label: "Emoji",
    icon: SmileIcon,
    create: (at) => <EmojiBox {...center(at, 160, 160)} />,
  },
]
