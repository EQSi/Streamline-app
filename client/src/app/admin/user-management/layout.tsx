'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector } from '@/src/app/redux';

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

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

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <main className="flex flex-col w-full h-full py-2 px-2 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
