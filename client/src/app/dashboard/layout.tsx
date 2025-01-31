'use client';

import Sidebar from '@/app/(components)/Sidebar'; 
import Navbar from '@/app/(components)/Navbar'; // Add this line
import { useAppSelector } from '@/app/redux';
import { useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const isDarkMode = useAppSelector(
    (state) => state.global.isDarkMode
  );

  if (status === 'loading') {
    return <div>Loading...</div>; // You can replace this with a loading spinner or component
  }

  if (status === 'unauthenticated') {
    return null; // This will prevent the layout from rendering while redirecting
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