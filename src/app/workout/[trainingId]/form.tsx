'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Plus, Trash2 } from 'lucide-react'
import { createWorkoutSession, syncPrescriptionWeights } from '@/actions/workout/_actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type WorkoutExercise = {
  exerciseId: string
  name: string
  equipment: string | null
  prescribedSets: number
  prescribedReps: number
  targetWeight: number | null
  /** Falso para peso corporal e cardio: a coluna de carga nem aparece. */
  usesLoad: boolean
  previousSets: { reps: number; weight: number; rpe: number | null }[]
}

type SetRow = { reps: string; weight: string; rpe: string }

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Pré-preenche com a última sessão; sem histórico, cai na prescrição da ficha. */
function initialSets(exercise: WorkoutExercise): SetRow[] {
  if (exercise.previousSets.length) {
    return exercise.previousSets.map((set) => ({
      reps: String(set.reps),
      weight: String(set.weight),
      rpe: set.rpe === null ? '' : String(set.rpe),
    }))
  }
  return Array.from({ length: Math.max(1, exercise.prescribedSets) }, () => ({
    reps: String(exercise.prescribedReps),
    weight: exercise.targetWeight === null ? '' : String(exercise.targetWeight),
    rpe: '',
  }))
}

function WorkoutForm({ trainingId, exercises }: {
  trainingId: string
  exercises: WorkoutExercise[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [performedAt, setPerformedAt] = React.useState(() => toLocalInputValue(new Date()))
  const [notes, setNotes] = React.useState('')
  const [rows, setRows] = React.useState<Record<string, SetRow[]>>(() =>
    Object.fromEntries(exercises.map((exercise) => [exercise.exerciseId, initialSets(exercise)]))
  )

  function updateSet(exerciseId: string, index: number, field: keyof SetRow, value: string) {
    setRows((current) => {
      const sets = [...current[exerciseId]]
      sets[index] = { ...sets[index], [field]: value }
      return { ...current, [exerciseId]: sets }
    })
  }

  function addSet(exerciseId: string) {
    setRows((current) => {
      const sets = current[exerciseId]
      const last = sets[sets.length - 1] ?? { reps: '', weight: '', rpe: '' }
      return { ...current, [exerciseId]: [...sets, { ...last, rpe: '' }] }
    })
  }

  function removeSet(exerciseId: string, index: number) {
    setRows((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].filter((_, position) => position !== index),
    }))
  }

  const totalSets = Object.values(rows).flat()
    .filter((set) => Number(set.reps) > 0).length

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const entries = exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: (rows[exercise.exerciseId] ?? [])
        .map((set) => ({
          reps: Number(set.reps),
          weight: set.weight === '' ? 0 : Number(set.weight),
          rpe: set.rpe === '' ? null : Number(set.rpe),
        }))
        // Séries em branco são simplesmente ignoradas
        .filter((set) => Number.isFinite(set.reps) && set.reps > 0),
    })).filter((entry) => entry.sets.length > 0)

    if (!entries.length) {
      toast.error('Preencha pelo menos uma série com repetições')
      return
    }

    startTransition(async () => {
      const result = await createWorkoutSession({
        trainingId,
        performedAt: new Date(performedAt).toISOString(),
        notes: notes.trim() === '' ? null : notes.trim(),
        entries,
      })

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      // Se a carga executada divergiu da ficha, oferece atualizar a prescrição.
      const divergences = exercises.flatMap((exercise) => {
        const entry = entries.find((item) => item.exerciseId === exercise.exerciseId)
        if (!entry) return []
        const heaviest = Math.max(...entry.sets.map((set) => set.weight))
        if (heaviest <= 0 || heaviest === exercise.targetWeight) return []
        return [{ exerciseId: exercise.exerciseId, targetWeight: heaviest }]
      })

      if (divergences.length) {
        toast.success(result.message, {
          description: 'A carga executada ficou diferente da ficha.',
          duration: 8000,
          action: {
            label: 'Atualizar ficha',
            onClick: async () => {
              const synced = await syncPrescriptionWeights(trainingId, divergences)
              if (synced.ok) toast.success(synced.message)
              else toast.error(synced.message)
            },
          },
        })
      } else {
        toast.success(result.message)
      }

      router.push('/history')
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      {exercises.map((exercise) => {
        const sets = rows[exercise.exerciseId] ?? []
        // Sem carga, a coluna some e as demais reocupam a largura
        const cols = exercise.usesLoad
          ? 'grid grid-cols-[1.5rem_1fr_1fr_3.25rem_2.25rem] items-center gap-2'
          : 'grid grid-cols-[1.5rem_1fr_3.25rem_2.25rem] items-center gap-2'
        return (
          <Card key={exercise.exerciseId}>
            <CardHeader className='p-3 pb-2 space-y-1'>
              <div className='flex items-start justify-between gap-2'>
                <CardTitle className='text-base leading-tight'>{exercise.name}</CardTitle>
                <Badge variant='secondary' className='shrink-0 tabular'>
                  {exercise.prescribedSets}×{exercise.prescribedReps}
                  {exercise.targetWeight !== null && ` · ${exercise.targetWeight}kg`}
                </Badge>
              </div>
              {exercise.previousSets.length > 0 && (
                <p className='text-xs text-muted-foreground'>
                  Última vez: {exercise.previousSets
                    .map((set) => exercise.usesLoad
                      ? `${set.weight}kg×${set.reps}`
                      : `${set.reps} reps`)
                    .join(' · ')}
                </p>
              )}
            </CardHeader>

            <CardContent className='p-3 pt-0'>
              <div className={`${cols} px-0.5 pb-1 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground`}>
                <span>#</span>
                {exercise.usesLoad && <span>Carga</span>}
                <span>Reps</span>
                <span>RPE</span>
                <span className='sr-only'>Remover</span>
              </div>

              <div className='space-y-2'>
                {sets.map((set, index) => (
                  <div key={index} className={cols}>
                    <span className='text-sm tabular text-muted-foreground'>{index + 1}</span>
                    {exercise.usesLoad && (
                      <Input type='number' min={0} step='0.5' inputMode='decimal' placeholder='0'
                        aria-label={`Carga da série ${index + 1} de ${exercise.name}`}
                        value={set.weight}
                        onChange={(event) => updateSet(exercise.exerciseId, index, 'weight', event.target.value)}
                        className='h-11 text-center tabular text-base' />
                    )}
                    <Input type='number' min={0} inputMode='numeric' placeholder='0'
                      aria-label={`Repetições da série ${index + 1} de ${exercise.name}`}
                      value={set.reps}
                      onChange={(event) => updateSet(exercise.exerciseId, index, 'reps', event.target.value)}
                      className='h-11 text-center tabular text-base' />
                    <Input type='number' min={1} max={10} inputMode='numeric' placeholder='—'
                      aria-label={`Esforço percebido da série ${index + 1} de ${exercise.name}`}
                      value={set.rpe}
                      onChange={(event) => updateSet(exercise.exerciseId, index, 'rpe', event.target.value)}
                      className='h-11 px-1 text-center tabular' />
                    <Button type='button' size='icon' variant='ghost'
                      aria-label={`Remover série ${index + 1}`}
                      disabled={sets.length === 1}
                      onClick={() => removeSet(exercise.exerciseId, index)}
                      className='size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type='button' variant='ghost' size='sm'
                onClick={() => addSet(exercise.exerciseId)}
                className='mt-2 w-full text-muted-foreground hover:text-foreground'>
                <Plus className='size-4' /> Série
              </Button>
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardContent className='p-3 grid gap-3 md:grid-cols-2'>
          <div>
            <Label htmlFor='performedAt' className='text-xs text-muted-foreground'>
              Data e hora
            </Label>
            <Input id='performedAt' type='datetime-local' value={performedAt}
              onChange={(event) => setPerformedAt(event.target.value)}
              className='h-11 mt-1.5' />
          </div>
          <div>
            <Label htmlFor='notes' className='text-xs text-muted-foreground'>
              Observações
            </Label>
            <Input id='notes' value={notes} placeholder='opcional'
              onChange={(event) => setNotes(event.target.value)}
              className='h-11 mt-1.5' />
          </div>
        </CardContent>
      </Card>

      {/* Fixa no rodapé: finalizar não pode exigir rolar até o fim de uma
          lista longa. A tela de execução é modo foco e não tem barra
          inferior, então não há folga a reservar. */}
      <div className='sticky bottom-4 z-30 pt-2'>
        <Button type='submit' size='lg' disabled={isPending}
          className='w-full shadow-lg shadow-primary/20'>
          <Check className='size-5' />
          {isPending ? 'Salvando...' : `Finalizar · ${totalSets} ${totalSets === 1 ? 'série' : 'séries'}`}
        </Button>
      </div>
    </form>
  )
}

export default WorkoutForm
