'use client'

import React from 'react'
import { Dumbbell } from 'lucide-react'
import { getExerciseProgress, type ProgressPoint } from '@/actions/stats/_actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Picker, type PickerGroup } from '@/components/picker'
import { ProgressLine, progressSummary } from './progress-line'

export type TrackedExercise = {
  id: string
  name: string
  usesLoad: boolean
  tracking: string
}

/**
 * Progressão com seletor, para o perfil. A curva em si vem de ProgressLine,
 * a mesma usada na página do exercício — assim as duas não divergem.
 */
function ExerciseProgressChart({ exercises, initialExerciseId, initialData }: {
  exercises: TrackedExercise[]
  initialExerciseId: string
  initialData: ProgressPoint[]
}) {
  const [exerciseId, setExerciseId] = React.useState(initialExerciseId)
  const [data, setData] = React.useState(initialData)
  const [isPending, startTransition] = React.useTransition()

  const selected = exercises.find((exercise) => exercise.id === exerciseId)
  const measure = {
    usesLoad: selected?.usesLoad !== false,
    tracking: selected?.tracking ?? 'reps',
  }
  const { best, deltaLabel, delta, caption, format, enough } = progressSummary(data, measure)

  const groups: PickerGroup[] = React.useMemo(() => [{
    options: exercises.map((exercise) => ({
      value: exercise.id,
      label: exercise.name,
      hint: exercise.tracking === 'duration'
        ? 'por tempo'
        : exercise.usesLoad ? undefined : 'peso corporal',
    })),
  }], [exercises])

  function handleChange(value: string) {
    setExerciseId(value)
    startTransition(async () => {
      setData(await getExerciseProgress(value))
    })
  }

  return (
    <Card>
      <CardHeader className='pb-2 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <CardTitle className='label-tec text-muted-foreground'>Progressão</CardTitle>
            <p className='text-2xl font-semibold tabular tracking-tight'>
              {best > 0 ? format(best) : '—'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {enough ? caption : 'registre este exercício em mais de um treino'}
            </p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <span className='rounded-lg bg-accent p-2 text-accent-foreground'>
              <Dumbbell className='size-4' />
            </span>
            {enough && delta !== 0 && (
              <Badge variant={delta > 0 ? 'default' : 'secondary'} className='tabular'>
                {deltaLabel}
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
        <ProgressLine data={data} measure={measure} dimmed={isPending} />
      </CardContent>
    </Card>
  )
}

export default ExerciseProgressChart
