'use client'

import React from 'react'
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { getExerciseProgress, type ProgressPoint } from '@/actions/stats/_actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

type TrackedExercise = { id: string; name: string }

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

function ExerciseProgressChart({ exercises, initialExerciseId, initialData }: {
  exercises: TrackedExercise[]
  initialExerciseId: string
  initialData: ProgressPoint[]
}) {
  const [exerciseId, setExerciseId] = React.useState(initialExerciseId)
  const [data, setData] = React.useState(initialData)
  const [isPending, startTransition] = React.useTransition()

  function handleChange(value: string) {
    setExerciseId(value)
    startTransition(async () => {
      setData(await getExerciseProgress(value))
    })
  }

  const best = data.length ? Math.max(...data.map((point) => point.maxWeight)) : 0
  const first = data.length ? data[0].maxWeight : 0
  const latest = data.length ? data[data.length - 1].maxWeight : 0
  const delta = latest - first

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <CardTitle className='text-base'>Progressão</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {data.length < 2
                ? 'Registre o mesmo exercício em mais de um treino para ver a evolução'
                : `Recorde ${best}kg · ${delta >= 0 ? '+' : ''}${delta}kg desde o primeiro registro`}
            </p>
          </div>
          <Select value={exerciseId} onValueChange={handleChange}>
            <SelectTrigger className='w-[150px] shrink-0'>
              <SelectValue placeholder='Exercício' />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='pl-0 pr-3'>
        <ResponsiveContainer width='100%' height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 150ms' }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false}
              stroke='hsl(var(--border))' />
            <XAxis dataKey='label' {...axisProps} interval='preserveStartEnd' />
            <YAxis {...axisProps} width={34}
              tickFormatter={(value: number) => `${value}kg`} />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(value) => [`${Number(value)} kg`, 'Carga máxima']} />
            <Line type='monotone' dataKey='maxWeight' stroke='hsl(var(--chart-1))'
              strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ExerciseProgressChart
