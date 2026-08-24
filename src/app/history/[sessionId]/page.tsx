import React from 'react'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { formatSessionDate } from '@/lib/workout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='truncate text-lg font-semibold tabular'>{value}</p>
    </div>
  )
}

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

  /**
   * Esforco medio da sessao. Substitui o volume somado: quilos de exercicios
   * diferentes nao se somam em nada legivel, enquanto o RPE ja nasce
   * normalizado de 1 a 10 por serie — a media diz quao dura foi a sessao e
   * permite comparar uma com a outra. Fica "—" se ninguem preencheu RPE.
   */
  const rpes = session.setLogs.map((log) => log.rpe).filter((rpe): rpe is number => rpe !== null)
  const esforco = rpes.length
    ? (rpes.reduce((total, rpe) => total + rpe, 0) / rpes.length).toLocaleString('pt-BR', {
      minimumFractionDigits: 1, maximumFractionDigits: 1,
    })
    : null

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>{session.trainingLabel}</h1>
        <p className='text-sm text-muted-foreground'>
          {formatSessionDate(session.performedAt)} às {format(session.performedAt, 'HH:mm')}
        </p>
      </div>

      <Card>
        <CardContent className='grid grid-cols-3 gap-3 p-4'>
          <Stat label='Exercícios' value={String(exercises.length)} />
          <Stat label='Séries' value={String(session.setLogs.length)} />
          <Stat label='Esforço médio' value={esforco ? `${esforco}/10` : '—'} />
        </CardContent>
      </Card>

      {session.notes && (
        <Card>
          <CardContent className='p-3 text-sm italic'>{session.notes}</CardContent>
        </Card>
      )}

      <div className='space-y-3'>
        {exercises.map((exercise) => {
          const heaviest = Math.max(...exercise.sets.map((set) => set.weight))
          return (
            <Card key={exercise.name}>
              <CardHeader className='p-3 pb-2'>
                <div className='flex items-start justify-between gap-2'>
                  <CardTitle className='text-base leading-tight'>{exercise.name}</CardTitle>
                  {heaviest > 0 && (
                    <Badge variant='secondary' className='shrink-0 tabular'>
                      máx {heaviest}kg
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='p-3 pt-0'>
                <div className='grid grid-cols-4 gap-2 pb-1 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground'>
                  <span>Série</span>
                  <span>Carga</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>
                {exercise.sets.map((set) => (
                  <div key={set.id}
                    className='grid grid-cols-4 gap-2 border-b border-border py-2 text-sm tabular last:border-b-0'>
                    <span className='text-muted-foreground'>{set.setNumber}</span>
                    <span className={set.weight === heaviest && heaviest > 0 ? 'font-semibold' : ''}>
                      {set.weight > 0 ? `${set.weight} kg` : '—'}
                    </span>
                    <span>{set.reps}</span>
                    <span className='text-muted-foreground'>{set.rpe ?? '—'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default SessionDetailPage
