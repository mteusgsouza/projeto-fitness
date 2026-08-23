import React from 'react'
import Header from './header'
import BottomNavbar from './bottom-nav'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-dvh flex flex-col bg-background'>
      {/* malha de instrumento: fixa, atrás de tudo, sem capturar toque */}
      <div className='pointer-events-none fixed inset-0 grid-tec opacity-70' aria-hidden='true' />

      <Header />
      {/* pb-28 no mobile reserva espaço para a barra inferior e o botão central */}
      <main className='relative flex-1 pb-28 md:pb-10'>
        {children}
      </main>
      <BottomNavbar />
    </div>
  )
}

export default MainLayout
