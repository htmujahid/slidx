export function DesignGrid() {
  return (
    <g data-editor-overlay="" pointerEvents="none">
      <defs>
        <pattern
          id="editor-grid-minor"
          width={10}
          height={10}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 H 0 V 10"
            fill="none"
            stroke="rgba(15, 23, 42, 0.08)"
            strokeWidth={1}
          />
        </pattern>
        <pattern
          id="editor-grid-major"
          width={50}
          height={50}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 50 0 H 0 V 50"
            fill="none"
            stroke="rgba(15, 23, 42, 0.16)"
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#editor-grid-minor)" />
      <rect width="100%" height="100%" fill="url(#editor-grid-major)" />
    </g>
  )
}
