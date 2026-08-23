import React from 'react'
import { Bar } from '@/components/skeletons'

export default function WorkoutLoading() {
  return (
    <div className='container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
      <div className='space-y-2'>
        <Bar className='h-5 w-16 rounded-full' />
        <Bar className='h-8 w-52' />
      </div>
      {[0, 1, 2].map((card) => (
        <div key={card} className='space-y-3 rounded-xl border border-border bg-card p-3'>
          <Bar className='h-4 w-2/3' />
          {[0, 1, 2].map((row) => (
            <div key={row} className='grid grid-cols-[1.5rem_1fr_1fr_3.25rem] items-center gap-2'>
              <Bar className='h-3 w-3' />
              <Bar className='h-11 rounded-lg' />
              <Bar className='h-11 rounded-lg' />
              <Bar className='h-11 rounded-lg' />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
