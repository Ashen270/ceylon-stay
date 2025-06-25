"use client"
import React from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import NavBar from '@/components/Navbar'
import { useGetAuthUserQuery } from '@/state/api'


const Layout = ({ children }: { children: React.ReactNode }) => {

  const {data:authUser} = useGetAuthUserQuery()
  console.log("authUser:", authUser )
  return (
    <div className='w-full h-full'>
      <NavBar />
      <main className={`h-full flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        {children}
      </main>
    </div>
  )
}

export default Layout
