import React from 'react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dumbbell } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { getExerciseProgress } from '@/actions/stats/_actions'
import { ProgressLine } from '@/components/charts/progress-line'
import MainLayout from '@/components/main-layout'
import { levelLabel, muscleGroupLabel } from '@/lib/exercise'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LEVEL_TONE: Record<string, string> = {
  iniciante: 'bg-primary/15 text-primary border-primary/25',
  intermediario: 'bg-chart-3/15 text-chart-3 border-chart-3/25',
  avancado: 'bg-destructive/15 text-destructive border-destructive/25',
}

function num(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const user = await currentUser()
  if (!user) return null

  // Catálogo global ou exercício próprio — nunca de outro usuário
  const exercise = await prisma.exercise.findFirst({
    where: { id, OR: [{ userId: null }, { userId: user.id }] },
  })
  if (!exercise) notFound()

  // O que este usuário já fez neste exercício
  const logs = await prisma.setLog.findMany({
    where: { exerciseId: exercise.id, session: { userId: user.id } },
    select: {
      reps: true,
      weight: true,
      sessionId: true,
      session: { select: { performedAt: true } },
    },
    orderBy: { session: { performedAt: 'desc' } },
  })

  const sessoes = new Set(logs.map((log) => log.sessionId)).size
  const recorde = logs.length
    ? (exercise.usesLoad
      ? Math.max(...logs.map((log) => log.weight))
      : Math.max(...logs.map((log) => log.reps)))
    : 0
  const ultima = logs[0]?.session.performedAt

  // A curva vem da mesma consulta que alimenta a progressao no perfil
  const progresso = logs.length ? await getExerciseProgress(exercise.id) : []

  return (
    <MainLayout>
      <div className='container mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6 space-y-4'>
        {/* O voltar fica so no header: ele usa router.back() e leva de volta
            para onde a pessoa veio, enquanto um link fixo para /exercises
            mandaria para o lugar errado quem chegou pelo perfil. */}
        <div className='min-w-0'>
          <p className='label-tec text-muted-foreground'>
            {muscleGroupLabel(exercise.muscleGroup)}
          </p>
          <h1 className='text-2xl font-semibold tracking-tight'>{exercise.name}</h1>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline' className={LEVEL_TONE[exercise.level] ?? ''}>
            {levelLabel(exercise.level)}
          </Badge>
          {exercise.equipment && (
            <Badge variant='secondary'>{exercise.equipment}</Badge>
          )}
          <Badge variant='secondary'>
            {exercise.usesLoad ? 'com carga' : 'sem carga'}
          </Badge>
        </div>

        {exercise.description && (
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='label-tec text-muted-foreground'>Como executar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm leading-relaxed'>{exercise.description}</p>
            </CardContent>
          </Card>
        )}

        {exercise.muscles.length > 0 && (
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='label-tec text-muted-foreground'>
                Músculos trabalhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {exercise.muscles.map((muscle, index) => (
                  <Badge key={muscle}
                    variant={index === 0 ? 'default' : 'secondary'}>
                    {muscle}
                  </Badge>
                ))}
              </div>
              <p className='mt-3 text-xs text-muted-foreground'>
                O primeiro é o músculo principal; os demais atuam como auxiliares.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='label-tec text-muted-foreground'>
              Seu histórico neste exercício
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!logs.length ? (
              <p className='text-sm text-muted-foreground'>
                Você ainda não registrou este exercício.
              </p>
            ) : (
              <>
                <div className='grid grid-cols-3 gap-3'>
                  <div>
                    <p className='label-tec text-muted-foreground'>Sessões</p>
                    <p className='text-xl font-semibold tabular'>{sessoes}</p>
                  </div>
                  <div>
                    <p className='label-tec text-muted-foreground'>Recorde</p>
                    <p className='text-xl font-semibold tabular'>
                      {num(recorde)} {exercise.usesLoad ? 'kg' : 'reps'}
                    </p>
                  </div>
                  <div>
                    <p className='label-tec text-muted-foreground'>Última vez</p>
                    <p className='text-xl font-semibold tabular'>
                      {ultima ? format(ultima, "d 'de' MMM", { locale: ptBR }) : '—'}
                    </p>
                  </div>
                </div>
                {progresso.length >= 2 ? (
                  <div className='mt-4 -ml-2'>
                    <ProgressLine data={progresso} usesLoad={exercise.usesLoad} />
                  </div>
                ) : (
                  <p className='mt-3 text-sm text-muted-foreground'>
                    Registre este exercício em mais de um treino para ver a curva
                    de progressão.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!exercise.usesLoad && (
          <p className='flex items-start gap-2 text-xs text-muted-foreground'>
            <Dumbbell className='mt-0.5 size-3.5 shrink-0' />
            Este exercício não usa carga externa, então a progressão dele é medida
            em repetições. A versão com peso, quando existe, é um exercício
            separado no catálogo.
          </p>
        )}
      </div>
    </MainLayout>
  )
}
