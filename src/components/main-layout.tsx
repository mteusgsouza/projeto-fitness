import React from 'react'
import Header from './header'
import BottomNavbar from './bottom-nav'
// import Footer from './footer'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative md:min-h-screen flex flex-col'>
      <Header />
      <main className='bg-zinc-100 dark:bg-zinc-900 rounded-t-2xl pt-3 border-t border-zinc-300 dark:border-zinc-600 min-h-screen flex-1'>
        {children}
      </main>
      {/* <Footer /> */}
      <BottomNavbar />
    </div>
  )
}

export default MainLayout