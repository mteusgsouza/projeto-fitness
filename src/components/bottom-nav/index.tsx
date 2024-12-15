import { Button } from '@/components/ui/button'
import {
  Calendar,
  ChartNoAxesColumnDecreasingIcon,
  Home,
  Settings2,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function BottomNavbar() {
  return (
    <div className="md:hidden">
      <div className="mt-16" />
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 text-white">
        <div className="flex items-center">
          <Link href="/" passHref className="flex-1">
            <Button className="h-16 w-full flex-col gap-1.5 rounded-none bg-transparent text-white shadow-none hover:bg-white/10 active:bg-white/10 [&_svg]:size-5">
              <Home />
              <span className="text-[0.5rem] leading-none tracking-wide">
                INÍCIO
              </span>
            </Button>
          </Link>
          <Link href="/treinos" passHref className="flex-1">
            <Button className="h-16 w-full flex-col gap-1.5 rounded-none bg-transparent text-white shadow-none hover:bg-white/10 active:bg-white/10 [&_svg]:size-5">
              <Calendar />
              <span className="text-[0.5rem] leading-none tracking-wide">
                TREINOS
              </span>
            </Button>
          </Link>
          <Link href="/" passHref className="flex-1">
            <Button className="h-16 w-full flex-col gap-1.5 rounded-none bg-transparent text-white shadow-none hover:bg-white/10 active:bg-white/10 [&_svg]:size-5">
              <ChartNoAxesColumnDecreasingIcon />
              <span className="text-[0.5rem] leading-none tracking-wide">
                HISTÓRICO
              </span>
            </Button>
          </Link>
          <Link href="/" passHref className="flex-1">
            <Button className="h-16 w-full flex-col gap-1.5 rounded-none bg-transparent text-white shadow-none hover:bg-white/10 active:bg-white/10 [&_svg]:size-5">
              <Settings2 />
              <span className="text-[0.5rem] leading-none tracking-wide">
                MAIS
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BottomNavbar
