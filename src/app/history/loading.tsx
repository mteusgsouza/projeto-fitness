import React from 'react'
import { ListSkeleton, PageHeaderSkeleton } from '@/components/skeletons'

export default function HistoryLoading() {
  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <PageHeaderSkeleton />
      <ListSkeleton rows={5} />
    </div>
  )
}
