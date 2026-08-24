'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDuration, formatNumber, formatPrescription } from '@/lib/workout'
import { cn } from '@/lib/utils'
import type { SetRow, WorkoutExercise } from './types'

/**
 * Forma normalizada para montar o resumo. Serve tanto para a linha em edicao
 * (SetRow, tudo string) quanto para o historico vindo do banco (numeros e
 * nulos), sem cada chamada ter que saber converter.
 */
type SetLabel = { weight: number; reps: number; durationSeconds: number; distanceKm: number }

export function fromRow(set: SetRow): SetLabel {
  return {
    weight: Number(set.weight) || 0,
    reps: Number(set.reps) || 0,
    durationSeconds: (Number(set.min) || 0) * 60 + (Number(set.sec) || 0),
    distanceKm: Number(set.km) || 0,
  }
}

export function fromLog(set: WorkoutExercise['previousSets'][number]): SetLabel {
  return {
    weight: set.weight,
    reps: set.reps ?? 0,
    durationSeconds: set.durationSeconds ?? 0,
    distanceKm: set.distanceKm ?? 0,
  }
}

/**
 * Resume as series em uma linha curta: so a primeira e a ultima, e apenas
 * uma delas quando sao iguais. Listar todas estourava a largura no celular
 * ("4 series - 42,5kg-8 - 42,5kg-8 - 42,5kg-8 - 40kg-6" quebrava em duas
 * linhas), e as do meio repetem o que a primeira ja disse: o que interessa
 * e onde comecou e onde terminou.
 *
 *   iguais     -> "42,5kg×8"
 *   diferentes -> "42,5kg×8 → 40kg×6"
 *   sem carga  -> "12 → 10 reps"
 *   duracao    -> "20:00 · 3,2km"
 *
 * Devolve null quando nao ha serie preenchida.
 */
