import React from 'react'
import MainLayout from '@/components/main-layout'
import { Bar, ChartSkeleton, ListSkeleton } from '@/components/skeletons'

export default function HomeLoading() {
  return (
    <MainLayout>
      <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <div className='space-y-2'>
          <Bar className='h-3 w-32' />
          <Bar className='h-8 w-44' />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <ListSkeleton rows={3} />
          <ListSkeleton rows={3} />
        </div>
      </div>
    </MainLayout>
  )
}
