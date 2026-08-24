'use client'

import React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { ProgressPoint } from '@/actions/stats/_actions'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import { progressMetric, type Measure } from '@/lib/progress'

const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  fontSize: 11,
} as const

export type { Measure }

/**
 * A curva de progressão de um exercício, sem chrome em volta.
 *
 * Compartilhado entre a página do exercício (onde o exercício é fixo) e o
 * perfil (onde há um seletor por cima), para as duas não divergirem.
 */
export function ProgressLine({ data, measure, dimmed }: {
  data: ProgressPoint[]
  measure: Measure
  dimmed?: boolean
}) {
  const metric = progressMetric(measure)

  const config = {
    [metric.key]: { label: metric.title, color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config}
      className='aspect-auto h-[170px] w-full transition-opacity'
      style={{ opacity: dimmed ? 0.5 : 1 }}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='label' {...axis} interval='preserveStartEnd' minTickGap={24} />
        <YAxis {...axis} width={44}
          tickFormatter={(value: number) => metric.tick(value)} />
        <ChartTooltip content={
          <ChartTooltipContent
            formatter={(value) => metric.format(Number(value))}
            indicator='dot'
          />
        } />
        <Line type='monotone' dataKey={metric.key} stroke='var(--color-chart-1)'
          strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-chart-1)' }}
          activeDot={{ r: 5 }} />
      </LineChart>
    </ChartContainer>
  )
}

/** Recorde e variação desde o primeiro registro, na unidade certa. */
export function progressSummary(data: ProgressPoint[], measure: Measure) {
  const metric = progressMetric(measure)
  const values = data.map((point) => point[metric.key])
  const delta = values.length ? values[values.length - 1] - values[0] : 0
  return {
    best: values.length ? Math.max(...values) : 0,
    delta,
    // O sinal vem separado: formatDuration nao sabe escrever tempo negativo
    deltaLabel: `${delta > 0 ? '+' : '−'}${metric.format(Math.abs(delta))}`,
    caption: metric.caption,
    format: metric.format,
    enough: data.length >= 2,
  }
}

export default ProgressLine
