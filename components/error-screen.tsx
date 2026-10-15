import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { BrandMark } from "@/components/editor/brand"

// Full-page message shared by the 404 and error pages.
export function ErrorScreen({
  code,
  title,
  description,
  children,
}: {
  code?: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <Empty className="max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia>
            <BrandMark className="size-12" />
          </EmptyMedia>
          {code ? (
            <p className="text-sm font-medium text-muted-foreground">{code}</p>
          ) : null}
          <EmptyTitle className="text-xl">{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {children ? (
          <EmptyContent className="flex-row justify-center">
            {children}
          </EmptyContent>
        ) : null}
      </Empty>
    </main>
  )
}
