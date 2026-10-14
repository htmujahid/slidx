import { SquareFunctionIcon } from "lucide-react"

import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { Equation } from "@/components/editor/nodes/equation"

export const equationItems: LibraryItem[] = [
  {
    id: "equation:equation",
    group: "equation",
    label: "Equation",
    icon: SquareFunctionIcon,
    create: (at) => <Equation {...center(at, 900, 220)} />,
  },
]
