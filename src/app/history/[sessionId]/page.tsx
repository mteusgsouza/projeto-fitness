import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/user'
import prisma from '@/lib/db'
import { formatDuration, formatNumber, formatSessionDate } from '@/lib/workout'
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
  const user = await getSessionUser()
  if (!user) return null

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      setLogs: {
        orderBy: { setNumber: 'asc' },
        include: {
          exercise: {
            select: { id: true, name: true, usesLoad: true, tracking: true, usesDistance: true },
          },
        },
      },
    },
  })
  if (!session) notFound()

  // Agrupa as séries por exercício preservando a ordem em que foram gravadas.
  type Grupo = {
    id: string
    name: string
    usesLoad: boolean
    porDuracao: boolean
    usesDistance: boolean
    sets: typeof session.setLogs
  }
  const byExercise = new Map<string, Grupo>()
  for (const log of session.setLogs) {
    const current = byExercise.get(log.exerciseId)
    if (current) current.sets.push(log)
    else byExercise.set(log.exerciseId, {
      id: log.exerciseId,
      name: log.exercise.name,
      usesLoad: log.exercise.usesLoad,
      porDuracao: log.exercise.tracking === 'duration',
      usesDistance: log.exercise.usesDistance,
      sets: [log],
    })
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
          // Distancia so ganha coluna quando foi de fato registrada
          const comKm = exercise.usesDistance
            && exercise.sets.some((set) => (set.distanceKm ?? 0) > 0)
          /*
            As colunas seguem o exercicio, como na tela de execucao: cardio
            mostra tempo (e km), musculacao mostra carga e reps. Vai em style
            porque a lista e montada em tempo de execucao.
          */
          const colsStyle = {
            gridTemplateColumns: [
              '2.75rem',
              ...(exercise.usesLoad ? ['1fr'] : []),
              '1fr',
              ...(comKm ? ['1fr'] : []),
              '2.5rem',
            ].join(' '),
          }
          return (
            <Card key={exercise.name}>
              <CardHeader className='p-3 pb-2'>
                <div className='flex items-start justify-between gap-2'>
                  <CardTitle className='text-base leading-tight'>
                    <Link href={`/exercises/${exercise.id}`}
                      className='transition-colors hover:text-primary'>
                      {exercise.name}
                    </Link>
                  </CardTitle>
                  {heaviest > 0 && (
                    <Badge variant='secondary' className='shrink-0 tabular'>
                      máx {formatNumber(heaviest)}kg
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='p-3 pt-0'>
                <div style={colsStyle}
                  className='grid gap-2 pb-1 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground'>
                  <span>Série</span>
                  {exercise.usesLoad && <span>Carga</span>}
                  <span>{exercise.porDuracao ? 'Tempo' : 'Reps'}</span>
                  {comKm && <span>Km</span>}
                  <span>RPE</span>
                </div>
                {exercise.sets.map((set) => (
                  <div key={set.id} style={colsStyle}
                    className='grid gap-2 border-b border-border py-2 text-sm tabular last:border-b-0'>
                    <span className='text-muted-foreground'>{set.setNumber}</span>
                    {exercise.usesLoad && (
                      <span className={set.weight === heaviest && heaviest > 0 ? 'font-semibold' : ''}>
                        {set.weight > 0 ? `${formatNumber(set.weight)} kg` : '—'}
                      </span>
                    )}
                    <span>
                      {exercise.porDuracao
                        ? (set.durationSeconds ? formatDuration(set.durationSeconds) : '—')
                        : (set.reps ?? '—')}
                    </span>
                    {comKm && (
                      <span>{set.distanceKm ? `${formatNumber(set.distanceKm)}` : '—'}</span>
                    )}
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
