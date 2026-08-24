'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react'
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent, type DraggableAttributes,
} from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { createTraining, updateTraining } from '@/actions/training/_actions'
import { TrainingFormSchema, type FormTrainingType } from '@/actions/training/_schema'
import { TRAINING_DAYS } from '@/lib/training-day'
import { groupByMuscle, type ExerciseOption } from '@/lib/exercise'
import { Picker, type PickerGroup } from '@/components/picker'

/**
 * Casca arrastavel da linha. Existe como componente porque useSortable e um
 * hook por item e nao pode ser chamado dentro do map. O conteudo vem por
 * render prop para os FormField continuarem no formulario, onde ja estavam.
 */
function SortableRow({ id, children }: {
  id: string
  children: (alca: {
    setActivatorNodeRef: (node: HTMLElement | null) => void
    attributes: DraggableAttributes
    listeners: SyntheticListenerMap | undefined
  }) => React.ReactNode
}) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging,
  } = useSortable({ id })

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 opacity-80 shadow-lg ring-2 ring-primary/40')}
    >
      {children({ setActivatorNodeRef, attributes, listeners })}
    </Card>
  )
}

const emptyExercise = { exerciseId: '', reps: '', sets: '', targetWeight: '' }

export type TTraining = {
  label: string
  trainingDay: string
  exercises: {
    exerciseId: string
    sets: number
    reps: number
    targetWeight: number | null
  }[]
}

