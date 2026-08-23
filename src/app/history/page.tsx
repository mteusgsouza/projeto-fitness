import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight, ClipboardList, Dumbbell } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { formatSessionDate, formatVolume, totalVolume } from '@/lib/workout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DeleteHistoryButton from './delete-history-button'

async function HistoricoPage() {
  const user = await currentUser()
  if (!user) return null

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { performedAt: 'desc' },
    select: {
      id: true,
      trainingLabel: true,
      performedAt: true,
      setLogs: { select: { reps: true, weight: true, exerciseId: true } },
    },
  })

  return (
    <div className='container mx-auto px-4 md:p-6'>
      <div className='flex items-center justify-between mb-3'>
        <h1 className='text-2xl font-medium'>Histórico</h1>
        <Link href="/history/create" className='hidden md:block'>
          <Button size="sm">
            <Dumbbell /> Treinar
          </Button>
        </Link>
      </div>

      {!sessions.length ? (
        <Alert>
          <ClipboardList className="w-4 h-4" />
          <AlertTitle>Nenhum treino registrado ainda</AlertTitle>
          <AlertDescription>
            Inicie um treino na{' '}
            <Link href="/training" className='underline underline-offset-2'>
              lista de treinos
            </Link>{' '}
            e registre suas séries — elas aparecem aqui.
          </AlertDescription>
        </Alert>
      ) : (
        <div className='flex flex-col gap-2'>
          {sessions.map((session) => {
            const exerciseCount = new Set(session.setLogs.map((log) => log.exerciseId)).size
            return (
              <Card key={session.id}>
                <CardContent className='p-3 flex items-center gap-3'>
                  <Link href={`/history/${session.id}`} className='min-w-0 flex-1 group'>
                    <p className='font-medium truncate group-hover:underline underline-offset-2'>
                      {session.trainingLabel}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {formatSessionDate(session.performedAt)} às{' '}
                      {format(session.performedAt, 'HH:mm')}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
                      {' · '}{session.setLogs.length} {session.setLogs.length === 1 ? 'série' : 'séries'}
                      {' · '}{formatVolume(totalVolume(session.setLogs))}
                    </p>
                  </Link>
                  <Link href={`/history/${session.id}`} aria-label='Ver detalhes da sessão'>
                    <ChevronRight className='w-4 h-4 text-muted-foreground' />
                  </Link>
                  <DeleteHistoryButton id={session.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Link href="/history/create" className='md:hidden'>
        <Button size="lg" className='w-full my-3 uppercase'>
          <Dumbbell /> Treinar
        </Button>
      </Link>
    </div>
  )
}

export default HistoricoPage
