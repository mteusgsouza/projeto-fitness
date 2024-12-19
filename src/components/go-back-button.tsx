'use client'
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'

function GoBackButton() {
  const path = usePathname()
  if (path === '/') return <></>
  return (
    <Button size={"icon"} onClick={() => window.history.back()}
      className='bg-transparent shadow-none text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'>
      <ArrowLeft className='w-5 h-5' />
    </Button>
  )
}

export default GoBackButton