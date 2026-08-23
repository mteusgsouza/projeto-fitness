import { Button } from '@/components/ui/button'
import {
  BicepsFlexed,
  ClipboardList,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const items = [
  { href: '/', label: 'INÍCIO', Icon: Home },
  { href: '/training', label: 'TREINOS', Icon: BicepsFlexed },
  { href: '/history', label: 'HISTÓRICO', Icon: ClipboardList },
]

function BottomNavbar() {
  return (
    <div className="md:hidden">
      <div className="mt-16" />
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ">
        <div className="flex items-center">
          {items.map(({ href, label, Icon }) => (
            <Link key={href} href={href} passHref className="flex-1">
              <Button className="h-16 w-full flex-col gap-1.5 rounded-none bg-transparent shadow-none hover:bg-white/10 active:bg-white/10 [&_svg]:size-5">
                <Icon />
                <span className="text-[0.625rem] leading-none tracking-wide">
                  {label}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomNavbar
