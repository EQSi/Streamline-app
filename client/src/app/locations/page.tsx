'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/src/state/axios";
import { useSession } from "next-auth/react";
import { Search } from "react-feather";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

interface Location {
    id: string;
    address: string;
    companies: string[];
    divisions: string[];
}

export default function LocationsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [locations, setLocations] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // New state for pagination if needed
    const [visibleCount, setVisibleCount] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch locations on mount
    useEffect(() => {
        if (!session || !(session as any).accessToken) return;
        const fetchLocations = async () => {
            try {
                const res = await axiosInstance.get('/locations', {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                setLocations(res.data);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchLocations();
    }, [session]);

    // Filter locations based on search query (search by address, company or division)
    const filteredLocations = locations.filter(loc => {
        const searchLower = searchQuery.toLowerCase();
        return (
            loc.address.toLowerCase().includes(searchLower) ||
            loc.companies.some(company => company.toLowerCase().includes(searchLower)) ||
            loc.divisions.some(division => division.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Locations</h1>
                <div className="flex items-center space-x-1 text-sm">
                    <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => router.push('/dashboard')}
                    >
                        Dashboard
                    </span>
                    <span>{'>'}</span>
                    <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => router.push('/admin')}
                    >
                        Admin
                    </span>
                    <span>{'>'}</span>
                    <span className="font-bold">Locations</span>
                </div>
            </div>
            <hr className="w-full border-t-2 border-gray-500 mb-4" />
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by address, company or division"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border pl-10 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="text-gray-500" size={20} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className="min-w-full bg-gray-50 text-[#29ABE3]" id="locationList">
                    <div className="group flex justify-between border-b">
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Address</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Companies</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Divisions</div>
                    </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {filteredLocations
                        .slice((currentPage - 1) * visibleCount, currentPage * visibleCount)
                        .map((location, index) => (
                            <AccordionItem key={location.id} value={location.id}>
                                <AccordionTrigger
                                    className={`group flex justify-between items-center py-4 px-4 border-b ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-gray-100`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                                        <span className="truncate w-1/3">{location.address}</span>
                                        <span className="truncate w-1/3">{location.companies.join(', ')}</span>
                                        <span className="truncate w-1/3">{location.divisions.join(', ')}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-6 bg-gray-100">
                                        <p><span className="font-semibold">Address: </span>{location.address}</p>
                                        <p><span className="font-semibold">Companies: </span>{location.companies.join(', ')}</p>
                                        <p><span className="font-semibold">Divisions: </span>{location.divisions.join(', ')}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                </Accordion>
            </div>
            {filteredLocations.length > visibleCount && (
                <div className="w-full mt-8 flex justify-center items-center space-x-4">
                    <button
                        onClick={() =>
                            setCurrentPage((prev: number) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {Math.ceil(filteredLocations.length / visibleCount)}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev: number) => prev + 1)
                        }
                        disabled={currentPage === Math.ceil(filteredLocations.length / visibleCount)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
