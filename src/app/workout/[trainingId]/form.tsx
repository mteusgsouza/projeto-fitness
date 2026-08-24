'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ChevronDown, ChevronUp, ListCollapse, Plus, Trash2 } from 'lucide-react'
import { createWorkoutSession, syncPrescriptionWeights } from '@/actions/workout/_actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/workout'
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

/**
 * Resume as series numa linha: "16kg×10 · 16kg×10 · 14kg×8".
 * Sem carga, o "reps" vai uma vez so no fim para nao repetir a palavra:
 * "12 · 12 · 10 reps". Devolve null quando nao ha serie preenchida.
 */
function formatSets(
  sets: { weight: number | string; reps: number | string }[],
  usesLoad: boolean,
) {
  const validas = sets.filter((set) => Number(set.reps) > 0)
  if (!validas.length) return null
  if (usesLoad) {
    return validas.map((set) => `${formatNumber(Number(set.weight) || 0)}kg×${set.reps}`).join(' · ')
  }
  return `${validas.map((set) => set.reps).join(' · ')} reps`
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

  function move(exerciseId: string, delta: number) {
    setOrder((current) => {
      const index = current.indexOf(exerciseId)
      const target = index + delta
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      next[index] = current[target]
      next[target] = current[index]
      return next
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

  // So o que foi marcado conta: e isso que o botao Finalizar promete gravar
  const totalSets = feitos
    .flatMap((id) => rows[id] ?? [])
    .filter((set) => Number(set.reps) > 0).length

  /** So o marcado vira registro; a ordem e a da tela, nao a da ficha. */
  function buildEntries() {
    return feitos.map((id) => byId.get(id)!).map((exercise) => ({
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

      {order.map((exerciseId, position) => {
        const exercise = byId.get(exerciseId)
        if (!exercise) return null
        const sets = rows[exerciseId] ?? []
        const isCollapsed = !!collapsed[exerciseId]
        const isDone = !!done[exerciseId]
        // Sem carga, a coluna some e as demais reocupam a largura
        const cols = exercise.usesLoad
          ? 'grid grid-cols-[1.5rem_1fr_1fr_3.25rem_2.25rem] items-center gap-2'
          : 'grid grid-cols-[1.5rem_1fr_3.25rem_2.25rem] items-center gap-2'
        return (
          <Card key={exerciseId} className={isDone ? 'border-primary/40' : undefined}>
            <CardHeader className='p-3 pb-2 space-y-1'>
              <div className='flex items-start gap-2'>
                <button type='button' onClick={() => toggleDone(exerciseId)}
                  aria-pressed={isDone}
                  aria-label={isDone
                    ? `Desmarcar ${exercise.name}`
                    : `Marcar ${exercise.name} como feito`}
                  className='-ml-1 flex size-11 shrink-0 items-center justify-center'>
                  <span className={isDone
                    ? 'flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                    : 'flex size-6 items-center justify-center rounded-full border-2 border-muted-foreground/40 text-xs tabular text-muted-foreground'}>
                    {isDone ? <Check className='size-4' /> : position + 1}
                  </span>
                </button>

                <button type='button' onClick={() => toggle(exerciseId)}
                  aria-expanded={!isCollapsed}
                  className='min-w-0 flex-1 text-left'>
                  <CardTitle className='flex items-center gap-1.5 text-base leading-tight'>
                    <span className='min-w-0 truncate'>{exercise.name}</span>
                    {isCollapsed
                      ? <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                      : <ChevronUp className='size-4 shrink-0 text-muted-foreground' />}
                  </CardTitle>
                </button>

                <div className='flex shrink-0 items-center gap-1'>
                  <Button type='button' size='icon' variant='ghost'
                    aria-label={`Mover ${exercise.name} para cima`}
                    disabled={position === 0}
                    onClick={() => move(exerciseId, -1)}
                    className='size-8 text-muted-foreground hover:text-foreground'>
                    <ChevronUp className='size-4' />
                  </Button>
                  <Button type='button' size='icon' variant='ghost'
                    aria-label={`Mover ${exercise.name} para baixo`}
                    disabled={position === order.length - 1}
                    onClick={() => move(exerciseId, 1)}
                    className='size-8 text-muted-foreground hover:text-foreground'>
                    <ChevronDown className='size-4' />
                  </Button>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-x-2 gap-y-1 pl-7'>
                <Badge variant='secondary' className='tabular'>
                  {exercise.prescribedSets}×{exercise.prescribedReps}
                  {exercise.targetWeight !== null && ` · ${exercise.targetWeight}kg`}
                </Badge>
                {isCollapsed && (
                  <span className='text-xs tabular text-muted-foreground'>
                    {sets.length} {sets.length === 1 ? 'série' : 'séries'}
                    {formatSets(sets, exercise.usesLoad)
                      && ` · ${formatSets(sets, exercise.usesLoad)}`}
                  </span>
                )}
              </div>

              {!isCollapsed && exercise.previousSets.length > 0 && (
                <p className='pl-7 text-xs text-muted-foreground'>
                  Última vez: {formatSets(exercise.previousSets, exercise.usesLoad)}
                </p>
              )}
            </CardHeader>

            <CardContent className={isCollapsed ? 'hidden' : 'p-3 pt-0'}>
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
                        onChange={(event) => updateSet(exerciseId, index, 'weight', event.target.value)}
                        className='h-11 text-center tabular text-base' />
                    )}
                    <Input type='number' min={0} inputMode='numeric' placeholder='0'
                      aria-label={`Repetições da série ${index + 1} de ${exercise.name}`}
                      value={set.reps}
                      onChange={(event) => updateSet(exerciseId, index, 'reps', event.target.value)}
                      className='h-11 text-center tabular text-base' />
                    <Input type='number' min={1} max={10} inputMode='numeric' placeholder='—'
                      aria-label={`Esforço percebido da série ${index + 1} de ${exercise.name}`}
                      value={set.rpe}
                      onChange={(event) => updateSet(exerciseId, index, 'rpe', event.target.value)}
                      className='h-11 px-1 text-center tabular' />
                    <Button type='button' size='icon' variant='ghost'
                      aria-label={`Remover série ${index + 1}`}
                      disabled={sets.length === 1}
                      onClick={() => removeSet(exerciseId, index)}
                      className='size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type='button' variant='outline' size='sm'
                onClick={() => addSet(exerciseId)}
                className='mt-3 w-full'>
                <Plus className='size-4' /> Adicionar série
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
