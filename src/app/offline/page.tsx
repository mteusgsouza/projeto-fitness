import React from 'react'
import type { Metadata } from 'next'
import Logo from '@/components/logo'
import RetryButton from './retry-button'

export const metadata: Metadata = {
  title: 'Sem conexão',
}

/**
 * Tela servida pelo service worker quando uma navegação falha por falta de
 * rede (ver `public/sw.js`).
 *
 * Fica fora do MainLayout de propósito: o cabeçalho consulta o Clerk, e aqui
 * não há rede para isso. É também por isso que a rota não está na lista de
 * protegidas do `proxy.ts` — precisa ser buscável sem sessão para o service
 * worker conseguir guardá-la no install.
 */
function OfflinePage() {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center'>
      <Logo className='size-12 text-primary' />

      <h1 className='text-xl font-semibold tracking-tight'>Sem conexão</h1>

      <p className='max-w-xs text-sm text-muted-foreground'>
        Seus treinos ficam no servidor, então não dá para consultá-los agora.
        Quando a rede voltar, é só tentar de novo.
      </p>

      <RetryButton />
    </div>
  )
}

export default OfflinePage
