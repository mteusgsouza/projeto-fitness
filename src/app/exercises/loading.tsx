import React from 'react'
import MainLayout from '@/components/main-layout'
import { Bar, ListSkeleton, PageHeaderSkeleton } from '@/components/skeletons'

export default function ExercisesLoading() {
  return (
    <MainLayout>
      <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <PageHeaderSkeleton />
        <Bar className='h-11 w-full rounded-lg' />
        <ListSkeleton rows={6} />
      </div>
    </MainLayout>
  )
}
