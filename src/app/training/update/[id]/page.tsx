import React from 'react'
import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import FormTrining from '../../create/form'
import prisma from '@/lib/db'
import PageHeader from '@/components/page-header'

async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const user = await currentUser()
  if (!user) return null

  // Busca restrita ao dono: evita abrir o treino de outro usuário pelo id
  const treino = await prisma.training.findFirst({
    where: { id, userId: user.id },
    include: { exercises: { orderBy: { order: 'asc' } } },
  })
  if (!treino) notFound()

  const [exercises, others] = await Promise.all([
    prisma.exercise.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    }),
    prisma.training.findMany({
      where: { userId: user.id, NOT: { id } },
      select: { trainingDay: true },
    }),
  ])

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeader title='Editar ficha' description={treino.label} />
      <FormTrining
        idTraining={id}
        exercises={exercises}
        takenDays={others.map((training) => training.trainingDay)}
        initialData={{
          label: treino.label,
          trainingDay: treino.trainingDay,
          exercises: treino.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            durationSeconds: exercise.durationSeconds,
            targetWeight: exercise.targetWeight,
          })),
        }} />
    </div>
  )
}

export default UpdatePage
