import React from 'react'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { formatSessionDate, formatVolume, totalVolume } from '@/lib/workout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const sessionId = (await params).sessionId
  const user = await currentUser()
  if (!user) return null

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      setLogs: {
        orderBy: { setNumber: 'asc' },
        include: { exercise: { select: { id: true, name: true } } },
      },
    },
  })
  if (!session) notFound()

  // Agrupa as séries por exercício preservando a ordem em que foram gravadas.
  const byExercise = new Map<string, { name: string; sets: typeof session.setLogs }>()
  for (const log of session.setLogs) {
    const current = byExercise.get(log.exerciseId)
    if (current) current.sets.push(log)
    else byExercise.set(log.exerciseId, { name: log.exercise.name, sets: [log] })
  }
  const exercises = [...byExercise.values()]

  return (
    <div className='container mx-auto px-4 md:p-6'>
      <h1 className='text-xl md:text-2xl font-medium'>{session.trainingLabel}</h1>
      <p className='text-sm text-muted-foreground'>
        {formatSessionDate(session.performedAt)} às {format(session.performedAt, 'HH:mm')}
        {' · '}{session.setLogs.length} {session.setLogs.length === 1 ? 'série' : 'séries'}
        {' · '}volume {formatVolume(totalVolume(session.setLogs))}
      </p>
      {session.notes && (
        <p className='text-sm mt-2 italic'>{session.notes}</p>
      )}

      <div className='flex flex-col gap-3 mt-4'>
        {exercises.map((exercise) => (
          <Card key={exercise.name}>
            <CardHeader className='p-3 pb-1'>
              <CardTitle className='text-base'>{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent className='p-3 pt-2'>
              <div className='grid grid-cols-4 gap-2 text-[0.625rem] uppercase tracking-wide text-muted-foreground'>
                <span>Série</span>
                <span>Carga</span>
                <span>Reps</span>
                <span>RPE</span>
              </div>
              {exercise.sets.map((set) => (
                <div key={set.id} className='grid grid-cols-4 gap-2 py-1.5 border-b last:border-b-0 tabular-nums'>
                  <span className='text-muted-foreground'>{set.setNumber}</span>
                  <span>{set.weight > 0 ? `${set.weight} kg` : '—'}</span>
                  <span>{set.reps}</span>
                  <span>{set.rpe === null ? '—' : set.rpe}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SessionDetailPage
