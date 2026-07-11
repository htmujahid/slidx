export function EllipseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="12" rx="9" ry="6" />
    </svg>
  )
}