function FormTrining({ idTraining, initialData, exercises, takenDays = [] }: {
  idTraining?: string
  initialData?: TTraining
  exercises: ExerciseOption[]
  takenDays?: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Carga so aparece para exercicio que usa carga externa
  const usesLoadById = React.useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.usesLoad])),
    [exercises],
  )

  const exerciseGroups: PickerGroup[] = React.useMemo(
    () => groupByMuscle(exercises).map((group) => ({
      label: group.label,
      options: group.items.map((exercise) => ({
        value: exercise.id,
        label: exercise.name,
        hint: exercise.equipment ?? undefined,
      })),
    })),
    [exercises],
  )

  const dayGroups: PickerGroup[] = React.useMemo(() => [{
    options: TRAINING_DAYS.map((day) => ({
      value: day.value,
      label: day.label,
      disabled: takenDays.includes(day.value),
      disabledReason: 'Já tem treino neste dia',
    })),
  }], [takenDays])

  const defaultValues = initialData
    ? {
      label: initialData.label,
      trainingDay: initialData.trainingDay,
      exercises: initialData.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        reps: String(exercise.reps),
        sets: String(exercise.sets),
        targetWeight: exercise.targetWeight === null ? '' : String(exercise.targetWeight),
      })),
    }
    : { label: '', trainingDay: '', exercises: [emptyExercise] }

  const form = useForm<FormTrainingType>({
    resolver: zodResolver(TrainingFormSchema, undefined, { raw: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
  })

  const { fields, append, remove, move } = useFieldArray({
    name: "exercises",
    control: form.control
  });

  // useWatch em vez de form.watch(): o watch() devolve funcao nao memoizavel
  // e o React Compiler pula a otimizacao do componente inteiro por causa dele.
  const watchedExercises = useWatch({ control: form.control, name: 'exercises' })

  /** Mesmo padrao da tela de execucao: so a alca arrasta, com limiar de 8px
   *  para o toque nao virar arrasto, e sensor de teclado para nao depender
   *  de mouse. `move` do useFieldArray reindexa os campos sozinho. */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = fields.findIndex((field) => field.id === active.id)
    const to = fields.findIndex((field) => field.id === over.id)
    if (from < 0 || to < 0) return
    move(from, to)
  }

  function onSubmit(data: FormTrainingType) {
    startTransition(async () => {
      const result = idTraining
        ? await updateTraining(idTraining, data)
        : await createTraining(data)

      if (result.ok) {
        toast.success(result.message)
        router.push('/training')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <Card>
          <CardContent className='p-4 space-y-4'>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    placeholder='ex: Membros inferiores' {...field}
                    className='h-11'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trainingDay"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Dia da semana</FormLabel>
                  <Picker
                    groups={dayGroups}
                    value={field.value}
                    onValueChange={field.onChange}
                    title='Dia da semana'
                    description='Cada dia comporta um treino'
                    placeholder='Selecione o dia'
                    invalid={!!fieldState.error}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
              Exercícios
            </h2>
            <span className='text-sm text-muted-foreground tabular'>
              {fields.length}
            </span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => {
            const selectedId = watchedExercises?.[index]?.exerciseId
            // Enquanto nada foi escolhido, mostra a carga: a maioria usa
            const showLoad = !selectedId || usesLoadById.get(selectedId) !== false

            return (
            <SortableRow key={field.id} id={field.id}>
              {({ setActivatorNodeRef, attributes, listeners }) => (
              <CardContent className='p-3 space-y-3'>
                <div className='flex items-center gap-2'>
                  {/* Antes isto era so um icone: parecia arrastavel e nao era */}
                  <button type='button' ref={setActivatorNodeRef}
                    {...attributes} {...listeners}
                    aria-label={`Reordenar exercício ${index + 1}`}
                    className='-ml-2 flex size-9 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing'>
                    <GripVertical className='size-4' />
                  </button>
                  <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    {index + 1}
                  </span>
                  <div className='ml-auto'>
                    <Button size='icon' variant='ghost' type='button'
                      aria-label={`Remover exercício ${index + 1}`}
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className='size-9 text-destructive hover:bg-destructive/10 hover:text-destructive'>
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </div>

                <FormField control={form.control}
                  name={`exercises.${index}.exerciseId`}
                  render={({ field: selectField, fieldState }) => (
                    <FormItem>
                      <Picker
                        groups={exerciseGroups}
                        value={selectField.value}
                        onValueChange={selectField.onChange}
                        title='Escolher exercício'
                        placeholder='Selecione o exercício'
                        searchable
                        searchPlaceholder='Buscar exercício...'
                        invalid={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className={showLoad ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-2'}>
                  <FormField control={form.control}
                    name={`exercises.${index}.sets`}
                    render={({ field: setsField }) => (
                      <FormItem>
                        <FormLabel className='text-xs text-muted-foreground'>
                          Séries
                        </FormLabel>
                        <Input type='number' min={1} inputMode='numeric'
                          {...setsField} className='h-11 text-center tabular' />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control}
                    name={`exercises.${index}.reps`}
                    render={({ field: repsField }) => (
                      <FormItem>
                        <FormLabel className='text-xs text-muted-foreground'>
                          Reps
                        </FormLabel>
                        <Input type='number' min={1} inputMode='numeric'
                          {...repsField} className='h-11 text-center tabular' />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showLoad && (
                    <FormField control={form.control}
                      name={`exercises.${index}.targetWeight`}
                      render={({ field: weightField }) => (
                        <FormItem>
                          <FormLabel className='text-xs text-muted-foreground'>
                            Carga
                          </FormLabel>
                          <Input type='number' min={0} step='0.5' inputMode='decimal'
                            placeholder='—'
                            {...weightField}
                            value={weightField.value ?? ''}
                            className='h-11 text-center tabular' />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
              )}
            </SortableRow>
            )
          })}
          </SortableContext>
          </DndContext>

          <Button type='button' variant='outline' className='w-full h-11'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => append(emptyExercise as any)}>
            <Plus className='size-4' /> Adicionar exercício
          </Button>
        </div>

        {/* Barra de ação fixa: no mobile o formulário é longo e o salvar
            não pode depender de rolar até o fim. */}
        <div className='sticky bottom-20 md:bottom-4 z-30 pt-2'>
          <Button type='submit' size='lg' disabled={isPending}
            className='w-full shadow-lg md:w-auto'>
            <Save className='size-4' /> {isPending ? 'Salvando...' : 'Salvar treino'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FormTrining
