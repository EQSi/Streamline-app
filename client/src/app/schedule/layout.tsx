'use client';

import React from 'react';
import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import { useAppSelector } from '@/app/redux';

const ScheduleLayout: React.FC = ({ children }) => {
    const isSidebarCollapsed = useAppSelector(
        (state) => state.global.isSidebarCollapsed
    );

    const isDarkMode = useAppSelector(
        (state) => state.global.isDarkMode
    );

    return (
        <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
            <Sidebar />
            <main className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
                <Navbar />
                {children}
            </main>
        </div>
    );
};

export default ScheduleLayout;