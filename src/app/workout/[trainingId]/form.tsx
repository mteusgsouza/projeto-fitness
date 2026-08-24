'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ListCollapse } from 'lucide-react'
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createWorkoutSession, syncPrescriptionWeights } from '@/actions/workout/_actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { joinDuration, splitDuration } from '@/lib/workout'
import ExerciseCard from './exercise-card'
import type { SetRow, WorkoutExercise } from './types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type { WorkoutExercise } from './types'

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Pré-preenche com a última sessão; sem histórico, cai na prescrição da ficha. */
function initialSets(exercise: WorkoutExercise): SetRow[] {
  if (exercise.previousSets.length) {
    return exercise.previousSets.map((set) => {
      const duracao = splitDuration(set.durationSeconds)
      return {
        reps: set.reps === null ? '' : String(set.reps),
        min: duracao.min,
        sec: duracao.sec,
        km: set.distanceKm === null ? '' : String(set.distanceKm),
        weight: String(set.weight),
        rpe: set.rpe === null ? '' : String(set.rpe),
      }
    })
  }
  const prescrito = splitDuration(exercise.prescribedDuration)
  return Array.from({ length: Math.max(1, exercise.prescribedSets) }, () => ({
    reps: exercise.prescribedReps === null ? '' : String(exercise.prescribedReps),
    min: prescrito.min,
    sec: prescrito.sec,
    km: '',
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

  /**
   * Ordem de execucao desta sessao. Vale so aqui: a ficha nao muda, porque
   * trocar a ordem de hoje nao significa querer trocar a prescricao.
   */
  const [order, setOrder] = React.useState(() => exercises.map((exercise) => exercise.exerciseId))
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  /**
   * O que foi de fato executado. Comeca tudo desmarcado porque as series ja
   * nascem pre-preenchidas com a ultima sessao: sem isso, "tem numero no campo"
   * seria confundido com "foi feito", e o treino inteiro entrava no registro
   * mesmo com exercicios pulados.
   */
  const [done, setDone] = React.useState<Record<string, boolean>>({})
  const [confirmando, setConfirmando] = React.useState(false)

  const byId = React.useMemo(
    () => new Map(exercises.map((exercise) => [exercise.exerciseId, exercise])),
    [exercises],
  )

  /**
   * Arrastar so comeca depois de 8px de movimento: sem isso, um toque para
   * marcar ou rolar viraria arrasto. O sensor de teclado mantem a reordenacao
   * possivel sem mouse, que era a duvida contra largar as setas.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder((current) => {
      const from = current.indexOf(String(active.id))
      const to = current.indexOf(String(over.id))
      return from < 0 || to < 0 ? current : arrayMove(current, from, to)
    })
  }

  function toggle(exerciseId: string) {
    setCollapsed((current) => ({ ...current, [exerciseId]: !current[exerciseId] }))
  }

  const allCollapsed = order.every((id) => collapsed[id])

  function toggleAll() {
    setCollapsed(allCollapsed ? {} : Object.fromEntries(order.map((id) => [id, true])))
  }

  /** Marcar recolhe o card; desmarcar reabre. E o que transforma a lista no
   *  resumo do que ainda falta conforme o treino avanca. */
  function toggleDone(exerciseId: string) {
    const marcando = !done[exerciseId]
    setDone((current) => ({ ...current, [exerciseId]: marcando }))
    setCollapsed((current) => ({ ...current, [exerciseId]: marcando }))
  }

  const feitos = order.filter((id) => done[id])
  const pendentes = order.filter((id) => !done[id])

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
      const last = sets[sets.length - 1]
        ?? { reps: '', min: '', sec: '', km: '', weight: '', rpe: '' }
      return { ...current, [exerciseId]: [...sets, { ...last, rpe: '' }] }
    })
  }

  function removeSet(exerciseId: string, index: number) {
    setRows((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].filter((_, position) => position !== index),
    }))
  }

  /**
   * Uma série só existe se a medida do exercício estiver preenchida — tempo
   * em cardio e isometria, repetições no resto. Antes isso era sempre
   * `reps > 0`, o que descartaria os 20 minutos de esteira inteiros.
   */
  function medida(exercise: WorkoutExercise, set: SetRow) {
    return exercise.tracking === 'duration'
      ? (joinDuration(set.min, set.sec) ?? 0) > 0
      : Number(set.reps) > 0
  }

  // So o que foi marcado conta: e isso que o botao Finalizar promete gravar
  const totalSets = feitos
    .map((id) => byId.get(id)!)
    .flatMap((exercise) => (rows[exercise.exerciseId] ?? []).filter((set) => medida(exercise, set)))
    .length

  /** So o marcado vira registro; a ordem e a da tela, nao a da ficha. */
  function buildEntries() {
    return feitos.map((id) => byId.get(id)!).map((exercise) => {
      const porDuracao = exercise.tracking === 'duration'
      return {
        exerciseId: exercise.exerciseId,
        // Séries em branco são simplesmente ignoradas
        sets: (rows[exercise.exerciseId] ?? [])
          .filter((set) => medida(exercise, set))
          .map((set) => ({
            // reps e duração são exclusivos: guardar os dois deixaria ambíguo
            reps: porDuracao ? null : Number(set.reps),
            durationSeconds: porDuracao ? joinDuration(set.min, set.sec) : null,
            distanceKm: exercise.usesDistance && Number(set.km) > 0 ? Number(set.km) : null,
            weight: set.weight === '' ? 0 : Number(set.weight),
            rpe: set.rpe === '' ? null : Number(set.rpe),
          })),
      }
    }).filter((entry) => entry.sets.length > 0)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!buildEntries().length) {
      toast.error('Marque ao menos um exercício como feito')
      return
    }

    // Descartar exercicio desmarcado sem avisar seria o mesmo silencio de
    // antes, so que ao contrario. Com todos marcados, envia direto.
    if (pendentes.length) {
      setConfirmando(true)
      return
    }
    enviar()
  }

  function enviar() {
    setConfirmando(false)
    const entries = buildEntries()

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
      const divergences = feitos.map((id) => byId.get(id)!).flatMap((exercise) => {
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
      {/* Progresso do treino + recolher tudo, que deixa a lista curta o
          bastante para reordenar sem rolar a tela */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <span className='label-tec text-muted-foreground'>
            {feitos.length} de {order.length} exercícios
          </span>
          <Button type='button' variant='outline' size='sm' onClick={toggleAll}>
            <ListCollapse className='size-4' />
            {allCollapsed ? 'Expandir tudo' : 'Recolher tudo'}
          </Button>
        </div>
        <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
          <div className='h-full rounded-full bg-primary transition-[width] duration-300'
            style={{ width: `${order.length ? (feitos.length / order.length) * 100 : 0}%` }} />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Movendo ${byId.get(String(active.id))?.name}`,
            onDragOver: ({ over }) => over ? `Sobre ${byId.get(String(over.id))?.name}` : '',
            onDragEnd: ({ over }) => over ? `Solto em ${byId.get(String(over.id))?.name}` : 'Movimento cancelado',
            onDragCancel: () => 'Movimento cancelado',
          },
        }}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className='space-y-3'>
            {order.map((exerciseId, position) => {
              const exercise = byId.get(exerciseId)
              if (!exercise) return null
              return (
                <ExerciseCard
                  key={exerciseId}
                  exercise={exercise}
                  position={position}
                  sets={rows[exerciseId] ?? []}
                  isCollapsed={!!collapsed[exerciseId]}
                  isDone={!!done[exerciseId]}
                  onToggleCollapse={toggle}
                  onToggleDone={toggleDone}
                  onUpdateSet={updateSet}
                  onAddSet={addSet}
                  onRemoveSet={removeSet}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

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

      {/* Exercicio desmarcado nao e gravado. Descartar em silencio seria o
          mesmo problema de antes, invertido — entao aqui se diz o que fica
          de fora antes de gravar. */}
      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendentes.length === 1
                ? '1 exercício não foi marcado'
                : `${pendentes.length} exercícios não foram marcados`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estes ficam de fora do registro:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className='max-h-40 overflow-y-auto text-sm'>
            {pendentes.map((id) => (
              <li key={id} className='border-b border-border py-1.5 last:border-b-0'>
                {byId.get(id)?.name}
              </li>
            ))}
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={enviar}>
              Finalizar assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

export default WorkoutForm
