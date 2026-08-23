import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import FormTrining from './form'
import PageHeader from '@/components/page-header'

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
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeader title='Nova ficha' description='Monte o treino de um dia da semana' />
      <FormTrining
        exercises={exercises}
        takenDays={trainings.map((training) => training.trainingDay)}
      />
    </div>
  )
}

export default CreateTreino
