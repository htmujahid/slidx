import { TableIcon } from "lucide-react"

import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { Table } from "@/components/editor/nodes/table"

export const tableItems: LibraryItem[] = [
  {
    id: "table:table",
    group: "table",
    label: "Table",
    icon: TableIcon,
    create: (at) => <Table {...center(at, 1200, 520)} />,
  },
]
