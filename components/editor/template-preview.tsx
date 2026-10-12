import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import { getTemplateBounds, type SlideTemplate } from "@/lib/editor/templates"

function TemplatePreview({
  template,
  className,
}: {
  template: SlideTemplate
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}`}
      className={className}
      aria-hidden="true"
    >
      <rect
        x={10}
        y={10}
        width={SLIDE_WIDTH - 20}
        height={SLIDE_HEIGHT - 20}
        rx={40}
        fill="none"
        strokeWidth={20}
        className="stroke-border"
      />
      {getTemplateBounds(template.json).map((bounds, index) => (
        <rect
          key={index}
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          rx={20}
          fill={bounds.fill ?? "currentColor"}
          fillOpacity={bounds.fill ? 1 : 0.4}
        />
      ))}
    </svg>
  )
}

export { TemplatePreview }
