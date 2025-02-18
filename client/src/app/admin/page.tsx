'use client';

import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const activeJobsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Active Jobs',
            data: [12, 19, 8, 17, 14, 21, 10],
            borderColor: 'rgba(37, 99, 235, 1)',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            fill: true,
        },
    ],
};

const revenueData = {
    labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ],
    datasets: [
        {
            label: 'Revenue',
            data: [500, 800, 750, 950, 1100, 1300, 1200, 1400, 1600, 1800, 2000, 2200],
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
        },
    ],
};

const jobStageData = {
    labels: [
        'RequestForQuote',
        'Estimating',
        'BidSubmitted',
        'Approved',
        'Scheduled',
        'InProgress',
        'Completed',
        'Invoiced',
        'PaidInFull'
    ],
    datasets: [
        {
            label: 'Job Count',
            data: [4, 6, 2, 7, 3, 5, 8, 1, 0], // sample counts for each stage
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
    ],
};

export default function AdminLandingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="p-4">Loading...</div>;
    }

    if (status === 'unauthenticated') {
        signIn();
        return null;
    }

    const navigateTo = (path: string) => {
        router.push(path);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-full p-2">
                <div className="mb-2">
                    <button onClick={handleBack} className="text-blue-600 hover:underline">
                        &larr; Dashboard
                    </button>
                </div>

                <header className="mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Buttons */}
                    <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-4">
                        <button
                            onClick={() => navigateTo('/admin/user-management')}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => navigateTo('/admin/reports')}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
                        >
                            View Reports
                        </button>
                        <button
                            onClick={() => navigateTo('/admin/settings')}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => navigateTo('/admin/permission')}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Permissions
                        </button>
                    </div>

                    {/* Main Content with Graphs */}
                    <div className="w-full md:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Jobs</h2>
                            <Line data={activeJobsData} />
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Revenue</h2>
                            <Line data={revenueData} />
                        </div>
                    </div>
                </div>

                {/* Jobs by Stage Overview Section */}
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-6 mt-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        Jobs by Stage Overview
                    </h2>
                    <Bar
                        data={jobStageData}
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
