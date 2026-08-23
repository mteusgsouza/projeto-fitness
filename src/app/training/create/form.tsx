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
import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { createTraining, updateTraining } from '@/actions/training/_actions'
import { TrainingFormSchema, type FormTrainingType } from '@/actions/training/_schema'
import { TRAINING_DAYS } from '@/lib/training-day'
import { groupByMuscle, type ExerciseOption } from '@/lib/exercise'
import { Picker, type PickerGroup } from '@/components/picker'

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

  const { fields, append, remove } = useFieldArray({
    name: "exercises",
    control: form.control
  });

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

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className='p-3 space-y-3'>
                <div className='flex items-center gap-2'>
                  <GripVertical className='size-4 shrink-0 text-muted-foreground' />
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

                <div className='grid grid-cols-3 gap-2'>
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
                </div>
              </CardContent>
            </Card>
          ))}

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
