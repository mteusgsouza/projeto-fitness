import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight, ClipboardList, Play } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { formatSessionDate } from '@/lib/workout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/page-header'
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
      setLogs: { select: { exerciseId: true } },
    },
  })

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeader
        title='Histórico'
        description={`${sessions.length} ${sessions.length === 1 ? 'sessão' : 'sessões'}`}
        action={
          <Link href='/history/create' passHref>
            <Button size='sm'>
              <Play className='size-4 fill-current' /> Treinar
            </Button>
          </Link>
        }
      />

      {!sessions.length ? (
        <Alert>
          <ClipboardList className='size-4' />
          <AlertTitle>Nenhum treino registrado ainda</AlertTitle>
          <AlertDescription>
            Inicie um treino na{' '}
            <Link href='/training' className='underline underline-offset-2'>
              lista de treinos
            </Link>{' '}
            e registre suas séries — elas aparecem aqui.
          </AlertDescription>
        </Alert>
      ) : (
        <div className='space-y-2'>
          {sessions.map((session) => {
            const exerciseCount = new Set(session.setLogs.map((log) => log.exerciseId)).size
            return (
              <Card key={session.id} className='overflow-hidden'>
                <CardContent className='flex items-center gap-1 p-0'>
                  <Link href={`/history/${session.id}`}
                    className='flex min-w-0 flex-1 items-center gap-3 p-3 transition-colors hover:bg-muted active:bg-muted'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium'>{session.trainingLabel}</p>
                      <p className='text-sm text-muted-foreground'>
                        {formatSessionDate(session.performedAt)} · {format(session.performedAt, 'HH:mm')}
                      </p>
                      <p className='text-sm text-muted-foreground tabular'>
                        {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
                        {' · '}{session.setLogs.length} {session.setLogs.length === 1 ? 'série' : 'séries'}
                      </p>
                    </div>
                    <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
                  </Link>
                  <div className='pr-2'>
                    <DeleteHistoryButton id={session.id} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistoricoPage
