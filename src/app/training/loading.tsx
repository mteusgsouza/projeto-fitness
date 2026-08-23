import React from 'react'
import { ListSkeleton, PageHeaderSkeleton } from '@/components/skeletons'

export default function TrainingLoading() {
  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeaderSkeleton />
      <div className='grid gap-3 md:grid-cols-2'>
        <ListSkeleton rows={2} />
        <ListSkeleton rows={2} />
      </div>
    </div>
  )
}
