import React from 'react'
import Link from 'next/link'
import { getSessionUser } from '@/lib/user'

/**
 * Faixa do modo visitante. Existe para a pessoa não confundir o teste com uma
 * conta: o que ela registrar aqui vive num cookie deste navegador e some junto
 * com ele.
 */
async function GuestBanner() {
  const user = await getSessionUser()
  if (!user?.isGuest) return null

  return (
    <div className='relative border-b border-primary/25 bg-primary/10'>
      <div className='container mx-auto flex items-center gap-3 px-4 py-2 text-sm md:px-6'>
        <p className='min-w-0 flex-1'>
          <span className='font-medium'>Modo visitante</span>
          <span className='text-muted-foreground'>
            {' '}— dados de exemplo, só neste navegador
          </span>
        </p>
        <Link href='/sign-up' className='shrink-0 font-medium underline underline-offset-2'>
          Criar conta
        </Link>
      </div>
    </div>
  )
}

export default GuestBanner
