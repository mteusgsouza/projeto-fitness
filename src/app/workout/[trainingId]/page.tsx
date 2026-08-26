import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/user'
import { AlertCircle } from 'lucide-react'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import WorkoutForm, { type WorkoutExercise } from './form'
import WorkoutExitButton from '../exit-button'

async function WorkoutPage({
  params,
}: {
  params: Promise<{ trainingId: string }>
}) {
  const trainingId = (await params).trainingId
  const user = await getSessionUser()
  if (!user) return null

  const training = await prisma.training.findFirst({
    where: { id: trainingId, userId: user.id },
    include: {
      exercises: {
        orderBy: { order: 'asc' },
        include: { exercise: { select: { id: true, name: true, equipment: true, usesLoad: true, tracking: true, usesDistance: true } } },
      },
    },
  })
  if (!training) notFound()

  const exerciseIds = training.exercises.map((item) => item.exerciseId)

  // Séries da última sessão de cada exercício, para pré-preencher o formulário.
  const previousLogs = exerciseIds.length
    ? await prisma.setLog.findMany({
      where: { exerciseId: { in: exerciseIds }, session: { userId: user.id } },
      orderBy: [{ session: { performedAt: 'desc' } }, { setNumber: 'asc' }],
      select: {
        exerciseId: true, sessionId: true, setNumber: true,
        reps: true, durationSeconds: true, distanceKm: true, weight: true, rpe: true,
      },
      take: 300,
    })
    : []

  // Para cada exercício fica só a sessão mais recente (a primeira que aparece
  // na ordenação por performedAt desc).
  const lastSessionByExercise = new Map<string, typeof previousLogs>()
  const chosenSession = new Map<string, string>()
  for (const log of previousLogs) {
    const chosen = chosenSession.get(log.exerciseId)
    if (chosen === undefined) {
      chosenSession.set(log.exerciseId, log.sessionId)
    } else if (chosen !== log.sessionId) {
      continue
    }
    const list = lastSessionByExercise.get(log.exerciseId) ?? []
    list.push(log)
    lastSessionByExercise.set(log.exerciseId, list)
  }

  const exercises: WorkoutExercise[] = training.exercises.map((item) => {
    const previous = lastSessionByExercise.get(item.exerciseId) ?? []
    return {
      exerciseId: item.exerciseId,
      name: item.exercise.name,
      equipment: item.exercise.equipment,
      usesLoad: item.exercise.usesLoad,
      tracking: item.exercise.tracking,
      usesDistance: item.exercise.usesDistance,
      prescribedSets: item.sets,
      prescribedReps: item.reps,
      prescribedDuration: item.durationSeconds,
      targetWeight: item.targetWeight,
      previousSets: previous.map((log) => ({
        reps: log.reps,
        durationSeconds: log.durationSeconds,
        distanceKm: log.distanceKm,
        weight: log.weight,
        rpe: log.rpe,
      })),
    }
  })

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <div className='flex items-start gap-2'>
        <WorkoutExitButton />
        <div className='min-w-0'>
          <Badge variant='secondary' className='mb-1 capitalize'>
            {trainingDayLabel(training.trainingDay)}
          </Badge>
          <h1 className='text-2xl font-semibold tracking-tight'>{training.label}</h1>
          <p className='text-sm text-muted-foreground'>
            Ajuste cada série conforme o que você realmente fez.
          </p>
        </div>
      </div>

      {!exercises.length ? (
        <Link href={`/training/update/${training.id}`}>
          <Alert className='cursor-pointer hover:bg-muted max-w-md'>
            <AlertCircle className='w-4 h-4' />
            <AlertTitle>Esta ficha não tem exercícios</AlertTitle>
            <AlertDescription>
              Clique aqui para adicionar exercícios antes de treinar.
            </AlertDescription>
          </Alert>
        </Link>
      ) : (
        <WorkoutForm trainingId={training.id} exercises={exercises} />
      )}
    </div>
  )
}

export default WorkoutPage
