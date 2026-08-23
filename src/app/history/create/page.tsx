import React from 'react'
import Link from 'next/link'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/page-header'

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

  const ready = trainings.filter((training) => training._count.exercises > 0)

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeader title='Treinar' description='Escolha a ficha de hoje' />

      {!ready.length ? (
        <Link href='/training/create'>
          <Alert className='cursor-pointer hover:bg-muted transition-colors'>
            <AlertCircle className='size-4' />
            <AlertTitle>
              {trainings.length ? 'Nenhuma ficha com exercícios' : 'Nenhum treino cadastrado'}
            </AlertTitle>
            <AlertDescription>
              {trainings.length
                ? 'Suas fichas ainda não têm exercícios. Clique para adicioná-los.'
                : 'Monte uma ficha antes de registrar um treino. Clique para criar a primeira.'}
            </AlertDescription>
          </Alert>
        </Link>
      ) : (
        <div className='space-y-2'>
          {ready.map((training) => (
            <Link key={training.id} href={`/workout/${training.id}`}>
              <Card className='transition-colors hover:bg-muted active:bg-muted'>
                <CardContent className='flex items-center gap-3 p-3'>
                  <div className='min-w-0 flex-1'>
                    <Badge variant='secondary' className='mb-1 capitalize'>
                      {trainingDayLabel(training.trainingDay)}
                    </Badge>
                    <p className='truncate font-medium'>{training.label}</p>
                    <p className='text-sm text-muted-foreground'>
                      {training._count.exercises}{' '}
                      {training._count.exercises === 1 ? 'exercício' : 'exercícios'}
                    </p>
                  </div>
                  <ChevronRight className='size-5 shrink-0 text-muted-foreground' />
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
