'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PlusCircle, Save, Trash2 } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { createTraining, updateTraining } from '@/actions/training/_actions'
import { TrainingFormSchema, type FormTrainingType } from '@/actions/training/_schema'
import { TRAINING_DAYS } from '@/lib/training-day'
import { groupByMuscle, type ExerciseOption } from '@/lib/exercise'

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
  const grouped = React.useMemo(() => groupByMuscle(exercises), [exercises])

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
      <form onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-3 items-start dark:[&_.text-destructive]:text-red-400'>
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <Input
                placeholder='ex: Membros inferiores' {...field}
                className="bg-white dark:bg-zinc-700"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="trainingDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia da semana</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-700">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value}
                        disabled={takenDays.includes(day.value)}>
                        {day.label}{takenDays.includes(day.value) ? ' (ocupado)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <h4>Exercícios:</h4>
          {fields.map((field, index) => (
            <div key={field.id}
              className='my-2 border rounded-sm p-2 bg-white dark:bg-zinc-700'>
              <div className='flex justify-between items-center'>
                <h6 className='uppercase text-xs font-bold tracking-wide'>
                  Exercício - {index + 1}
                </h6>
                <Button size="icon"
                  type='button'
                  aria-label={`Remover exercício ${index + 1}`}
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className='bg-red-500/20 text-red-500 hover:bg-red-500/30 h-7 w-7 shadow-none'>
                  <Trash2 />
                </Button>
              </div>

              <FormField control={form.control}
                name={`exercises.${index}.exerciseId`}
                render={({ field: selectField }) => (
                  <FormItem>
                    <FormLabel className='text-[0.625rem] tracking-wide'>
                      Exercício
                    </FormLabel>
                    <Select onValueChange={selectField.onChange} value={selectField.value}>
                      <SelectTrigger className='bg-white dark:bg-zinc-800'>
                        <SelectValue placeholder='Selecione o exercício' />
                      </SelectTrigger>
                      <SelectContent>
                        {grouped.map((group) => (
                          <SelectGroup key={group.value}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {group.items.map((exercise) => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-3 gap-2 mt-2'>
                <FormField control={form.control}
                  name={`exercises.${index}.sets`}
                  render={({ field: setsField }) => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Séries
                      </FormLabel>
                      <Input type='number' min={1} {...setsField}
                        className='bg-white dark:bg-zinc-800' />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control}
                  name={`exercises.${index}.reps`}
                  render={({ field: repsField }) => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Repetições
                      </FormLabel>
                      <Input type='number' min={1} {...repsField}
                        className='bg-white dark:bg-zinc-800' />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control}
                  name={`exercises.${index}.targetWeight`}
                  render={({ field: weightField }) => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Carga (kg)
                      </FormLabel>
                      <Input type='number' min={0} step='0.5' placeholder='opcional'
                        {...weightField}
                        value={weightField.value ?? ''}
                        className='bg-white dark:bg-zinc-800' />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className='flex gap-2'>
          <Button type='button' variant='outline'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => append(emptyExercise as any)}>
            <PlusCircle /> Adicionar exercício
          </Button>
          <Button type='submit' disabled={isPending}>
            <Save /> {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FormTrining
