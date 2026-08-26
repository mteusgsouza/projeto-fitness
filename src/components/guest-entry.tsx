import React from 'react'
import { Compass } from 'lucide-react'
import { Button } from './ui/button'

/**
 * Entrada sem conta, embaixo do formulário do Clerk.
 *
 * É um form comum apontando para o route handler: o cookie de visitante
 * precisa ser gravado na resposta, e isso não acontece durante a renderização
 * de um server component.
 */
function GuestEntry() {
  return (
    <div className='mx-auto w-full max-w-[25rem] space-y-3'>
      <div className='flex items-center gap-3'>
        <span className='h-px flex-1 bg-border' />
        <span className='label-tec text-muted-foreground'>ou</span>
        <span className='h-px flex-1 bg-border' />
      </div>

      <form action='/api/guest/start' method='post'>
        <Button type='submit' variant='outline' className='w-full'>
          <Compass className='size-4' /> Entrar sem login
        </Button>
      </form>

      <p className='text-center text-xs text-muted-foreground'>
        Teste o app com fichas e histórico de exemplo. Se criar conta depois,
        as fichas que você montar vão junto.
      </p>
    </div>
  )
}

export default GuestEntry
