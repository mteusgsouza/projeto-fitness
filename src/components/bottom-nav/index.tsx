'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BicepsFlexed, ClipboardList, House, LayoutList, Play } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

const left = [
  { href: '/', label: 'Início', Icon: House },
  { href: '/training', label: 'Treinos', Icon: BicepsFlexed },
]

const right = [
  { href: '/history', label: 'Histórico', Icon: ClipboardList },
  { href: '/exercises', label: 'Exercícios', Icon: LayoutList },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Cinco colunas com a ação no centro exato. Com quatro colunas (3 destinos
 * + botão) o botão caía na 3ª de 4 e ficava visivelmente à direita do meio.
 */
function BottomNavbar() {
  const pathname = usePathname()
  const actionActive = pathname === '/history/create' || pathname.startsWith('/workout/')

  return (
    <nav className='md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg pb-safe'>
      <div className='grid grid-cols-5 items-end h-16'>
        {left.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        <div className='flex items-end justify-center h-16'>
          <Link href='/history/create' aria-label='Iniciar treino'
            aria-current={actionActive ? 'page' : undefined}
            className={cn(
              'mb-3 flex size-14 items-center justify-center rounded-full',
              'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
              'ring-4 ring-card transition-transform active:scale-95',
            )}>
            <Play className='size-6 fill-current' />
          </Link>
        </div>

        {right.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
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
        'flex h-16 flex-col items-center justify-center gap-1 transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}>
      <Icon className='size-5' />
      {/* estilos explícitos em vez de .label-tec: aquele fixa 0.14em de
          tracking e, na mesma layer de utilities, vence a classe do Tailwind.
          Com 0.14em "Exercícios" ocupava 74px numa coluna de 75px. */}
      <span className='text-[0.5625rem] font-semibold uppercase tracking-[0.02em]'>
        {label}
      </span>
    </Link>
  )
}

export default BottomNavbar
