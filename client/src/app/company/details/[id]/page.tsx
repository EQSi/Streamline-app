'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit2, MapPin, Plus } from 'lucide-react';

interface Location {
    id?: number;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Division {
    id?: number;
    name: string;
    location?: Location;
    contracts?: Contract[];
    contacts?: Contact[];
}

interface Contract {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
}

interface Contact {
    id: number;
    name: string;
}

export type CompanyType = 'Customer' | 'Subcontractor' | 'Vendor';

interface Company {
    id: number;
    name: string;
    type: CompanyType;
    hasDivisions: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    divisions?: Division[];
    location?: Location;
    contracts?: Contract[];
    contacts?: Contact[];
}

const formatStatus = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    switch (status) {
        case 'ACTIVE':
            return 'Active';
        case 'INACTIVE':
            return 'Inactive';
        case 'SUSPENDED':
            return 'Suspended';
        default:
            return status;
    }
};

const getStatusColorClass = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    switch (status) {
        case 'ACTIVE':
            return 'text-green-600';
        case 'INACTIVE':
            return 'text-gray-600';
        case 'SUSPENDED':
            return 'text-yellow-600';
        default:
            return '';
    }
};

const CompanyDetailsPage: React.FC = () => {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;
    const [company, setCompany] = useState<Company | null>(null);
    const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

    // Editing states for company
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<CompanyType>('Customer');
    const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

    // New Division form states
    const [showNewDivisionForm, setShowNewDivisionForm] = useState(false);
    const [newDivisionName, setNewDivisionName] = useState('');
    const [newDivisionLocation, setNewDivisionLocation] = useState<Location>({
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
    });

    // Extra fetched data states
    const [locations, setLocations] = useState<Location[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // New states for editing/adding a division location
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location>({
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [isNewLocation, setIsNewLocation] = useState(false); // distinguishes edit vs add

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                if (!session || !(session as any).accessToken) {
                    console.error('No access token found');
                    return;
                }
                const config = {
                    headers: {
                        companyid: companyId,
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                };
                const response = await axios.get(
                    `https://localhost:8080/api/companies/${companyId}`,
                    config
                );
                setCompany(response.data);
                if (response.data.divisions && response.data.divisions.length > 0) {
                    setSelectedDivision(response.data.divisions[0]);
                }
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };

        if (companyId && session) {
            fetchCompanyDetails();
        }
    }, [companyId, session]);

    // This effect fetches extra data depending on whether a division is selected.
    useEffect(() => {
        const fetchExtraData = async () => {
            if (!session || !(session as any).accessToken || !company) return;
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            try {
                if (company.hasDivisions && selectedDivision && selectedDivision.id) {
                    if (selectedDivision.location) {
                        setLocations([selectedDivision.location]);
                    } else {
                        const locationsRes = await axios.get(`https://localhost:8080/api/divisions/${selectedDivision.id}/locations`, config);
                        const data = locationsRes.data;
                        setLocations(Array.isArray(data) ? data : [data]);
                    }
                } else {
                    const [locationsRes, contractsRes, contactsRes] = await Promise.all([
                        axios.get(`https://localhost:8080/api/companies/${company.id}/locations`, config),
                        axios.get(`https://localhost:8080/api/companies/${company.id}/contracts`, config),
                        axios.get(`https://localhost:8080/api/companies/${company.id}/contacts`, config),
                    ]);
                    setLocations(locationsRes.data);
                    setContracts(contractsRes.data);
                    setContacts(contactsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchExtraData();
    }, [company, selectedDivision, session]);

    const handleEditClick = () => {
        if (!company) return;
        setEditName(company.name);
        setEditType(company.type);
        setEditStatus(company.status);
        setIsEditing(true);
    };

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!company) return;
        if (!session || !(session as any).accessToken) {
            console.error('No access token found');
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            const response = await axios.put(
                `https://localhost:8080/api/companies/${company.id}`,
                {
                    name: editName,
                    type: editType,
                    status: editStatus,
                    hasDivisions: company.hasDivisions,
                },
                config
            );
            setCompany(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update company', error);
        }
    };

    // New handler functions for editing/adding a division location
    const handleEditLocationClick = (loc: Location) => {
        setEditingLocation(loc);
        setIsNewLocation(false);
        setIsEditingLocation(true);
    };

    const handleAddLocationClick = () => {
        setEditingLocation({
            street1: '',
            street2: '',
            city: '',
            state: '',
            zipCode: '',
        });
        setIsNewLocation(true);
        setIsEditingLocation(true);
    };

    const handleLocationSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!session || !(session as any).accessToken || !selectedDivision || !selectedDivision.id) {
            console.error('Missing session or division info');
            return;
        }
        const config = {
            headers: {
                Authorization: `Bearer ${(session as any).accessToken}`,
            },
        };

        try {
            let response;
            if (!isNewLocation && editingLocation.id) {
                response = await axios.put(
                    `https://localhost:8080/api/divisions/${selectedDivision.id}/locations/${editingLocation.id}`,
                    editingLocation,
                    config
                );
            } else {
                response = await axios.post(
                    `https://localhost:8080/api/divisions/${selectedDivision.id}/locations`,
                    editingLocation,
                    config
                );
            }
            setLocations((prev) => {
                if (!prev) return [response.data];
                if (!isNewLocation) {
                    return prev.map((loc) =>
                        loc.id === editingLocation.id ? response.data : loc
                    );
                }
                return [...prev, response.data];
            });
            setIsEditingLocation(false);
        } catch (error) {
            console.error('Location update failed', error);
        }
    };

    const renderContent = () => {
        if (selectedDivision) {
            return (
                <div>
                    <h3 className="text-xl font-semibold mb-2">
                        {selectedDivision.name}
                    </h3>
                    {isEditingLocation ? (
                        <form onSubmit={handleLocationSubmit} className="bg-gray-100 p-4 rounded shadow space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Street 1</label>
                                <input
                                    type="text"
                                    value={editingLocation.street1}
                                    onChange={(e) =>
                                        setEditingLocation({ ...editingLocation, street1: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Street 2</label>
                                <input
                                    type="text"
                                    value={editingLocation.street2}
                                    onChange={(e) =>
                                        setEditingLocation({ ...editingLocation, street2: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={editingLocation.city}
                                    onChange={(e) =>
                                        setEditingLocation({ ...editingLocation, city: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    value={editingLocation.state}
                                    onChange={(e) =>
                                        setEditingLocation({ ...editingLocation, state: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input
                                    type="text"
                                    value={editingLocation.zipCode}
                                    onChange={(e) =>
                                        setEditingLocation({ ...editingLocation, zipCode: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                                    {isNewLocation ? 'Add Location' : 'Update Location'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingLocation(false)}
                                    className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold">Locations</h4>
                            {locations && locations.length > 0 ? (
                                <div className="space-y-2">
                                    {locations.map((loc, index) => {
                                        const streetParts = [];
                                        if (loc.street1 && loc.street1.trim() !== '') {
                                            streetParts.push(loc.street1);
                                        }
                                        if (loc.street2 && loc.street2.trim() !== '') {
                                            streetParts.push(loc.street2);
                                        }
                                        const locString = `${streetParts.join(', ')}, ${loc.city}, ${loc.state} ${loc.zipCode}`;
                                        const openMap = () => {
                                            const encodedAddress = encodeURIComponent(locString);
                                            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                                                window.open(`https://maps.apple.com/?q=${encodedAddress}`, "_blank");
                                            } else {
                                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
                                            }
                                        };

                                        return (
                                            <div key={loc.id ?? index} className="flex items-center space-x-2">
                                                <div
                                                    className="flex-1 text-gray-800 border-b border-gray-200 pb-1 cursor-pointer select-text"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(locString);
                                                        alert('Location copied to clipboard');
                                                    }}
                                                >
                                                    {locString}
                                                </div>
                                                <button onClick={openMap} className="flex items-center space-x-1 text-blue-500 hover:underline">
                                                    <MapPin className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleEditLocationClick(loc)} className="flex items-center space-x-1 text-green-500 hover:underline">
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-600 italic">No location info available</p>
                            )}
                            <div className="mt-2">
                                <button
                                    onClick={handleAddLocationClick}
                                    className="flex items-center space-x-1 text-blue-500 hover:underline"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Add Location</span>
                                </button>
                            </div>
                        </div>
                      
                        <div>
                            <h4 className="font-semibold">Contracts</h4>
                            {contracts.length > 0 ? (
                                <ul>
                                    {contracts.map((contract) => (
                                        <li key={contract.id}>{contract.title}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No contracts available</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">Contacts</h4>
                            {contacts.length > 0 ? (
                                <ul>
                                    {contacts.map((contact) => (
                                        <li key={contact.id}>{contact.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No contacts available</p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        if (company) {
            return (
                <div>
                    <h3 className="text-xl font-semibold mb-2">Company Details</h3>
                    {/* Company-specific details can be rendered here */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold">Locations</h4>
                            {locations.length > 0 ? (
                                <ul>
                                    {locations.map((loc) => (
                                        <li key={loc.id}>
                                            {loc.street1}, {loc.city}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No location info available</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">Contracts</h4>
                            {contracts.length > 0 ? (
                                <ul>
                                    {contracts.map((contract) => (
                                        <li key={contract.id}>{contract.title}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No contracts available</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">Contacts</h4>
                            {contacts.length > 0 ? (
                                <ul>
                                    {contacts.map((contact) => (
                                        <li key={contact.id}>{contact.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No contacts available</p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4">
            {company ? (
                <div className="mb-4">
                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="bg-gray-100 p-4 rounded shadow space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex-1 mr-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Type
                                </label>
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value as CompanyType)}
                                    className="border border-gray-300 rounded w-full px-3 py-2"
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Subcontractor">Subcontractor</option>
                                    <option value="Vendor">Vendor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Status
                                </label>
                                <select
                                    value={editStatus}
                                    onChange={(e) =>
                                        setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">{company.name}</h1>
                                <p className="mt-2">Type: {company.type}</p>
                                <p className="mt-2">
                                    Status:{' '}
                                    <span className={`${getStatusColorClass(company.status)} font-bold`}>
                                        {formatStatus(company.status)}
                                    </span>
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
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
                                        onClick={() => router.push('/company')}
                                    >
                                        Companies
                                    </span>
                                    <span>{'>'}</span>
                                    <span className="font-bold">Company Mangement</span>
                                </div>
                                <button
                                    onClick={handleEditClick}
                                    className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 mt-4"
                                >
                                    Edit Company
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>Loading company information...</p>
            )}
            <hr className="w-full border-t-2 border-gray-500 mb-4" />

            <div className="flex">
                {company && company.divisions && company.divisions.length > 0 && (
                    <div className="w-1/4 border-r pr-4">
                        <h2 className="text-xl font-semibold mb-4">Divisions</h2>
                        <ul>
                            {company.divisions.map((div) => (
                                <li
                                    key={div.id}
                                    className={`cursor-pointer p-2 ${
                                        selectedDivision && selectedDivision.id === div.id
                                            ? 'bg-gray-200'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedDivision(div)}
                                >
                                    {div.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="flex-1 pl-4">{renderContent()}</div>
            </div>

            {company?.hasDivisions && (
                <div className="mt-8">
                    {showNewDivisionForm ? (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!session || !(session as any).accessToken) {
                                    console.error('No access token found');
                                    return;
                                }
                                try {
                                    const config = {
                                        headers: {
                                            Authorization: `Bearer ${(session as any).accessToken}`,
                                        },
                                    };
                                    const response = await axios.post(
                                        `https://localhost:8080/api/companies/${companyId}/divisions`,
                                        {
                                            name: newDivisionName,
                                            location: newDivisionLocation,
                                        },
                                        config
                                    );
                                    setCompany({
                                        ...company,
                                        divisions: company.divisions
                                            ? [...company.divisions, response.data]
                                            : [response.data],
                                    });
                                    setNewDivisionName('');
                                    setNewDivisionLocation({
                                        street1: '',
                                        street2: '',
                                        city: '',
                                        state: '',
                                        zipCode: '',
                                    });
                                    setShowNewDivisionForm(false);
                                } catch (error) {
                                    console.error('Failed to add division', error);
                                }
                            }}
                            className="bg-gray-100 p-4 rounded shadow space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    New Division Name
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionName}
                                    onChange={(e) => setNewDivisionName(e.target.value)}
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Street 1
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionLocation.street1}
                                    onChange={(e) =>
                                        setNewDivisionLocation({ ...newDivisionLocation, street1: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Street 2
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionLocation.street2}
                                    onChange={(e) =>
                                        setNewDivisionLocation({ ...newDivisionLocation, street2: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionLocation.city}
                                    onChange={(e) =>
                                        setNewDivisionLocation({ ...newDivisionLocation, city: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionLocation.state}
                                    onChange={(e) =>
                                        setNewDivisionLocation({ ...newDivisionLocation, state: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Zip Code
                                </label>
                                <input
                                    type="text"
                                    value={newDivisionLocation.zipCode}
                                    onChange={(e) =>
                                        setNewDivisionLocation({ ...newDivisionLocation, zipCode: e.target.value })
                                    }
                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                                >
                                    Add Division
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewDivisionForm(false)}
                                    className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="fixed bottom-4 right-4">
                            <button
                                onClick={() => setShowNewDivisionForm(true)}
                                className="p-2 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-green-700"
                            >
                                <Plus />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyDetailsPage;
