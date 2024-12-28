import Link from 'next/link'
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import prisma from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

async function HistoricosCard() {
  const user = await currentUser()
  const historicos = await prisma.trainingHistory?.findMany({
    where: {
      userId: user?.id
    },
    select: {
      id: true,
      createdAt: true,
      training: true,
    }
  })

  return (
    <div>
      <h1>Historico de treinos:</h1>
      {historicos?.length ?
        (<Card>
          <CardHeader>
            <CardTitle>
              Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {historicos?.map((historico) => (
                <li key={historico.id}>
                  {historico.createdAt.getDate()}-
                  treino:{historico.training.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>)
        :
        <Link href="/training/create">
          <Alert className="cursor-pointer hover:bg-muted">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Nenhum treino realizado</AlertTitle>
            <AlertDescription className="">
              Você ainda não tem treinos cadastrados, clique aqui para começar
            </AlertDescription>
          </Alert>
        </Link>
      }
    </div>
  )
}

export default HistoricosCard