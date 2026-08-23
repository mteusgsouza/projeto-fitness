import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import PageHeader from '@/components/page-header'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { currentUser } from '@clerk/nextjs/server'
import { AlertCircle, Pencil, Play, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import DeleteTrainingButton from './delete-dialog'

async function TrainingPage() {
  const user = await currentUser()
  if (!user) return null

  const treinos = await prisma.training.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      exercises: {
        orderBy: { order: 'asc' },
        include: { exercise: { select: { name: true } } },
      },
    },
  })

  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeader
        title='Treinos'
        description={`${treinos.length} ${treinos.length === 1 ? 'ficha' : 'fichas'}`}
        action={
          <Link href='/training/create' passHref>
            <Button size='sm'>
              <Plus className='size-4' /> Nova ficha
            </Button>
          </Link>
        }
      />

      {!treinos.length ? (
        <Link href='/training/create'>
          <Alert className='cursor-pointer hover:bg-muted transition-colors'>
            <AlertCircle className='size-4' />
            <AlertTitle>Nenhum treino cadastrado</AlertTitle>
            <AlertDescription>
              Monte sua primeira ficha para começar a registrar seus treinos.
            </AlertDescription>
          </Alert>
        </Link>
      ) : (
        <div className='grid gap-3 md:grid-cols-2'>
          {treinos.map((treino) => (
            <Card key={treino.id} className='flex flex-col'>
              <CardHeader className='p-3 pb-2 space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <Badge variant='secondary' className='mb-1 capitalize'>
                      {trainingDayLabel(treino.trainingDay)}
                    </Badge>
                    <CardTitle className='text-base leading-tight truncate'>
                      {treino.label}
                    </CardTitle>
                  </div>
                  <div className='flex shrink-0 gap-1'>
                    <Link href={`/training/update/${treino.id}`} passHref>
                      <Button size='icon' variant='ghost' aria-label='Editar treino'
                        className='size-9 text-muted-foreground hover:text-foreground'>
                        <Pencil className='size-4' />
                      </Button>
                    </Link>
                    <DeleteTrainingButton idTreino={treino.id} label={treino.label} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className='flex flex-1 flex-col p-3 pt-0'>
                {!treino.exercises.length ? (
                  <p className='py-2 text-sm text-muted-foreground'>
                    Nenhum exercício nesta ficha.
                  </p>
                ) : (
                  <ul className='mb-3 divide-y divide-border'>
                    {treino.exercises.map((item) => (
                      <li key={item.id} className='flex items-center justify-between gap-3 py-2'>
                        <span className='min-w-0 truncate text-sm'>{item.exercise.name}</span>
                        <span className='shrink-0 text-sm tabular text-muted-foreground'>
                          {item.sets}×{item.reps}
                          {item.targetWeight !== null && ` · ${item.targetWeight}kg`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {treino.exercises.length ? (
                  <Link href={`/workout/${treino.id}`} passHref className='mt-auto'>
                    <Button className='w-full h-11'>
                      <Play className='size-4 fill-current' /> Iniciar treino
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/training/update/${treino.id}`} passHref className='mt-auto'>
                    <Button variant='outline' className='w-full h-11'>
                      <Plus className='size-4' /> Adicionar exercícios
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrainingPage
