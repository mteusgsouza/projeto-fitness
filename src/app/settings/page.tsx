import React from 'react'
import MainLayout from '@/components/main-layout'
import PageHeader from '@/components/page-header'
import Appearance from './appearance'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className='container mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6 space-y-4'>
        <PageHeader title='Configurações' description='Aparência do app' />
        <Appearance />
      </div>
    </MainLayout>
  )
}
