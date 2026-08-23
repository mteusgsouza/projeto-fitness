import React from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import HeaderNavigationMenu from './navgation-menu'
import HeaderTitle from './header-title'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'

// O Clerk Core 3 removeu <SignedIn>/<SignedOut>; em server component
// a checagem passa a ser feita direto com auth().
async function Header() {
  const { userId } = await auth()

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg'>
      <div className='container mx-auto flex h-14 items-center gap-2 px-4 md:h-16 md:px-6'>
        <div className='hidden md:flex'>
          <HeaderNavigationMenu />
        </div>
        <div className='md:hidden min-w-0 flex-1'>
          <HeaderTitle />
        </div>

        <div className='ml-auto flex items-center gap-1'>
          <ModeToggle />
          {userId ? (
            <>
              <Link href='/settings' passHref>
                <Button variant='ghost' size='icon' className='size-9' aria-label='Configurações'>
                  <Settings className='size-[1.15rem]' />
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <Link href='/sign-in' passHref>
              <Button size='sm'>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
