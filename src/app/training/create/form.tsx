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
import { createTraining } from '@/actions/training/_actions'
import { TrainingFormSchema, type FormTrainingType } from '@/actions/training/_schema'

const initialExercice = {
  label: '', reps: 0, sets: 0
}

function FormTrining() {
  const form = useForm<FormTrainingType>({
    resolver: zodResolver(TrainingFormSchema, undefined, { raw: true }),
    defaultValues: {
      label: '',
      trainingDay: '',
      trainingMenu: [initialExercice]
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: "trainingMenu",
    control: form.control
  });

  function onSubmit(data: FormTrainingType) {
    createTraining(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-3 items-start'>
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <Input
                placeholder='ex: Membros inferiores' {...field}
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
                  <SelectTrigger className="w-[180px]">
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
            <div key={index} className='my-2 border rounded-sm p-2'>
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
                    render={({ field }) => (
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Repetições
                      </FormLabel>
                      <Input type='number'
                        {...form.register(`trainingMenu.${index}.reps`)}
                        defaultValue={_field.reps}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control}
                  name={`trainingMenu.${index}.sets`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[0.625rem] tracking-wide'>
                        Séries
                      </FormLabel>
                      <Input type='number'
                        {...form.register(`trainingMenu.${index}.sets`)}
                        defaultValue={_field.sets}
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
          className='bg-indigo-500 !text-white hover:bg-indigo-600 mx-auto'>
          <PlusCircle /> Adicionar Exercício
        </Button>

        <Button type='submit'>
          <Save /> CADASTRAR TREINO
        </Button>
      </form>
    </Form>
  )
}

export default FormTrining