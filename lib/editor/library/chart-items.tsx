import { CHART_KINDS } from "@/lib/editor/chart"
import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { ChartBox } from "@/components/editor/nodes/chart-box"

export const chartItems: LibraryItem[] = CHART_KINDS.map(
  ({ kind, label, icon }) => ({
    id: `chart:${kind}`,
    group: "chart",
    label,
    icon,
    create: (at) => <ChartBox kind={kind} {...center(at, 960, 540)} />,
  })
)
