import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

async function TreinosCard() {
  const user = await currentUser()
  const treinos = await prisma.training.findMany({
    where: {
      userId: user?.id
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Treinos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {treinos?.map((treino) => (
            <li key={treino.id}>
              <span className="capitalize mr-0.5">{treino.trainingDay}</span> - {treino.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default TreinosCard