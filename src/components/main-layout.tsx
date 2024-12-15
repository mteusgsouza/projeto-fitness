import React from 'react'
import Header from './header'
import BottomNavbar from './bottom-nav'
// import Footer from './footer'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='md:min-h-screen flex flex-col'>
      <Header />
      <main>
        {children}
      </main>
      {/* <Footer /> */}
      <BottomNavbar />
    </div>
  )
}

export default MainLayout