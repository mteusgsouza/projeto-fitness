import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { AlertCircle, ChevronRight } from 'lucide-react'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

async function TreinosCard() {
  const user = await currentUser()
  if (!user) return null

  const treinos = await prisma.training.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      label: true,
      trainingDay: true,
      _count: { select: { exercises: true } },
    },
  })

  if (!treinos.length) {
    return (
      <Link href='/training/create'>
        <Alert className='h-full cursor-pointer transition-colors hover:bg-muted'>
          <AlertCircle className='size-4' />
          <AlertTitle>Nenhum treino cadastrado</AlertTitle>
          <AlertDescription>
            Monte sua primeira ficha de treino.
          </AlertDescription>
        </Alert>
      </Link>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          Minhas fichas
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-3'>
        <ul className='divide-y divide-border'>
          {treinos.map((treino) => (
            <li key={treino.id}>
              <Link href={`/workout/${treino.id}`}
                className='flex items-center gap-3 py-2.5 transition-colors hover:text-primary'>
                <span className='w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  {trainingDayLabel(treino.trainingDay).slice(0, 3)}
                </span>
                <span className='min-w-0 flex-1 truncate text-sm'>{treino.label}</span>
                <span className='shrink-0 text-xs tabular text-muted-foreground'>
                  {treino._count.exercises}
                </span>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </Link>
            </li>
          ))}
        </ul>
        <Link href='/training'
          className='mt-3 inline-block text-sm underline underline-offset-2'>
          Gerenciar treinos
        </Link>
      </CardContent>
    </Card>
  )
}

export default TreinosCard
