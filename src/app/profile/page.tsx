import React from 'react'
import Link from 'next/link'
import { ChevronRight, LayoutList, Settings } from 'lucide-react'
import { getSessionUser } from '@/lib/user'
import prisma from '@/lib/db'
import MainLayout from '@/components/main-layout'
import PageHeader from '@/components/page-header'
import ExerciseProgressChart from '@/components/charts/exercise-progress'
import { FrequencyChart } from '@/components/charts/weekly-charts'
import { getExerciseProgress, getTrackedExercises, getWeeklyStats } from '@/actions/stats/_actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { formatTrainingSpan } from '@/lib/workout'
import { cn } from '@/lib/utils'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <p className='label-tec text-muted-foreground'>{label}</p>
      {/* "1 ano e 4 meses" nao cabe em um terço da largura no tamanho cheio */}
      <p className={cn('truncate font-semibold tabular',
        value.length > 9 ? 'text-base' : 'text-xl')}>
        {value}
      </p>
    </div>
  )
}

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) return null

  const [weekly, tracked, totalSessions, primeira] = await Promise.all([
    getWeeklyStats(12),
    getTrackedExercises(),
    prisma.workoutSession.count({ where: { userId: user.id } }),
    // O primeiro treino registrado e o marco de "treinando ha quanto tempo"
    prisma.workoutSession.findFirst({
      where: { userId: user.id },
      orderBy: { performedAt: 'asc' },
      select: { performedAt: true },
    }),
  ])

  const firstExercise = tracked[0]
  const initialProgress = firstExercise
    ? await getExerciseProgress(firstExercise.id)
    : []

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part![0])
    .join('')
    .toUpperCase() || '?'

  return (
    <MainLayout>
      <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <PageHeader title='Perfil' description='Sua evolução' />

        <Card>
          <CardContent className='flex items-center gap-3 p-4'>
            <span className='flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground tabular font-semibold'>
              {initials}
            </span>
            <div className='min-w-0'>
              <p className='truncate text-lg font-semibold'>{user.fullName ?? user.firstName}</p>
              <p className='truncate text-sm text-muted-foreground'>
                {/* Visitante não tem e-mail; a linha vira o convite de conta */}
                {user.isGuest ? 'Conta de teste, sem login' : user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid grid-cols-3 gap-3 p-4'>
            <Stat label='Sessões' value={String(totalSessions)} />
            <Stat label='Exercícios' value={String(tracked.length)} />
            {/* Antes aqui havia "12 semanas: 8", que era a contagem de sessoes
                na janela do grafico logo abaixo — dois numeros iguais com
                nomes diferentes, e nenhum dos dois dizia ha quanto tempo a
                pessoa treina. */}
            <Stat label='Treinando há'
              value={primeira ? formatTrainingSpan(primeira.performedAt) : '—'} />
          </CardContent>
        </Card>

        {totalSessions === 0 ? (
          <Alert>
            <AlertTitle>Nada para mostrar ainda</AlertTitle>
            <AlertDescription>
              Registre um treino e a evolução por exercício aparece aqui.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {firstExercise && (
              <ExerciseProgressChart
                exercises={tracked}
                initialExerciseId={firstExercise.id}
                initialData={initialProgress}
              />
            )}
            <FrequencyChart data={weekly} />
          </div>
        )}

        <div className='grid gap-2'>
          <Link href='/exercises'>
            <Card className='transition-colors hover:bg-muted active:bg-muted'>
              <CardContent className='flex items-center gap-3 p-4'>
                <LayoutList className='size-5 shrink-0 text-muted-foreground' />
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>Catálogo de exercícios</p>
                  <p className='text-sm text-muted-foreground'>Todos os exercícios disponíveis</p>
                </div>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </CardContent>
            </Card>
          </Link>

          <Link href='/settings'>
            <Card className='transition-colors hover:bg-muted active:bg-muted'>
              <CardContent className='flex items-center gap-3 p-4'>
                <Settings className='size-5 shrink-0 text-muted-foreground' />
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>Configurações</p>
                  <p className='text-sm text-muted-foreground'>Tema e cor de destaque</p>
                </div>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
