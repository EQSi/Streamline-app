'use client';

import { useAppSelector } from '@/app/redux';

export default function UserManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isDarkMode = useAppSelector(
        (state) => state.global.isDarkMode
    );

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <main className="flex flex-col w-full h-full py-7 px-9 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
