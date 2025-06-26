"use client"
import NavBar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Sidebar from '@/components/AppSidebar'
import { useGetAuthUserQuery } from '@/state/api'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (authUser) {
            const userRole = authUser.userRole?.toLowerCase();
            if ((userRole === 'manager' && pathname.startsWith('/tenants')) || (userRole === 'tenants' && pathname.startsWith('/managers'))
            ) {
                router.push(userRole === 'manager' ? '/managers/properties' : '/tenants/favorites',
                    { scroll: false }
                );
            } else{
                setIsLoading(false);
            }
        }
    },[authUser, pathname, router]);
    if (authLoading || isLoading) return<>Loading.....</>    
    if (!authUser?.userRole) return null;


    return (
        <SidebarProvider>
            <div className='min-h-screen w-full bg-primary-100'>
                <NavBar />
                <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
                    <main className='flex '>
                        <Sidebar userType={authUser.userRole.toLowerCase()} />
                        <div className='flex-grow transition-all duration-300 '>
                            {children}
                        </div>
                    </main>
                </div>

            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout
