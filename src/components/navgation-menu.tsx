"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BicepsFlexed, ClipboardList, House, Play, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { activeNavHref } from "@/lib/nav"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': House,
  '/training': BicepsFlexed,
  '/history/create': Play,
  '/history': ClipboardList,
  '/profile': UserRound,
}

const menus = [
  { title: "Início", href: "/" },
  { title: "Treinos", href: "/training" },
  { title: "Treinar", href: "/history/create" },
  { title: "Histórico", href: "/history" },
  { title: "Perfil", href: "/profile" },
]

export default function HeaderNavigationMenu() {
  const pathname = usePathname()
  // Mesma regra da barra inferior: um único destino ativo
  const active = activeNavHref(pathname)

  return (
    <nav className="flex items-center gap-1">
      {menus.map((menu) => {
        const Icon = ICONS[menu.href]
        const isActive = active === menu.href
        return (
          <Link key={menu.href} href={menu.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            <Icon className="size-4" />
            {menu.title}
          </Link>
        )
      })}
    </nav>
  )
}
