import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import FormTrining from './form'

async function CreateTreino() {
  const user = await currentUser()
  if (!user) return null

  const [exercises, trainings] = await Promise.all([
    // Catálogo global + exercícios personalizados do próprio usuário
    prisma.exercise.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    }),
    prisma.training.findMany({
      where: { userId: user.id },
      select: { trainingDay: true },
    }),
  ])

  return (
    <div className='container mx-auto px-4 md:p-6'>
      <h1 className='text-xl md:text-2xl font-medium mb-3'>Formulário de Treino:</h1>
      <FormTrining
        exercises={exercises}
        takenDays={trainings.map((training) => training.trainingDay)}
      />
    </div>
  )
}

export default CreateTreino
