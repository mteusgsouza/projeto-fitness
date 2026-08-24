'use client'

import React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Activity } from 'lucide-react'
import type { WeeklyPoint } from '@/actions/stats/_actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'

const frequencyConfig = {
  sessions: { label: 'Treinos', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  fontSize: 11,
} as const

function ChartHeading({ title, value, caption, Icon }: {
  title: string
  value: string
  caption: string
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <CardHeader className='pb-2 space-y-0'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            {title}
          </CardTitle>
          <p className='text-2xl font-semibold tabular tracking-tight'>{value}</p>
          <p className='text-xs text-muted-foreground'>{caption}</p>
        </div>
        <span className='rounded-lg bg-accent p-2 text-accent-foreground'>
          <Icon className='size-4' />
        </span>
      </div>
    </CardHeader>
  )
}

export function FrequencyChart({ data }: { data: WeeklyPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.sessions, 0)
  const average = data.length ? total / data.length : 0

  return (
    <Card>
      <ChartHeading
        title='Frequência'
        value={`${total} ${total === 1 ? 'treino' : 'treinos'}`}
        caption={`${average.toFixed(1).replace('.', ',')} por semana em ${data.length} semanas`}
        Icon={Activity}
      />
      <CardContent className='pl-0 pr-3 pb-3'>
        <ChartContainer config={frequencyConfig} className='aspect-auto h-[160px] w-full'>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='label' {...axis} interval='preserveStartEnd' minTickGap={24} />
            <YAxis {...axis} allowDecimals={false} width={26} />
            <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />
            <Bar dataKey='sessions' fill='var(--color-sessions)' radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
