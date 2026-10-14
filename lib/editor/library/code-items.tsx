import { CodeIcon } from "lucide-react"

import { measureCodeHeight } from "@/lib/editor/code"
import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { CodeBlock, DEFAULT_CODE } from "@/components/editor/nodes/code-block"

export const codeItems: LibraryItem[] = [
  {
    id: "code:block",
    group: "code",
    label: "Code block",
    icon: CodeIcon,
    create: (at) => {
      const width = 1200
      const height = measureCodeHeight(DEFAULT_CODE, 36)
      return <CodeBlock {...center(at, width, height)} />
    },
  },
]
