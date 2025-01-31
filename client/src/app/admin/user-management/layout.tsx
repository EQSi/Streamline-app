'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector } from '@/app/redux';

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn();
        }
    }, [status]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <main className="flex flex-col w-full h-full py-7 px-9 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
