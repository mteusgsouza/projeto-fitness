import React from 'react'
import moment from 'moment'
import Link from 'next/link'

function Footer() {
  return (
    <div className='bg-zinc-200 dark:bg-zinc-700 text-center text-sm mt-auto py-2 font-medium'>
      <Link href="/"><span>Projeto Fitness - Controle de treino</span></Link>
      <span className='pl-2'>{moment().format('YYYY')}</span>
    </div>
  )
}

export default Footer