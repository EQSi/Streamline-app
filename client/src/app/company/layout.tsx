'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector } from '@/src/app/redux';
import Navbar from '@/src/app/(components)/Navbar';
import Sidebar from '@/src/app/(components)/Sidebar';
import { useRouter } from 'next/navigation';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return <CompanyLayoutContent>{children}</CompanyLayoutContent>;
}

function CompanyLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className={`${isDarkMode ? 'dark' : 'light'} relative flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <Sidebar />
            <main
                className={`flex flex-col flex-1 py-7 px-4 bg-gray-50 transition-all duration-300 z-0 ${
                    isSidebarCollapsed ? 'ml-20' : 'ml-72'
                }`}
            >
                <div className="relative z-10">
                    <Navbar />
                </div>
                <div className="relative z-0">{children}</div>
            </main>
        </div>
    );
}
