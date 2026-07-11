import { TimelineBody } from "./timeline-body"
import { TimelineProvider } from "./timeline-provider"

export function Timeline() {
  return (
    <TimelineProvider>
      <TimelineBody />
    </TimelineProvider>
  )
}
