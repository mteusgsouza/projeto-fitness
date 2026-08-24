import React from 'react'
import MainLayout from '@/components/main-layout'
import { Bar, ChartSkeleton, PageHeaderSkeleton } from '@/components/skeletons'

export default function ProfileLoading() {
  return (
    <MainLayout>
      <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <PageHeaderSkeleton />
        <Bar className='h-20 w-full rounded-xl' />
        <Bar className='h-20 w-full rounded-xl' />
        <div className='grid gap-4 md:grid-cols-2'>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    </MainLayout>
  )
}
