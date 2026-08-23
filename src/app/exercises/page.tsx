import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import MainLayout from '@/components/main-layout'
import PageHeader from '@/components/page-header'
import Catalog from './catalog'

export default async function ExercisesPage() {
  const user = await currentUser()
  if (!user) return null

  // Catálogo global + exercícios personalizados do próprio usuário
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
  })

  return (
    <MainLayout>
      <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <PageHeader title='Exercícios' description='Catálogo disponível para montar suas fichas' />
        <Catalog exercises={exercises} />
      </div>
    </MainLayout>
  )
}
