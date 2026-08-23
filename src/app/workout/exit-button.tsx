'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * A tela de execução é modo foco: sem barra inferior e sem navegação.
 * Este é o único caminho de saída, então ele não pode faltar.
 */
function WorkoutExitButton() {
  const router = useRouter()

  return (
    <Button variant='ghost' size='icon' aria-label='Sair do treino'
      onClick={() => router.back()}
      className='size-10 shrink-0'>
      <ArrowLeft className='size-5' />
    </Button>
  )
}

export default WorkoutExitButton
