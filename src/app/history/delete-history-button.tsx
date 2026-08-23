'use client'

import React from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteWorkoutSession } from '@/actions/workout/_actions'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

function DeleteHistoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = React.useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWorkoutSession(id)
      if (result?.ok) {
        toast.success(result.message)
      } else {
        toast.error(result?.message ?? 'Não foi possível remover o registro')
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" disabled={isPending}
          className='bg-red-500/20 text-red-500 hover:bg-red-500/30 h-7 w-7 shadow-none'>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover esta sessão?</AlertDialogTitle>
          <AlertDialogDescription>
            Todas as séries registradas nela serão apagadas e sairão dos seus
            gráficos de evolução. A ficha de treino continua cadastrada.
            Não dá para desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteHistoryButton
