import React from 'react'
import HeaderNavigationMenu from './navgation-menu'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { ArrowLeft } from 'lucide-react'
import GoBackButton from './go-back-button'

function Header() {

  return (
    <div>
      {/* <div className='fixed w-full'> */}
      {/* <div className='bg-white/30 border-b border-b-zinc-50 dark:bg-zinc-900/30 dark:border-b-zinc-700 backdrop-blur-lg'> */}
      <div className='px-4 md:px-0 h-16 container mx-auto flex items-center content-between w-full'>
        <div className='hidden md:flex'>
          <HeaderNavigationMenu />
        </div>
        <div className='md:hidden'>
          <GoBackButton />
        </div>
        <div className='flex justify-end gap-4 items-center ml-auto'>
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" passHref>
              <Button>
                Sign In
              </Button>
            </Link>
          </SignedOut>
        </div>
      </div>
      {/* </div> */}
      {/* </div> */}
      {/* <div className='h-14 md:h-16 mb-3' /> */}
    </div>
  )
}

export default Header