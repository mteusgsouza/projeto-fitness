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

export type TrackedExercise = { id: string; name: string; usesLoad: boolean }

/** Separador decimal pt-BR, sem casas desnecessarias: 42,5 / 15 */
function num(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

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

  const selected = exercises.find((exercise) => exercise.id === exerciseId)

  /**
   * Exercício com carga progride em kg; peso corporal e cardio progridem em
   * repetições — carga ali é "não se aplica", não zero.
   */
  const usesLoad = selected?.usesLoad !== false
  const metric = usesLoad ? 'maxWeight' : 'maxReps'
  const unit = usesLoad ? 'kg' : 'reps'

  const config = {
    [metric]: {
      label: usesLoad ? 'Carga máxima' : 'Repetições máximas',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const groups: PickerGroup[] = React.useMemo(() => [{
    options: exercises.map((exercise) => ({
      value: exercise.id,
      label: exercise.name,
      hint: exercise.usesLoad ? undefined : 'peso corporal',
    })),
  }], [exercises])

  function handleChange(value: string) {
    setExerciseId(value)
    startTransition(async () => {
      setData(await getExerciseProgress(value))
    })
  }

  const values = data.map((point) => usesLoad ? point.maxWeight : point.maxReps)
  const best = values.length ? Math.max(...values) : 0
  const delta = values.length ? values[values.length - 1] - values[0] : 0
  const enoughData = data.length >= 2

  return (
    <Card>
      <CardHeader className='pb-2 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <CardTitle className='label-tec text-muted-foreground'>Progressão</CardTitle>
            <p className='text-2xl font-semibold tabular tracking-tight'>
              {best > 0 ? `${num(best)} ${unit}` : '—'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {enoughData
                ? (usesLoad ? 'recorde de carga' : 'recorde de repetições')
                : 'registre este exercício em mais de um treino'}
            </p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <span className='rounded-lg bg-accent p-2 text-accent-foreground'>
              <Dumbbell className='size-4' />
            </span>
            {enoughData && delta !== 0 && (
              <Badge variant={delta > 0 ? 'default' : 'secondary'} className='tabular'>
                {delta > 0 ? '+' : ''}{num(delta)} {unit}
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
            <YAxis {...axis} width={40} tickFormatter={(value: number) => `${num(value)}${usesLoad ? 'kg' : ''}`} />
            <ChartTooltip content={
              <ChartTooltipContent formatter={(value) => `${num(Number(value))} ${unit}`} indicator='dot' />
            } />
            <Line type='monotone' dataKey={metric} stroke='var(--color-chart-1)'
              strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-chart-1)' }}
              activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ExerciseProgressChart
