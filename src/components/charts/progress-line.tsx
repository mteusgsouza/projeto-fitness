'use client'

import React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { ProgressPoint } from '@/actions/stats/_actions'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import { formatNumber } from '@/lib/workout'

const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  fontSize: 11,
} as const

/**
 * A curva de progressão de um exercício, sem chrome em volta.
 *
 * Exercício com carga progride em kg; peso corporal e cardio progridem em
 * repetições — carga ali é "não se aplica", não zero.
 *
 * Compartilhado entre a página do exercício (onde o exercício é fixo) e o
 * perfil (onde há um seletor por cima), para as duas não divergirem.
 */
export function ProgressLine({ data, usesLoad, dimmed }: {
  data: ProgressPoint[]
  usesLoad: boolean
  dimmed?: boolean
}) {
  const metric = usesLoad ? 'maxWeight' : 'maxReps'
  const unit = usesLoad ? 'kg' : 'reps'

  const config = {
    [metric]: {
      label: usesLoad ? 'Carga máxima' : 'Repetições máximas',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config}
      className='aspect-auto h-[170px] w-full transition-opacity'
      style={{ opacity: dimmed ? 0.5 : 1 }}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='label' {...axis} interval='preserveStartEnd' minTickGap={24} />
        <YAxis {...axis} width={40}
          tickFormatter={(value: number) => `${formatNumber(value)}${usesLoad ? 'kg' : ''}`} />
        <ChartTooltip content={
          <ChartTooltipContent
            formatter={(value) => `${formatNumber(Number(value))} ${unit}`}
            indicator='dot'
          />
        } />
        <Line type='monotone' dataKey={metric} stroke='var(--color-chart-1)'
          strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-chart-1)' }}
          activeDot={{ r: 5 }} />
      </LineChart>
    </ChartContainer>
  )
}

/** Recorde e variação desde o primeiro registro, na unidade certa. */
export function progressSummary(data: ProgressPoint[], usesLoad: boolean) {
  const values = data.map((point) => usesLoad ? point.maxWeight : point.maxReps)
  return {
    best: values.length ? Math.max(...values) : 0,
    delta: values.length ? values[values.length - 1] - values[0] : 0,
    unit: usesLoad ? 'kg' : 'reps',
    enough: data.length >= 2,
  }
}

export default ProgressLine
