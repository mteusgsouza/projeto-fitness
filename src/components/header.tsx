import React from 'react'
import HeaderNavigationMenu from './navgation-menu'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'

function Header() {
  return (
    <div className='px-4 md:px-0 py-6 container mx-auto flex content-between w-full'>
      <div className='hidden md:flex'>
        <HeaderNavigationMenu />
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
  )
}

export default Header