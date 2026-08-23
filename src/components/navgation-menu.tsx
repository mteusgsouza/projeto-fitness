"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BicepsFlexed, ClipboardList, House, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const menus = [
  { title: "Início", href: "/", Icon: House },
  { title: "Treinos", href: "/training", Icon: BicepsFlexed },
  { title: "Histórico", href: "/history", Icon: ClipboardList },
  { title: "Treinar", href: "/history/create", Icon: Play },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/history/create') return pathname === '/history/create' || pathname.startsWith('/workout/')
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function HeaderNavigationMenu() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {menus.map((menu) => {
        const active = isActive(pathname, menu.href)
        return (
          <Link key={menu.href} href={menu.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            <menu.Icon className="size-4" />
            {menu.title}
          </Link>
        )
      })}
    </nav>
  )
}
