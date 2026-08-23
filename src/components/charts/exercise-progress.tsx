'use client'

import React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Dumbbell } from 'lucide-react'
import { getExerciseProgress, type ProgressPoint } from '@/actions/stats/_actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import { Picker, type PickerGroup } from '@/components/picker'

type TrackedExercise = { id: string; name: string }

const config = {
  maxWeight: { label: 'Carga máxima', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  fontSize: 11,
} as const

function ExerciseProgressChart({ exercises, initialExerciseId, initialData }: {
  exercises: TrackedExercise[]
  initialExerciseId: string
  initialData: ProgressPoint[]
}) {
  const [exerciseId, setExerciseId] = React.useState(initialExerciseId)
  const [data, setData] = React.useState(initialData)
  const [isPending, startTransition] = React.useTransition()

  const groups: PickerGroup[] = React.useMemo(() => [{
    options: exercises.map((exercise) => ({ value: exercise.id, label: exercise.name })),
  }], [exercises])

  function handleChange(value: string) {
    setExerciseId(value)
    startTransition(async () => {
      setData(await getExerciseProgress(value))
    })
  }

  const best = data.length ? Math.max(...data.map((point) => point.maxWeight)) : 0
  const delta = data.length ? data[data.length - 1].maxWeight - data[0].maxWeight : 0
  const enoughData = data.length >= 2

  return (
    <Card>
      <CardHeader className='pb-2 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Progressão
            </CardTitle>
            <p className='text-2xl font-semibold tabular tracking-tight'>
              {best > 0 ? `${best} kg` : '—'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {enoughData
                ? 'recorde de carga'
                : 'registre este exercício em mais de um treino'}
            </p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <span className='rounded-lg bg-accent p-2 text-accent-foreground'>
              <Dumbbell className='size-4' />
            </span>
            {enoughData && delta !== 0 && (
              <Badge variant={delta > 0 ? 'default' : 'secondary'} className='tabular'>
                {delta > 0 ? '+' : ''}{delta} kg
              </Badge>
            )}
          </div>
        </div>

        <Picker
          groups={groups}
          value={exerciseId}
          onValueChange={handleChange}
          title='Escolher exercício'
          searchable
          searchPlaceholder='Buscar exercício...'
          className='h-10'
        />
      </CardHeader>

      <CardContent className='pl-0 pr-3 pb-3'>
        <ChartContainer config={config}
          className='aspect-auto h-[170px] w-full transition-opacity'
          style={{ opacity: isPending ? 0.5 : 1 }}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='label' {...axis} interval='preserveStartEnd' minTickGap={24} />
            <YAxis {...axis} width={36} tickFormatter={(value: number) => `${value}kg`} />
            <ChartTooltip content={
              <ChartTooltipContent
                formatter={(value) => `${Number(value)} kg`}
                indicator='dot'
              />
            } />
            <Line type='monotone' dataKey='maxWeight' stroke='var(--color-maxWeight)'
              strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-maxWeight)' }}
              activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ExerciseProgressChart
