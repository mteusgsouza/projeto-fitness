
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import prisma from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { Edit, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import DeleteTrainingButton from './delete-dialog'

async function TrainingPage() {
  const user = await currentUser()

  const treinos = await prisma.training.findMany({
    where: {
      userId: user?.id
    },
    include: {
      trainingMenu: true
    }
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
        {treinos?.map((treino) => (
          <Card key={treino.id}>
            <CardHeader className='p-3'>
              <CardTitle className='flex items-center'>
                <span className='capitalize mr-0.5'>
                  {treino.trainingDay.includes('terca') ? 'Terça' : treino.trainingDay}
                </span> - {treino.label}
                <div className='flex gap-2 ml-auto'>
                  <Link href={`/training/update/${treino.id}`} passHref>
                    <Button size="icon" className='bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 h-7 w-7 shadow-none'>
                      <Edit />
                    </Button>
                  </Link>
                  <DeleteTrainingButton idTreino={treino.id} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='px-2'>
              {treino.trainingMenu.map((menu) => (
                <div key={menu.id} className='border-b px-1 py-2 flex justify-between items-center'>
                  <p className='col-span-3'>{menu.label}</p>
                  <div className='flex gap-1 items-center'>
                    <p>{menu.reps}</p>
                    x
                    <p>{menu.sets}</p>
                  </div>
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