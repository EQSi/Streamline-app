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


/**
 * @file page.tsx
 * @module LocationsPage
 *
 * @remarks
 * Developer Notes:
 * - The LocationsPage component is responsible for rendering the application's locations page.
 * - Every company will have a name, address, and a company, not every location will have to have divisions.
 * - This allows companies to have many locations or have many companies at one location.
 * - It provides a list of locations with search functionality and the ability to add, edit, and delete locations.
 * - The UI for this page is in progress pending Kamerons design.
 * - Started on 2025-02-17. JTW
 * 
 * @returns {JSX.Element} 
 */

interface Location {
    id: string;
    name: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
    };
    companies: string[];
    divisions: string[];
}

interface Company {
    id: string;
    name: string;
}

interface Division {
    id: string;
    name: string;
}

const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", 
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", 
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface EditableLocationItemProps {
    location: Location;
    index: number;
    session: any;
}

const EditableLocationItem = ({ location, index, session }: EditableLocationItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedLocation, setEditedLocation] = useState<Location>(location);

    const handleSave = async () => {
        try {
            if (!session || !session.accessToken) return;
            const res = await axiosInstance.put(`/locations/${location.id}`, {
                name: editedLocation.name,
                address: {
                    line1: editedLocation.address.line1,
                    line2: editedLocation.address.line2,
                    city: editedLocation.address.city,
                    state: editedLocation.address.state,
                    zip: editedLocation.address.zip,
                },
                companies: editedLocation.companies,
                divisions: editedLocation.divisions,
            }, {
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            // Optionally update local state with res.data if needed
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating location:", error);
        }
    };

    return (
        <AccordionItem value={location.id}>
            <AccordionTrigger
                className={`group flex justify-between items-center py-4 px-4 border-b ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                } hover:bg-gray-100`}
            >
                <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                    <span className="truncate w-1/3">{editedLocation.name}</span>
                    <span className="truncate w-1/3">{`${editedLocation.address.line1}, ${editedLocation.address.city}, ${editedLocation.address.state} ${editedLocation.address.zip}`}</span>
                    <span className="truncate w-1/3">{editedLocation.companies.join(', ')}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-gray-50 shadow rounded">
                    {isEditing ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                            className="grid gap-2"
                        >
                            <input
                                value={editedLocation.name}
                                onChange={(e) =>
                                    setEditedLocation({ ...editedLocation, name: e.target.value })
                                }
                                className="border rounded px-2 py-1"
                            />
                            <input
                                value={editedLocation.address.line1}
                                onChange={(e) =>
                                    setEditedLocation({
                                        ...editedLocation,
                                        address: { ...editedLocation.address, line1: e.target.value },
                                    })
                                }
                                className="border rounded px-2 py-1"
                            />
                            <input
                                value={editedLocation.address.city}
                                onChange={(e) =>
                                    setEditedLocation({
                                        ...editedLocation,
                                        address: { ...editedLocation.address, city: e.target.value },
                                    })
                                }
                                className="border rounded px-2 py-1"
                            />
                            <input
                                value={editedLocation.address.state}
                                onChange={(e) =>
                                    setEditedLocation({
                                        ...editedLocation,
                                        address: { ...editedLocation.address, state: e.target.value },
                                    })
                                }
                                className="border rounded px-2 py-1"
                            />
                            <input
                                value={editedLocation.address.zip}
                                onChange={(e) =>
                                    setEditedLocation({
                                        ...editedLocation,
                                        address: { ...editedLocation.address, zip: e.target.value },
                                    })
                                }
                                className="border rounded px-2 py-1"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedLocation(location);
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <p>
                                <span className="font-semibold">Name: </span>
                                {editedLocation.name}
                            </p>
                            <p>
                                <span className="font-semibold">Address: </span>
                                {`${editedLocation.address.line1}, ${editedLocation.address.city}, ${editedLocation.address.state} ${editedLocation.address.zip}`}
                            </p>
                            <p>
                                <span className="font-semibold">Companies: </span>
                                {editedLocation.companies.join(', ')}
                            </p>
                            <p>
                                <span className="font-semibold">Divisions: </span>
                                {editedLocation.divisions.join(', ')}
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default function LocationsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [locations, setLocations] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newLocation, setNewLocation] = useState({
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        companies: '',
        divisions: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
    const [availableDivisions, setAvailableDivisions] = useState<Division[]>([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [visibleCount, setVisibleCount] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

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

    useEffect(() => {
        if (!session || !(session as any).accessToken) return;
        const fetchCompanies = async () => {
            try {
                const res = await axiosInstance.get('/companies', {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                    },
                });
                setAvailableCompanies(res.data);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchCompanies();
    }, [session]);

    useEffect(() => {
        if (selectedCompany && session && (session as any).accessToken) {
            const fetchDivisions = async () => {
                try {
                    const res = await axiosInstance.get(`/companies/${selectedCompany}/divisions`, {
                        headers: {
                            "Authorization": `Bearer ${(session as any).accessToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setAvailableDivisions(res.data);
                } catch (error) {
                    console.error("Error fetching divisions:", error);
                }
            };
            fetchDivisions();
        } else {
            setAvailableDivisions([]);
        }
    }, [selectedCompany, session]);

    const filteredLocations = locations.filter(loc => {
        const searchLower = searchQuery.toLowerCase();
        return (
            loc.address?.line1?.toLowerCase().includes(searchLower) ||
            loc.companies.some(company => company.toLowerCase().includes(searchLower)) ||
            loc.divisions.some(division => division.toLowerCase().includes(searchLower))
        );
    });

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!session || !(session as any).accessToken) {
                console.error("No session or access token found");
                return;
            }
            const res = await axiosInstance.post('/locations', {
                name: newLocation.name,
                address: {
                    line1: newLocation.line1,
                    line2: newLocation.line2,
                    city: newLocation.city,
                    state: newLocation.state,
                    zip: newLocation.zip,
                },
                companies: newLocation.companies.split(',').map(company => company.trim()),
                divisions: newLocation.divisions.split(',').map(division => division.trim()),
            }, {
                headers: {
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            setLocations([...locations, res.data]);
            setNewLocation({ name: '', line1: '', line2: '', city: '', state: '', zip: '', companies: '', divisions: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error("Error adding location:", error);
        }
    };

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
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded mb-4"
            >
                {showAddForm ? 'Cancel' : 'Add Location'}
            </button>
            {showAddForm && (
                <form onSubmit={handleAddLocation} className="mb-4">
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Location Name"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Address Line 1"
                            value={newLocation.line1}
                            onChange={(e) => setNewLocation({ ...newLocation, line1: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Address Line 2"
                            value={newLocation.line2}
                            onChange={(e) => setNewLocation({ ...newLocation, line2: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                value={newLocation.city}
                                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                required
                            />
                            <select
                                value={newLocation.state}
                                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                required
                            >
                                <option value="">Select State</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={newLocation.zip}
                                onChange={(e) => setNewLocation({ ...newLocation, zip: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                required
                            />
                        </div>
                        <select
                            value={selectedCompany}
                            onChange={(e) => {
                                setSelectedCompany(e.target.value);
                                setNewLocation({ ...newLocation, companies: e.target.value });
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            required
                        >
                            <option value="">Select Company</option>
                            {availableCompanies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                        {availableDivisions.length > 0 && (
                            <select
                                multiple
                                value={newLocation.divisions.split(',')}
                                onChange={(e) =>
                                    setNewLocation({ ...newLocation, divisions: Array.from(e.target.selectedOptions, option => option.value).join(',') })
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                required
                            >
                                {availableDivisions.map(division => (
                                    <option key={division.id} value={division.id}>{division.name}</option>
                                ))}
                            </select>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded"
                        >
                            Add Location
                        </button>
                    </div>
                </form>
            )}
            <div className="w-full">
                <div className="min-w-full bg-gray-50 text-[#29ABE3]" id="locationList">
                    <div className="group flex justify-between border-b">
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Name</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Address</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Companies</div>
                        <div className="px-2 py-2 font-semibold w-7"></div>
                    </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {filteredLocations
                        .slice((currentPage - 1) * visibleCount, currentPage * visibleCount)
                        .map((location, index) => (
                            <EditableLocationItem
                                key={location.id}
                                location={location}
                                index={index}
                                session={session}
                            />
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
