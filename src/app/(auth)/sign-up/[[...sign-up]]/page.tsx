import { SignUp } from '@clerk/nextjs'
import bg from '@/../public/pictures/auth-bg.jpg'
import React from 'react'
import GuestEntry from '@/components/guest-entry'

function SignUpPage() {
  return (
    <div className='relative'>
      <div className='flex justify-center md:justify-start md:items-center h-screen md:grid md:grid-cols-2 md:px-0'>
        <div className='mx-auto flex flex-col gap-5 p-5'>
          <SignUp />
          <GuestEntry />
        </div>
        <div className='bg-no-repeat bg-cover bg-center hidden md:block h-full w-full' style={{ backgroundImage: `url(${bg.src})` }}></div>
      </div>
    </div>
  )
}

export default SignUpPage
