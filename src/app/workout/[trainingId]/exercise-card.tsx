'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/workout'
import { cn } from '@/lib/utils'
import type { SetRow, WorkoutExercise } from './types'

/**
 * Resume as séries numa linha: "16kg×10 · 16kg×10 · 14kg×8".
 * Sem carga, o "reps" vai uma vez só no fim para não repetir a palavra:
 * "12 · 12 · 10 reps". Devolve null quando não há série preenchida.
 */
export function formatSets(
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

function ExerciseCard({
  exercise, position, sets, isCollapsed, isDone,
  onToggleCollapse, onToggleDone, onUpdateSet, onAddSet, onRemoveSet,
}: {
  exercise: WorkoutExercise
  position: number
  sets: SetRow[]
  isCollapsed: boolean
  isDone: boolean
  onToggleCollapse: (exerciseId: string) => void
  onToggleDone: (exerciseId: string) => void
  onUpdateSet: (exerciseId: string, index: number, field: keyof SetRow, value: string) => void
  onAddSet: (exerciseId: string) => void
  onRemoveSet: (exerciseId: string, index: number) => void
}) {
  const exerciseId = exercise.exerciseId
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging,
  } = useSortable({ id: exerciseId })

  // Sem carga, a coluna some e as demais reocupam a largura
  const cols = exercise.usesLoad
    ? 'grid grid-cols-[1.5rem_1fr_1fr_3.25rem_2.25rem] items-center gap-2'
    : 'grid grid-cols-[1.5rem_1fr_3.25rem_2.25rem] items-center gap-2'

  const resumo = formatSets(sets, exercise.usesLoad)

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        isDone && 'border-primary/40',
        isDragging && 'relative z-10 opacity-80 shadow-lg ring-2 ring-primary/40',
      )}
    >
      <CardHeader className='p-3 pb-2 space-y-1'>
        <div className='flex items-start gap-2'>
          <button type='button' onClick={() => onToggleDone(exerciseId)}
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

          <button type='button' onClick={() => onToggleCollapse(exerciseId)}
            aria-expanded={!isCollapsed}
            className='min-w-0 flex-1 text-left'>
            <CardTitle className='flex items-center gap-1.5 text-base leading-tight'>
              <span className='min-w-0 truncate'>{exercise.name}</span>
              {isCollapsed
                ? <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                : <ChevronUp className='size-4 shrink-0 text-muted-foreground' />}
            </CardTitle>
          </button>

          {/*
            Só a alça arrasta. Se os listeners ficassem no card inteiro, rolar a
            tela e digitar nos campos disparariam o arrasto.
            setActivatorNodeRef é o que informa ao dnd-kit qual elemento é a alça,
            para o sensor de teclado focar nela.
          */}
          <button
            type='button'
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reordenar ${exercise.name}`}
            className='-mr-1 flex size-11 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing'
          >
            <GripVertical className='size-4' />
          </button>
        </div>

        <div className='flex flex-wrap items-center gap-x-2 gap-y-1 pl-7'>
          <Badge variant='secondary' className='tabular'>
            {exercise.prescribedSets}×{exercise.prescribedReps}
            {exercise.targetWeight !== null && ` · ${exercise.targetWeight}kg`}
          </Badge>
          {isCollapsed && (
            <span className='text-xs tabular text-muted-foreground'>
              {sets.length} {sets.length === 1 ? 'série' : 'séries'}
              {resumo && ` · ${resumo}`}
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
                  onChange={(event) => onUpdateSet(exerciseId, index, 'weight', event.target.value)}
                  className='h-11 text-center tabular text-base' />
              )}
              <Input type='number' min={0} inputMode='numeric' placeholder='0'
                aria-label={`Repetições da série ${index + 1} de ${exercise.name}`}
                value={set.reps}
                onChange={(event) => onUpdateSet(exerciseId, index, 'reps', event.target.value)}
                className='h-11 text-center tabular text-base' />
              <Input type='number' min={1} max={10} inputMode='numeric' placeholder='—'
                aria-label={`Esforço percebido da série ${index + 1} de ${exercise.name}`}
                value={set.rpe}
                onChange={(event) => onUpdateSet(exerciseId, index, 'rpe', event.target.value)}
                className='h-11 px-1 text-center tabular' />
              <Button type='button' size='icon' variant='ghost'
                aria-label={`Remover série ${index + 1}`}
                disabled={sets.length === 1}
                onClick={() => onRemoveSet(exerciseId, index)}
                className='size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}
        </div>

        <Button type='button' variant='outline' size='sm'
          onClick={() => onAddSet(exerciseId)}
          className='mt-3 w-full'>
          <Plus className='size-4' /> Adicionar série
        </Button>
      </CardContent>
    </Card>
  )
}

export default ExerciseCard
