"use client"

import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { LogOutIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AccountMenu() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()
  const user = useQuery(api.auth.getCurrentUser)

  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          void authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          })
        }
      >
        Continue with Google
      </Button>
    )
  }

  const name = user?.name ?? user?.email ?? "Account"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Account menu" />
        }
      >
        <Avatar size="sm">
          <AvatarImage src={user?.image ?? undefined} alt={name} />
          <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            {user?.name}
            <span className="font-normal text-muted-foreground">
              {user?.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              void authClient.signOut({
                fetchOptions: { onSuccess: () => router.replace("/") },
              })
            }
          >
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu }
