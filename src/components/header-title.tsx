'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'

const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === '/', title: 'Projeto Fitness' },
  { match: (p) => p === '/training', title: 'Treinos' },
  { match: (p) => p === '/training/create', title: 'Novo treino' },
  { match: (p) => p.startsWith('/training/update'), title: 'Editar treino' },
  { match: (p) => p === '/history', title: 'Histórico' },
  { match: (p) => p === '/history/create', title: 'Treinar' },
  { match: (p) => p.startsWith('/history/'), title: 'Sessão' },
  { match: (p) => p.startsWith('/workout/'), title: 'Treino em andamento' },
  { match: (p) => p === '/exercises', title: 'Exercícios' },
  { match: (p) => p === '/settings', title: 'Configurações' },
]

function titleFor(pathname: string) {
  return TITLES.find((entry) => entry.match(pathname))?.title ?? 'Projeto Fitness'
}

/** Título contextual do mobile, com voltar quando não se está na raiz. */
function HeaderTitle() {
  const pathname = usePathname()
  const router = useRouter()
  const isRoot = pathname === '/'

  return (
    <div className='flex items-center gap-1 min-w-0'>
      {!isRoot && (
        <Button variant='ghost' size='icon' aria-label='Voltar'
          onClick={() => router.back()}
          className='-ml-2 size-9 shrink-0'>
          <ArrowLeft className='size-5' />
        </Button>
      )}
      <span className='font-semibold truncate'>{titleFor(pathname)}</span>
    </div>
  )
}

export default HeaderTitle
