'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import axiosInstance from '@/src/state/axios';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit2, MapPin, Plus } from 'lucide-react';

interface Location {
    id?: number;
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Division {
    id?: number;
    name: string;
    locationAssignments?: { location: Location }[];
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
    // Extend with phone/email if available from your API
    phone?: string;
    email?: string;
}

export type CompanyType = 'Customer' | 'Subcontractor' | 'Vendor';

interface Company {
    id: number;
    name: string;
    type: CompanyType;
    hasDivisions: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    divisions?: Division[];
    locationAssignments?: { location: Location }[];
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
        name: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
    });

    // Extra fetched data states (for contracts and contacts)
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // State for all and display locations
    const [allLocations, setAllLocations] = useState<Location[]>([]);
    const [displayLocations, setDisplayLocations] = useState<Location[]>([]);

    // States for editing/adding a division location
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location>({
        name: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [isNewLocation, setIsNewLocation] = useState(false);

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
                const response = await axiosInstance.get(`/companies/${companyId}`, config);
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
                    const locationsRes = await axiosInstance.get(`/divisions/${selectedDivision.id}/locations`, config);
                    setDisplayLocations(locationsRes.data);
                } else {
                    const [locationsRes, contractsRes, contactsRes] = await Promise.all([
                        axiosInstance.get(`/companies/${company.id}/locations`, config),
                        axiosInstance.get(`/companies/${company.id}/contracts`, config),
                        axiosInstance.get(`/companies/${company.id}/contacts`, config),
                    ]);
                    setDisplayLocations(locationsRes.data);
                    setContracts(contractsRes.data);
                    setContacts(contactsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchExtraData();
    }, [company, selectedDivision, session]);

    useEffect(() => {
        const fetchAllLocations = async () => {
            if (!session || !(session as any).accessToken) return;
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            try {
                const response = await axiosInstance.get(`/locations-now`, config);
                setAllLocations(response.data);
            } catch (error) {
                console.error('Failed to fetch all locations:', error);
            }
        };
        fetchAllLocations();
    }, [session]);

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
            const response = await axiosInstance.put(
                `/companies/${company.id}`,
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
            name: '',
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
        if (!session || !(session as any).accessToken) {
            console.error('Missing session info');
            return;
        }
        const config = {
            headers: {
                Authorization: `Bearer ${(session as any).accessToken}`,
            },
        };
    
        try {
            let locationResponse;
            if (!isNewLocation && editingLocation.id) {
                // For existing locations, assign the location to the company/division.
                if (selectedDivision && selectedDivision.id) {
                    locationResponse = await axiosInstance.post(
                        `/companies/${companyId}/divisions/${selectedDivision.id}/assign-location`,
                        { locationId: Number(editingLocation.id) },
                        config
                    );
                } else {
                    locationResponse = await axiosInstance.post(
                        `/companies/${companyId}/assign-location`,
                        { locationId: Number(editingLocation.id) },
                        config
                    );
                }
            } else {
                // Create a new location first.
                const { id, ...locationData } = editingLocation;
                const newLocationRes = await axiosInstance.post(`/locations`, locationData, config);
                const newLocation = { ...locationData, id: newLocationRes.data.id };
                if (selectedDivision && selectedDivision.id) {
                    await axiosInstance.post(
                        `/companies/${companyId}/divisions/${selectedDivision.id}/assign-location`,
                        { locationId: Number(newLocation.id) },
                        config
                    );
                } else {
                    await axiosInstance.post(
                        `/companies/${companyId}/assign-location`,
                        { locationId: Number(newLocation.id) },
                        config
                    );
                }
                locationResponse = { data: newLocation };
            }
            setDisplayLocations((prev) => {
                if (!prev) return [locationResponse.data];
                if (!isNewLocation) {
                    return prev.map((loc) =>
                        loc.id === editingLocation.id ? locationResponse.data : loc
                    );
                }
                return [...prev, locationResponse.data];
            });
            setIsEditingLocation(false);
        } catch (error) {
            console.error('Location update failed', error);
        }
    };

        // New contact state and handlers
        const [isAddingContact, setIsAddingContact] = useState(false);
        const [newContactName, setNewContactName] = useState('');
        const [newContactPhone, setNewContactPhone] = useState('');
        const [newContactEmail, setNewContactEmail] = useState('');

        const handleAddContactClick = () => {
            setIsAddingContact(true);
        };

        const handleContactSubmit = async (e: FormEvent) => {
            e.preventDefault();
            if (!session || !(session as any).accessToken) {
                console.error('Missing session info');
                return;
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            try {
                let contactResponse: { data: Contact };
                const contactData = {
                    name: newContactName,
                    phone: newContactPhone,
                    email: newContactEmail,
                };
                if (company && company.hasDivisions && selectedDivision && selectedDivision.id) {
                    contactResponse = await axiosInstance.post(
                        `/companies/${companyId}/divisions/${selectedDivision.id}/contacts`,
                        contactData,
                        config
                    );
                    // Update local division contacts if available
                    setSelectedDivision({
                        ...selectedDivision,
                        contacts: [...(selectedDivision.contacts || []), contactResponse.data],
                    });
                } else if (company) {
                    contactResponse = await axiosInstance.post(
                        `/companies/${company.id}/contacts`,
                        contactData,
                        config
                    );
                    setContacts((prev) => [...prev, contactResponse.data]);
                }
                setNewContactName('');
                setNewContactPhone('');
                setNewContactEmail('');
                setIsAddingContact(false);
            } catch (error) {
                console.error('Failed to add contact', error);
            }
        };

        const renderContent = () => {
            if (!company) return null;

            return (
            <div className="p-6">
                {/* Header: Company name + breadcrumb */}
                <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <div className="flex items-center space-x-1 text-sm">
                    <span
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer text-lightbluesl hover:underline"
                    >
                    Dashboard
                    </span>
                    <span>{'>'}</span>
                    <span
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer text-lightbluesl hover:underline"
                    >
                    Company
                    </span>
                    <span>{'>'}</span>
                    <span className="font-bold">{company.name}</span>
                </div>
                </div>
                <hr className="my-4" />

                {/* Company status and type stacked vertically */}
                <div className="flex flex-col space-y-1">
                <span className={`font-semibold ${getStatusColorClass(company.status)}`}>
                    {formatStatus(company.status)}
                </span>
                <span className="font-semibold">Type: {company.type}</span>
                </div>
                <hr className="my-4" />

                <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Contacts</h2>
                {contacts && contacts.length > 0 ? (
                    <div className="flex flex-row gap-4">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="p-2 border rounded flex-1">
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-sm text-gray-500">
                            Phone: {contact.phone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                            Email: {contact.email || 'N/A'}
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No contacts available.</div>
                )}
                <button
                    onClick={handleAddContactClick}
                    className="flex items-center text-blue-600 mt-2"
                >
                    <Plus size={16} />
                    <span className="ml-1">Add Contact</span>
                </button>
                </div>

                {/* Company Contacts Section (global only) */}
                {!company.hasDivisions && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Contacts</h2>
                    {contacts && contacts.length > 0 ? (
                    <div className="flex flex-row gap-4">
                        {contacts.map((contact) => (
                        <div key={contact.id} className="p-2 border rounded flex-1">
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-sm text-gray-500">
                            Phone: {contact.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                            Email: {contact.email || 'N/A'}
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="text-gray-500">No contacts available.</div>
                    )}
                </div>
                )}
                <hr className="my-4 border-gray-300" />

                {/* Division Section: Only if divisions exist */}
                {company.hasDivisions && selectedDivision && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Division: {selectedDivision.name}</h2>
                    <div className="flex flex-row gap-4">
                    {/* Division Contracts */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Contracts</h3>
                        {selectedDivision.contracts && selectedDivision.contracts.length > 0 ? (
                        selectedDivision.contracts.map((contract) => (
                            <div key={contract.id} className="flex flex-col p-2 border rounded mb-2">
                            <div className="mb-2">{contract.title}</div>
                            <button className="text-blue-600 underline self-start">
                                View Contract
                            </button>
                            </div>
                        ))
                        ) : (
                        <div className="text-gray-500">No contracts available.</div>
                        )}
                    </div>

                    {/* Division Locations */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Locations</h3>
                        <button
                            onClick={handleAddLocationClick}
                            className="flex items-center text-blue-600"
                        >
                            <Plus size={16} />
                            <span className="ml-1">Add Location</span>
                        </button>
                        </div>

                        {/* Inline Edit Location / Add Location Form */}
                        {isEditingLocation && (
                        <form onSubmit={handleLocationSubmit} className="p-4 border rounded mb-4 space-y-2">
                            <h4 className="font-semibold">
                            {isNewLocation ? 'Add New Location' : 'Edit Location'}
                            </h4>

                            {/* Line 1: Name */}
                            <input
                            type="text"
                            placeholder="Name"
                            value={editingLocation.name}
                            onChange={(e) =>
                                setEditingLocation({ ...editingLocation, name: e.target.value })
                            }
                            className="w-full border p-2"
                            required
                            />

                            {/* Line 2: Street 1 */}
                            <input
                            type="text"
                            placeholder="Street 1"
                            value={editingLocation.street1}
                            onChange={(e) =>
                                setEditingLocation({ ...editingLocation, street1: e.target.value })
                            }
                            className="w-full border p-2"
                            required
                            />

                            {/* Line 3: Street 2 */}
                            <input
                            type="text"
                            placeholder="Street 2"
                            value={editingLocation.street2 || ''}
                            onChange={(e) =>
                                setEditingLocation({ ...editingLocation, street2: e.target.value })
                            }
                            className="w-full border p-2"
                            />

                            {/* Line 4: City, State and Zip Code */}
                            <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="City"
                                value={editingLocation.city}
                                onChange={(e) =>
                                setEditingLocation({ ...editingLocation, city: e.target.value })
                                }
                                className="w-1/3 border p-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={editingLocation.state}
                                onChange={(e) =>
                                setEditingLocation({ ...editingLocation, state: e.target.value })
                                }
                                className="w-1/3 border p-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={editingLocation.zipCode}
                                onChange={(e) =>
                                setEditingLocation({ ...editingLocation, zipCode: e.target.value })
                                }
                                className="w-1/3 border p-2"
                                required
                            />
                            </div>

                            <div className="flex gap-4">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2">
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditingLocation(false)}
                                className="border px-4 py-2"
                            >
                                Cancel
                            </button>
                            </div>
                        </form>
                        )}

                        {displayLocations && displayLocations.length > 0 ? (
                            displayLocations.map((location) => {
                                const address = `${location.street1} ${location.street2 || ''} ${location.city} ${location.state} ${location.zipCode}`.trim();
                                const mapsUrl = /iPhone|iPad|iPod/.test(navigator.userAgent)
                                    ? `http://maps.apple.com/?q=${encodeURIComponent(address)}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                                
                                const handleCopy = (e: React.MouseEvent<HTMLDivElement>) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(address);
                                    alert('Address copied to clipboard!');
                                };

                                return (
                                    <div
                                        key={location.id}
                                        className="flex flex-col p-2 border rounded mb-2 cursor-pointer"
                                        onClick={handleCopy}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-bold">{location.name || 'Location Name'}</div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(mapsUrl, '_blank');
                                                    }}
                                                    className="text-blue-600"
                                                >
                                                    <MapPin size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditLocationClick(location);
                                                    }}
                                                    className="text-blue-600"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-1">{location.street1}</div>
                                        <div className="mb-1">{location.street2 || ''}</div>
                                        <div className="mb-1">
                                            {location.city}, {location.state} {location.zipCode}
                                        </div>
                                        <div>{"United States"}</div>
                                    </div>
                                );
                            })
                        ) : (
                        <div className="text-gray-500">No locations assigned.</div>
                        )}
                    </div>

                    {/* Division Contacts */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Division Contacts</h3>
                        <button
                            onClick={handleAddContactClick}
                            className="flex items-center text-blue-600"
                        >
                            <Plus size={16} />
                            <span className="ml-1">Add Contact</span>
                        </button>
                        </div>
                        {selectedDivision.contacts && selectedDivision.contacts.length > 0 ? (
                        selectedDivision.contacts.map((contact) => (
                            <div key={contact.id} className="p-2 border rounded mb-2 flex flex-col">
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-sm text-gray-500">
                                Phone: {contact.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                                Email: {contact.email || 'N/A'}
                            </div>
                            </div>
                        ))
                        ) : (
                        <div className="text-gray-500">No contacts available.</div>
                        )}

                        {/* Inline Add Contact Form */}
                        {isAddingContact && (
                        <form onSubmit={handleContactSubmit} className="p-4 border rounded mt-4 space-y-2">
                            <h4 className="font-semibold">Add Contact</h4>
                            <input
                            type="text"
                            placeholder="Name"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="w-full border p-2"
                            required
                            />
                            <input
                            type="text"
                            placeholder="Phone"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            className="w-full border p-2"
                            />
                            <input
                            type="email"
                            placeholder="Email"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            className="w-full border p-2"
                            />
                            <div className="flex gap-4">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2">
                                Save Contact
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingContact(false)}
                                className="border px-4 py-2"
                            >
                                Cancel
                            </button>
                            </div>
                        </form>
                        )}
                    </div>
                    </div>
                </div>
                )}

                {/* Global Section: If company does not have divisions */}
                {!company.hasDivisions && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Company Details</h2>
                    <div className="flex flex-row gap-4">
                    {/* Contracts */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Contracts</h3>
                        {contracts && contracts.length > 0 ? (
                        contracts.map((contract) => (
                            <div key={contract.id} className="flex flex-col p-2 border rounded mb-2">
                            <div className="mb-2">{contract.title}</div>
                            <button className="text-blue-600 underline self-start">
                                View Contract
                            </button>
                            </div>
                        ))
                        ) : (
                        <div className="text-gray-500">No contracts available.</div>
                        )}
                    </div>

                    {/* Locations */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Locations</h3>
                        <button
                            onClick={handleAddLocationClick}
                            className="flex items-center text-blue-600"
                        >
                            <Plus size={16} />
                            <span className="ml-1">Add Location</span>
                        </button>
                        </div>
                        {displayLocations && displayLocations.length > 0 ? (
                        displayLocations.map((location) => (
                            <div key={location.id} className="flex flex-col p-2 border rounded mb-2">
                            <div className="mb-2">
                                {location.street1}, {location.city}, {location.state}{' '}
                                {location.zipCode}
                            </div>
                            <button
                                onClick={() => handleEditLocationClick(location)}
                                className="text-blue-600 underline self-start"
                            >
                                Edit
                            </button>
                            </div>
                        ))
                        ) : (
                        <div className="text-gray-500">No locations assigned.</div>
                        )}

                        {/* Inline Edit/Add Location Form */}
                        {isEditingLocation && (
                        <form onSubmit={handleLocationSubmit} className="p-4 border rounded mt-4 space-y-2">
                            <h4 className="font-semibold">
                            {isNewLocation ? 'Add New Location' : 'Edit Location'}
                            </h4>
                            <input
                            type="text"
                            placeholder="Street 1"
                            value={editingLocation.street1}
                            onChange={(e) =>
                                setEditingLocation({
                                ...editingLocation,
                                street1: e.target.value,
                                })
                            }
                            className="w-full border p-2"
                            required
                            />
                            <input
                            type="text"
                            placeholder="Street 2"
                            value={editingLocation.street2 || ''}
                            onChange={(e) =>
                                setEditingLocation({
                                ...editingLocation,
                                street2: e.target.value,
                                })
                            }
                            className="w-full border p-2"
                            />
                            <input
                            type="text"
                            placeholder="City"
                            value={editingLocation.city}
                            onChange={(e) =>
                                setEditingLocation({
                                ...editingLocation,
                                city: e.target.value,
                                })
                            }
                            className="w-full border p-2"
                            required
                            />
                            <input
                            type="text"
                            placeholder="State"
                            value={editingLocation.state}
                            onChange={(e) =>
                                setEditingLocation({
                                ...editingLocation,
                                state: e.target.value,
                                })
                            }
                            className="w-full border p-2"
                            required
                            />
                            <input
                            type="text"
                            placeholder="Zip Code"
                            value={editingLocation.zipCode}
                            onChange={(e) =>
                                setEditingLocation({
                                ...editingLocation,
                                zipCode: e.target.value,
                                })
                            }
                            className="w-full border p-2"
                            required
                            />
                            <div className="flex gap-4">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2">
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditingLocation(false)}
                                className="border px-4 py-2"
                            >
                                Cancel
                            </button>
                            </div>
                        </form>
                        )}
                    </div>

                    {/* Contacts */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        <button
                            onClick={handleAddContactClick}
                            className="flex items-center text-blue-600"
                        >
                            <Plus size={16} />
                            <span className="ml-1">Add Contact</span>
                        </button>
                        </div>
                        {contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                            <div key={contact.id} className="p-2 border rounded mb-2 flex flex-col">
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-sm text-gray-500">
                                Phone: {contact.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                                Email: {contact.email || 'N/A'}
                            </div>
                            </div>
                        ))
                        ) : (
                        <div className="text-gray-500">No contacts available.</div>
                        )}

                        {/* Inline Add Contact Form */}
                        {isAddingContact && (
                        <form onSubmit={handleContactSubmit} className="p-4 border rounded mt-4 space-y-2">
                            <h4 className="font-semibold">Add Contact</h4>
                            <input
                            type="text"
                            placeholder="Name"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="w-full border p-2"
                            required
                            />
                            <input
                            type="text"
                            placeholder="Phone"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            className="w-full border p-2"
                            />
                            <input
                            type="email"
                            placeholder="Email"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            className="w-full border p-2"
                            />
                            <div className="flex gap-4">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2">
                                Save Contact
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingContact(false)}
                                className="border px-4 py-2"
                            >
                                Cancel
                            </button>
                            </div>
                        </form>
                        )}
                    </div>
                    </div>
                </div>
                )}
                <div className="bg-white mt-6 border rounded p-4">
                  <details>
                    <summary className="font-bold mb-2 cursor-pointer">View Jobs</summary>
                    <div className="max-h-40 overflow-y-auto border p-2">
                      {/* Replace with dynamic job items if available */}
                      <div>Job 1</div>
                      <div>Job 2</div>
                      <div>Job 3</div>
                      <div>Job 4</div>
                      <div>Job 5</div>
                    </div>
                  </details>
                  <div className="mt-4">
                  </div>
                </div>
                <hr className="my-4" />
                <div className="mt-4 flex justify-between">
                  <button className="flex items-center text-blue-600">
                    <Plus size={16} />
                    <span className="ml-1">Add New Division</span>
                  </button>
                </div>
              </div>
            );
        };
        
        return renderContent();

    };

export default CompanyDetailsPage;