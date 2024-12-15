import MainLayout from '@/components/main-layout'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}

export default layout