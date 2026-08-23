import React from 'react'
import Link from 'next/link'
import { AlertCircle, CirclePlay } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

/** Escolha de qual ficha treinar. O registro em si acontece em /workout/[id]. */
async function StartWorkoutPage() {
  const user = await currentUser()
  if (!user) return null

  const trainings = await prisma.training.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      label: true,
      trainingDay: true,
      _count: { select: { exercises: true } },
    },
  })

  return (
    <div className='container mx-auto px-4 md:p-6'>
      <h1 className='text-xl md:text-2xl font-medium mb-3'>Qual treino você vai fazer?</h1>

      {!trainings.length ? (
        <Link href="/training/create">
          <Alert className="cursor-pointer hover:bg-muted max-w-md">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Nenhum treino cadastrado</AlertTitle>
            <AlertDescription>
              Você precisa montar uma ficha antes de registrar um treino.
              Clique aqui para criar a primeira.
            </AlertDescription>
          </Alert>
        </Link>
      ) : (
        <div className='flex flex-col gap-2 max-w-md'>
          {trainings.map((training) => (
            <Link key={training.id} href={`/workout/${training.id}`}>
              <Card className='hover:bg-muted transition-colors'>
                <CardContent className='p-3 flex items-center gap-3'>
                  <div className='min-w-0'>
                    <p className='font-medium truncate'>
                      <span className='capitalize'>{trainingDayLabel(training.trainingDay)}</span>
                      {' - '}{training.label}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {training._count.exercises}{' '}
                      {training._count.exercises === 1 ? 'exercício' : 'exercícios'}
                    </p>
                  </div>
                  <CirclePlay className='w-5 h-5 ml-auto text-sky-600 dark:text-sky-400' />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default StartWorkoutPage
