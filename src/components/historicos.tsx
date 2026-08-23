import Link from 'next/link'
import React from 'react'
import { AlertCircle } from 'lucide-react'
import prisma from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { formatShortDate, formatVolume, totalVolume } from '@/lib/workout'
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
      setLogs: { select: { reps: true, weight: true } },
    },
  })

  if (!sessions.length) {
    return (
      <Link href="/training">
        <Alert className="cursor-pointer hover:bg-muted h-full">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Nenhum treino realizado</AlertTitle>
          <AlertDescription>
            Inicie um treino na lista de treinos e registre suas séries para
            começar a acompanhar sua evolução.
          </AlertDescription>
        </Alert>
      </Link>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col gap-1'>
          {sessions.map((session) => (
            <li key={session.id}>
              <Link href={`/history/${session.id}`}
                className='flex justify-between gap-3 hover:underline underline-offset-2'>
                <span className='truncate'>{session.trainingLabel}</span>
                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                  {formatShortDate(session.performedAt)}
                  {' · '}{formatVolume(totalVolume(session.setLogs))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/history"
          className='text-sm underline underline-offset-2 mt-3 inline-block'>
          Ver histórico completo
        </Link>
      </CardContent>
    </Card>
  )
}

export default HistoricosCard
