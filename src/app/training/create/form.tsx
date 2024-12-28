'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PlusCircle, Save, Trash2 } from 'lucide-react'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { createTraining, updateTraining } from '@/actions/training/_actions'
import { TrainingFormSchema, type FormTrainingType } from '@/actions/training/_schema'
import type { Prisma } from '@prisma/client'

const initialExercice = {
  label: '', reps: 0, sets: 0
}
type TTraining = {
  label: string;
  trainingDay: string;
  trainingMenu: Prisma.TrainingMenuCreateManyTrainingInput[];
}

function FormTrining({ idTraining, initialData }: {
  idTraining?: string
  initialData?: TTraining
}) {
  const emptyData = {
    label: '',
    trainingDay: '',
    trainingMenu: [initialExercice]
  }
  let _initialData = emptyData

  if (initialData) {
    const menuExercises = initialData.trainingMenu.map((exercise) => ({
      label: exercise.label,
      reps: exercise.reps,
      sets: exercise.sets,
    }))
    _initialData = { label: initialData.label, trainingDay: initialData.trainingDay, trainingMenu: menuExercises }
  }

  const form = useForm<FormTrainingType>({
    resolver: zodResolver(TrainingFormSchema, undefined, { raw: true }),
    defaultValues: _initialData
  })

  const { fields, append, remove } = useFieldArray({
    name: "trainingMenu",
    control: form.control
  });

  function onSubmit(data: FormTrainingType) {
    if (idTraining) {
      updateTraining(idTraining, data)
    } else {
      createTraining(data)
    }
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
                <Select onValueChange={field.onChange} defaultValue={field.value} {...form.register("trainingDay")} >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-700">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segunda">Segunda</SelectItem>
                    <SelectItem value="terca">Terça</SelectItem>
                    <SelectItem value="quarta">Quarta</SelectItem>
                    <SelectItem value="quinta">Quinta</SelectItem>
                    <SelectItem value="sexta">Sexta</SelectItem>
                    <SelectItem value="sabado">Sábado</SelectItem>
                    <SelectItem value="domingo">Domingo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <h4>Exercícios:</h4>
          {fields.map((_field, index) => (
            <div key={index}
              className='my-2 border rounded-sm p-2 bg-white dark:bg-zinc-700'>
              <div className='flex justify-between items-center'>
                <h6 className='uppercase text-xs font-bold tracking-wide'>
                  Exercício - {index + 1}
                </h6>
                <Button size="icon"
                  type='button'
                  onClick={() => remove(index)}
                  className='bg-red-500/20 text-red-500 hover:bg-red-500/30 h-7 w-7 shadow-none'>
                  <Trash2 />
                </Button>
              </div>
              <div className='grid grid-cols-5 gap-2'>
                <div className='col-span-3'>
                  <FormField control={form.control}
                    name={`trainingMenu.${index}.label`}
                    render={() => (
                      <FormItem>
                        <FormLabel className='text-[0.625rem] tracking-wide'>
                          Descrição
                        </FormLabel>
                        <Input
                          {...form.register(`trainingMenu.${index}.label`)}
                          defaultValue={_field.label}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control}
                  name={`trainingMenu.${index}.reps`}
                  render={() => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Repetições
                      </FormLabel>
                      <Input type='number'
                        {...form.register(`trainingMenu.${index}.reps`)}
                        defaultValue={_field.reps.toString()}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control}
                  name={`trainingMenu.${index}.sets`}
                  render={() => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Séries
                      </FormLabel>
                      <Input type='number'
                        {...form.register(`trainingMenu.${index}.sets`)}
                        defaultValue={_field.sets.toString()}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        <Button type='button'
          onClick={() =>
            append({
              ...initialExercice
            })}
          className='bg-indigo-500 !text-white hover:bg-indigo-600 active:bg-indigo-600 mx-auto'>
          <PlusCircle /> Adicionar Exercício
        </Button>
        <Button type='submit' className='mt-3'>
          <Save /> CADASTRAR TREINO
        </Button>
      </form>
    </Form>
  )
}

export default FormTrining