'use client';

import { useSession, signIn, SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector } from '@/src/app/redux';
import Navbar from '@/src/app/(components)/Navbar';
import Sidebar from '@/src/app/(components)/Sidebar';
import { useRouter } from 'next/navigation';


export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CompanyLayoutContent>{children}</CompanyLayoutContent>
        </SessionProvider>
    );
}

function CompanyLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn();  
        }
    }, [status]);

    if (status === 'loading') return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (status === 'unauthenticated') {
        return null;  
    }

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <Sidebar />
            <main className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
                <Navbar />
                {children}  
            </main>
        </div>
    );
}