export function formatSets(sets: SetLabel[], usesLoad: boolean, porDuracao: boolean) {
  // Em exercicio por duracao, reps fica nulo: quem diz se a serie existe e o tempo
  const validas = sets.filter((set) => (porDuracao ? set.durationSeconds : set.reps) > 0)
  if (!validas.length) return null

  const rotulo = (set: SetLabel) => {
    const medida = porDuracao ? formatDuration(set.durationSeconds) : String(set.reps)
    const comDistancia = set.distanceKm > 0
      ? `${medida} · ${formatNumber(set.distanceKm)}km`
      : medida
    return usesLoad ? `${formatNumber(set.weight)}kg×${comDistancia}` : comDistancia
  }

  const primeira = rotulo(validas[0])
  const ultima = rotulo(validas[validas.length - 1])
  const corpo = primeira === ultima ? primeira : `${primeira} → ${ultima}`

  // "12 -> 10" sozinho nao diz de que; com carga ou tempo a unidade ja aparece
  return usesLoad || porDuracao ? corpo : `${corpo} reps`
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

  const porDuracao = exercise.tracking === 'duration'

  /*
    As colunas variam com o exercicio: quem nao usa carga nao ganha a coluna
    de carga, quem e medido em tempo troca "Reps" por "Min"+"Seg", e so
    esteira/bike e companhia ganham "Km". Vai em style porque a lista e
    montada em tempo de execucao e o Tailwind so ve classes escritas no fonte.
  */
  const cols = 'grid items-center gap-2'
  const colsStyle = {
    gridTemplateColumns: [
      '1.5rem',
      ...(exercise.usesLoad ? ['1fr'] : []),
      ...(porDuracao ? ['1fr', '1fr'] : ['1fr']),
      ...(exercise.usesDistance ? ['1fr'] : []),
      '3.25rem',
      '2.25rem',
    ].join(' '),
  }

  const resumo = formatSets(sets.map(fromRow), exercise.usesLoad, porDuracao)

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        isDone && 'border-primary/40',
        isDragging && 'relative z-10 opacity-80 shadow-lg ring-2 ring-primary/40',
      )}
    >
      {/*
        Recolhido, o resumo entra na mesma linha dos botoes em vez de ocupar
        uma segunda linha: os botoes ja tem 44px por area de toque, e o texto
        cabe dentro dessa altura. Some ~28px por card, o que faz diferenca
        quando a lista inteira precisa caber na tela para reordenar.
      */}
      <CardHeader className={cn('p-3', isCollapsed ? 'pb-3' : 'pb-2 space-y-1')}>
        <div className='flex items-center gap-2'>
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
            {isCollapsed && (
              <span className='block truncate text-xs tabular text-muted-foreground'>
                {sets.length} {sets.length === 1 ? 'série' : 'séries'}
                {resumo && ` · ${resumo}`}
              </span>
            )}
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

        {!isCollapsed && (
          <div className='flex flex-wrap items-center gap-x-2 gap-y-1 pl-7'>
            <Badge variant='secondary' className='tabular'>
              {formatPrescription({
                sets: exercise.prescribedSets,
                reps: exercise.prescribedReps,
                durationSeconds: exercise.prescribedDuration,
                targetWeight: exercise.targetWeight,
              })}
            </Badge>
          </div>
        )}

        {!isCollapsed && exercise.previousSets.length > 0 && (
          <p className='pl-7 text-xs text-muted-foreground'>
            Última vez: {formatSets(exercise.previousSets.map(fromLog), exercise.usesLoad, porDuracao)}
          </p>
        )}
      </CardHeader>

      <CardContent className={isCollapsed ? 'hidden' : 'p-3 pt-0'}>
        <div style={colsStyle}
          className={`${cols} px-0.5 pb-1 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground`}>
          <span>#</span>
          {exercise.usesLoad && <span>Carga</span>}
          {porDuracao ? <><span>Min</span><span>Seg</span></> : <span>Reps</span>}
          {exercise.usesDistance && <span>Km</span>}
          <span>RPE</span>
          <span className='sr-only'>Remover</span>
        </div>

        <div className='space-y-2'>
          {sets.map((set, index) => (
            <div key={index} className={cols} style={colsStyle}>
              <span className='text-sm tabular text-muted-foreground'>{index + 1}</span>
              {exercise.usesLoad && (
                <Input type='number' min={0} step='0.5' inputMode='decimal' placeholder='0'
                  aria-label={`Carga da série ${index + 1} de ${exercise.name}`}
                  value={set.weight}
                  onChange={(event) => onUpdateSet(exerciseId, index, 'weight', event.target.value)}
                  className='h-11 text-center tabular text-base' />
              )}
              {porDuracao ? (
                <>
                  <Input type='number' min={0} inputMode='numeric' placeholder='0'
                    aria-label={`Minutos da série ${index + 1} de ${exercise.name}`}
                    value={set.min}
                    onChange={(event) => onUpdateSet(exerciseId, index, 'min', event.target.value)}
                    className='h-11 text-center tabular text-base' />
                  <Input type='number' min={0} max={59} inputMode='numeric' placeholder='0'
                    aria-label={`Segundos da série ${index + 1} de ${exercise.name}`}
                    value={set.sec}
                    onChange={(event) => onUpdateSet(exerciseId, index, 'sec', event.target.value)}
                    className='h-11 text-center tabular text-base' />
                </>
              ) : (
                <Input type='number' min={0} inputMode='numeric' placeholder='0'
                  aria-label={`Repetições da série ${index + 1} de ${exercise.name}`}
                  value={set.reps}
                  onChange={(event) => onUpdateSet(exerciseId, index, 'reps', event.target.value)}
                  className='h-11 text-center tabular text-base' />
              )}
              {exercise.usesDistance && (
                <Input type='number' min={0} step='0.1' inputMode='decimal' placeholder='0'
                  aria-label={`Distância da série ${index + 1} de ${exercise.name}`}
                  value={set.km}
                  onChange={(event) => onUpdateSet(exerciseId, index, 'km', event.target.value)}
                  className='h-11 text-center tabular text-base' />
              )}
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
