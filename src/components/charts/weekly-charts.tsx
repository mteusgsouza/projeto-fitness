'use client'

import React from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import type { WeeklyPoint } from '@/actions/stats/_actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatVolume } from '@/lib/workout'

const axisProps = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  fontSize: '0.8rem',
} as const

export function FrequencyChart({ data }: { data: WeeklyPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.sessions, 0)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Frequência</CardTitle>
        <p className='text-sm text-muted-foreground'>
          {total} {total === 1 ? 'treino' : 'treinos'} nas últimas {data.length} semanas
        </p>
      </CardHeader>
      <CardContent className='pl-0 pr-3'>
        <ResponsiveContainer width='100%' height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false}
              stroke='hsl(var(--border))' />
            <XAxis dataKey='label' {...axisProps} interval='preserveStartEnd' />
            <YAxis {...axisProps} allowDecimals={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }}
              formatter={(value) => {
                const sessions = Number(value)
                return [`${sessions} treino${sessions === 1 ? '' : 's'}`, 'Sessões']
              }} />
            <Bar dataKey='sessions' fill='hsl(var(--chart-1))' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function VolumeChart({ data }: { data: WeeklyPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.volume, 0)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Volume por semana</CardTitle>
        <p className='text-sm text-muted-foreground'>
          {formatVolume(total)} movimentados no período
        </p>
      </CardHeader>
      <CardContent className='pl-0 pr-3'>
        <ResponsiveContainer width='100%' height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id='volumeFill' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='hsl(var(--chart-2))' stopOpacity={0.5} />
                <stop offset='100%' stopColor='hsl(var(--chart-2))' stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' vertical={false}
              stroke='hsl(var(--border))' />
            <XAxis dataKey='label' {...axisProps} interval='preserveStartEnd' />
            <YAxis {...axisProps} width={38}
              tickFormatter={(value: number) => value >= 1000 ? `${Math.round(value / 1000)}t` : String(value)} />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(value) => [formatVolume(Number(value)), 'Volume']} />
            <Area type='monotone' dataKey='volume' stroke='hsl(var(--chart-2))'
              strokeWidth={2} fill='url(#volumeFill)' />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
