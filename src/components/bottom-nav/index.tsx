'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BicepsFlexed, ClipboardList, House, Play } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Início', Icon: House },
  { href: '/training', label: 'Treinos', Icon: BicepsFlexed },
  { href: '/history', label: 'Histórico', Icon: ClipboardList },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BottomNavbar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg pb-safe">
      <div className="grid grid-cols-4 items-end h-16">
        {items.slice(0, 2).map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon}
            active={isActive(pathname, href)} />
        ))}

        {/* Ação principal em destaque: chegar ao registro de treino em um toque */}
        <div className="flex justify-center">
          <Link href="/history/create" aria-label="Iniciar treino"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-card active:scale-95 transition-transform">
            <Play className="size-6 fill-current" />
          </Link>
        </div>

        {items.slice(2).map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon}
            active={isActive(pathname, href)} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ href, label, Icon, active }: {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}>
      <Icon className={cn('size-5', active && 'scale-110 transition-transform')} />
      {label}
    </Link>
  )
}

export default BottomNavbar
