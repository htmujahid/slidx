export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground first:pt-1">
      {children}
    </div>
  )
}
