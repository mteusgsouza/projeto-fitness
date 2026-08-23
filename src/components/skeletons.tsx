import React from 'react'
import { cn } from '@/lib/utils'

/** Bloco de esqueleto. O pulse do Tailwind já vem do tailwindcss-animate. */
export function Bar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)}
      style={style} aria-hidden='true' />
  )
}

/**
 * Esqueleto de um card de gráfico. As barras entram já na altura final,
 * então o layout não pula quando o dado chega.
 */
export function ChartSkeleton() {
  return (
    <div className='rounded-xl border border-border bg-card p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 space-y-2'>
          <Bar className='h-2.5 w-28' />
          <Bar className='h-8 w-24' />
          <Bar className='h-2 w-36' />
        </div>
        <Bar className='size-9 rounded-lg' />
      </div>
      <div className='mt-4 flex h-[160px] items-end gap-1.5'>
        {[30, 55, 42, 68, 24, 80, 62, 46, 88, 70, 52, 96].map((height, index) => (
          <div key={index} className='flex-1'>
            <Bar className='w-full rounded-sm' style={{ height: `${height}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className='grid gap-2'>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className='flex items-center gap-3 rounded-xl border border-border bg-card p-3'>
          <Bar className='size-11 rounded-lg' />
          <div className='flex-1 space-y-2'>
            <Bar className='h-3.5 w-2/3' />
            <Bar className='h-2.5 w-1/2' />
          </div>
          <Bar className='size-4 rounded' />
        </div>
      ))}
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className='flex items-start justify-between gap-3'>
      <div className='space-y-2'>
        <Bar className='hidden h-7 w-40 md:block' />
        <Bar className='h-3 w-24' />
      </div>
      <Bar className='h-9 w-28 rounded-lg' />
    </div>
  )
}
