import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { AlertCircle } from 'lucide-react'
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
    select: { id: true, label: true, trainingDay: true },
  })

  if (!treinos.length) {
    return (
      <Link href="/training/create">
        <Alert className="cursor-pointer hover:bg-muted h-full">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Nenhum treino cadastrado</AlertTitle>
          <AlertDescription>
            Clique aqui para montar sua primeira ficha de treino.
          </AlertDescription>
        </Alert>
      </Link>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treinos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col gap-1'>
          {treinos.map((treino) => (
            <li key={treino.id}>
              <Link href="/training" className='hover:underline underline-offset-2'>
                <span className="capitalize mr-0.5">
                  {trainingDayLabel(treino.trainingDay)}
                </span> - {treino.label}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default TreinosCard
