'use client';

import { useSession, signIn, SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector } from '@/app/redux';
import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status, error } = useSession();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if the user is unauthenticated
        if (status === 'unauthenticated') {
            signIn();  // Sign in if the user is not authenticated
        }
    }, [status]);

    if (status === 'loading') {
        return <div>Loading...</div>;  // Show a loading state while checking session
    }

    if (status === 'unauthenticated') {
        return null;  // If unauthenticated, render nothing
    }

    if (error) {
        return <div>Error: {error.message}</div>;  // Error handling for session
    }

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <Sidebar />
            <main className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
                <Navbar />
                {children}  {/* Render children components inside the admin layout */}
            </main>
        </div>
    );
}
