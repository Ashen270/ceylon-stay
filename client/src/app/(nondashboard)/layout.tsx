"use client"
import React, { useEffect, useState } from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import NavBar from '@/components/Navbar'
import { useGetAuthUserQuery } from '@/state/api'
import { usePathname, useRouter } from 'next/navigation'


const Layout = ({ children }: { children: React.ReactNode }) => {

  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery()
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if ((userRole === 'manager' && pathname.startsWith('/search')) || (userRole === 'manager' && pathname.startsWith('/'))
      ) {
        router.push(
          '/managers/properties',
          { scroll: false }
        );
      } else {
        setIsLoading(false);
      }
    }
  }, [authUser, pathname, router]);
  if (authLoading || isLoading) return <>Loading.....</>


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
