import React from 'react'
import FormTrining from '../../create/form'
import prisma from '@/lib/db'

async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const treino = await prisma.training.findUnique({
    where: { id },
    include: { trainingMenu: true }
  })

  return (
    <div className='container mx-auto px-4 md:p-6'>
      <h1 className='text-xl md:text-2xl font-medium mb-3'>Atualizar Treino:</h1>
      {!treino ? null :
        <FormTrining idTraining={id}
          initialData={{
            label: treino.label,
            trainingDay: treino.trainingDay,
            trainingMenu: treino.trainingMenu
          }} />
      }
    </div>
  )
}

export default UpdatePage