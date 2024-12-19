import { createTraining } from '@/actions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

function CreateTreino() {
  return (
    <div className='container mx-auto mt-16'>
      <form action={createTraining} className='w-[380px] flex flex-col gap-3 items-start'>
        <Input type="text" name='label' />
        <Button>
          CADASTRAR
        </Button>
      </form>
    </div>
  )
}

export default CreateTreino