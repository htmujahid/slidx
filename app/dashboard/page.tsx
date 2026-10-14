import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutDashboardIcon } from "lucide-react"

import { isAuthenticated } from "@/lib/auth-server"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/")
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutDashboardIcon />
          </EmptyMedia>
          <EmptyTitle>Dashboard</EmptyTitle>
          <EmptyDescription>
            Your saved work will show up here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/editor/new" />} nativeButton={false}>
            Open the editor
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
