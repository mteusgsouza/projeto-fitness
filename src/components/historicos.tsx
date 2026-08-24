import Link from 'next/link'
import React from 'react'
import { AlertCircle, ChevronRight } from 'lucide-react'
import prisma from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { formatShortDate } from '@/lib/workout'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

async function HistoricosCard() {
  const user = await currentUser()
  if (!user) return null

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { performedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      trainingLabel: true,
      performedAt: true,
      _count: { select: { setLogs: true } },
    },
  })

  if (!sessions.length) {
    return (
      <Link href='/history/create'>
        <Alert className='h-full cursor-pointer transition-colors hover:bg-muted'>
          <AlertCircle className='size-4' />
          <AlertTitle>Nenhum treino realizado</AlertTitle>
          <AlertDescription>
            Registre suas séries para começar a acompanhar sua evolução.
          </AlertDescription>
        </Alert>
      </Link>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          Últimas atividades
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-3'>
        <ul className='divide-y divide-border'>
          {sessions.map((session) => (
            <li key={session.id}>
              <Link href={`/history/${session.id}`}
                className='flex items-center gap-3 py-2.5 transition-colors hover:text-primary'>
                <span className='min-w-0 flex-1 truncate text-sm'>
                  {session.trainingLabel}
                </span>
                <span className='shrink-0 text-xs tabular text-muted-foreground'>
                  {formatShortDate(session.performedAt)}
                  {' · '}{session._count.setLogs} séries
                </span>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </Link>
            </li>
          ))}
        </ul>
        <Link href='/history'
          className='mt-3 inline-block text-sm underline underline-offset-2'>
          Ver histórico completo
        </Link>
      </CardContent>
    </Card>
  )
}

export default HistoricosCard
