import React from 'react'

/**
 * Modo foco: durante o treino não há barra inferior nem navegação.
 * A tela tem cabeçalho próprio (voltar + cronômetro) e uma única ação fixa,
 * para não haver como sair sem querer no meio do registro.
 */
function WorkoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-dvh flex flex-col bg-background'>
      <div className='pointer-events-none fixed inset-0 grid-tec opacity-70' aria-hidden='true' />
      <div className='relative flex flex-1 flex-col'>
        {children}
      </div>
    </div>
  )
}

export default WorkoutLayout
