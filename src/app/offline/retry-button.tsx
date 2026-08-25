'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

/**
 * Recarrega a URL que falhou, não a home.
 *
 * O service worker serve esta tela mantendo o endereço pedido — quem tentou
 * abrir /history continua em /history. Um reload repete exatamente essa
 * requisição, que é o que "tentar de novo" deveria significar. Um <Link>
 * também não serviria: navegação client-side precisa buscar o payload no
 * servidor, justamente o que não há aqui.
 */
function RetryButton() {
  return (
    <Button className='mt-2' onClick={() => window.location.reload()}>
      Tentar de novo
    </Button>
  )
}

export default RetryButton
