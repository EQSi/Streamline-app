'use client';

import { useRouter } from 'next/navigation';

export default function AdminLandingPage() {
    const router = useRouter();

    const navigateToUserManagement = () => {
        router.push('/admin/user-management');
    };

    const navigateToReports = () => {
        router.push('/admin/reports');
    };

    const navigateToSettings = () => {
        router.push('/admin/settings');
    };

    const handleBack = () => {
        router.back();     
    };

    return (
        <div className="p-3 flex flex-col h-screen">
            <div>
                <button onClick={handleBack} className="text-blue-500 hover:underline">
                    &larr; Dashboard
                </button>
            </div>
            <header className="p-2 bg-gray-150 w-full">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </header>
            <main className="flex flex-col items-start p-4 flex-grow">
                <div className="space-y-4">
                    <button
                        onClick={navigateToUserManagement}
                        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4 block"
                    >
                        Manage Users
                    </button>
                    <button
                        onClick={navigateToReports}
                        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4 block"
                    >
                        View Reports
                    </button>
                    <button
                        onClick={navigateToSettings}
                        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4 block"
                    >
                        Settings
                    </button>
                </div>
            </main>
        </div>
    );
}
