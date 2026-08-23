import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import prisma from '@/lib/db'
import { trainingDayLabel } from '@/lib/training-day'
import { currentUser } from '@clerk/nextjs/server'
import { AlertCircle, CirclePlay, Edit, PlusCircle } from 'lucide-react'
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
    <div className='container mx-auto px-4 md:p-6'>
      <div className='flex items-center justify-between mb-3'>
        <h1 className='text-2xl font-medium'>Treinos</h1>
        <Link href="/training/create" className='hidden md:block'>
          <Button size="sm">
            <PlusCircle /> Cadastrar
          </Button>
        </Link>
      </div>
      <div className='flex flex-col gap-3'>
        {!treinos.length ? (
          <Link href="/training/create">
            <Alert className="cursor-pointer hover:bg-muted">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Nenhum treino cadastrado</AlertTitle>
              <AlertDescription>
                Clique aqui para montar sua primeira ficha de treino.
              </AlertDescription>
            </Alert>
          </Link>
        ) : treinos.map((treino) => (
          <Card key={treino.id}>
            <CardHeader className='p-3'>
              <CardTitle className='flex items-center'>
                <span className='capitalize mr-0.5'>
                  {trainingDayLabel(treino.trainingDay)}
                </span> - {treino.label}
                <div className='flex gap-2 ml-auto'>
                  <Link href={`/workout/${treino.id}`} passHref>
                    <Button size="icon" aria-label="Iniciar treino" title="Iniciar treino"
                      className='bg-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500/30 h-7 w-7 shadow-none'>
                      <CirclePlay />
                    </Button>
                  </Link>
                  <Link href={`/training/update/${treino.id}`} passHref>
                    <Button size="icon" aria-label="Editar treino"
                      className='bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 h-7 w-7 shadow-none'>
                      <Edit />
                    </Button>
                  </Link>
                  <DeleteTrainingButton idTreino={treino.id} label={treino.label} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='px-2'>
              {!treino.exercises.length ? (
                <p className='px-1 py-2 text-sm text-muted-foreground'>
                  Nenhum exercício nesta ficha.
                </p>
              ) : treino.exercises.map((item) => (
                <div key={item.id} className='border-b px-1 py-2 flex justify-between items-center gap-3'>
                  <p className='min-w-0 truncate'>{item.exercise.name}</p>
                  <p className='text-sm tabular-nums whitespace-nowrap'
                    title={`${item.sets} séries de ${item.reps} repetições`}>
                    {item.sets} <span className='text-muted-foreground'>×</span> {item.reps}
                    {item.targetWeight !== null && (
                      <span className='text-muted-foreground'> · {item.targetWeight}kg</span>
                    )}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Link href="/training/create" className='md:hidden'>
        <Button size="lg" className='w-full my-3 uppercase'>
          <PlusCircle /> Cadastrar
        </Button>
      </Link>
    </div>
  )
}

export default TrainingPage
