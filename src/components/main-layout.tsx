import React from 'react'
import Header from './header'
import BottomNavbar from './bottom-nav'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-dvh flex flex-col bg-background'>
      <Header />
      {/* pb-28 no mobile reserva espaço para a barra inferior fixa e o botão flutuante */}
      <main className='flex-1 pb-28 md:pb-10'>
        {children}
      </main>
      <BottomNavbar />
    </div>
  )
}

export default MainLayout
