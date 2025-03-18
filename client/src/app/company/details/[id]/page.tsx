'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axiosInstance from '@/src/state/axios';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit2, MapPin, Plus, ChevronDown } from 'lucide-react';

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
    firstName: string;
    lastName: string;
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
    // Only used if company does not have divisions
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
            return 'text-priortygreen';
        case 'INACTIVE':
            return 'text-priortyred';
        case 'SUSPENDED':
            return 'text-priortyyellow';
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

    // Company edit states
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
     
    const handleNewDivisionSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!company || !session || !(session as any).accessToken) {
            console.error('Missing session info');
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            const response = await axiosInstance.post(
                '/divisions',
                {
                    companyId: company.id,
                    name: newDivisionName,
                    location: newDivisionLocation,
                },
                config
            );
            const updatedDivision: Division = response.data;
            // Update company with the new division and set it as selected
            setCompany({
                ...company,
                divisions: [...(company.divisions || []), updatedDivision],
            });
            setSelectedDivision(updatedDivision);
            setNewDivisionName('');
            setNewDivisionLocation({
                name: '',
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
    };

    // Extra fetched data states (for contacts, contracts, etc.)
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [allLocations, setAllLocations] = useState<Location[]>([]);
    // For companies with divisions, these are the locations assigned to the selected division
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
            if (!session || !(session as any).accessToken) return;
            try {
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

        fetchCompanyDetails();
    }, [companyId, session]);

    useEffect(() => {
        const fetchExtraData = async () => {
            if (!session || !(session as any).accessToken || !company) return;
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                };
                if (company.hasDivisions) {
                    // For companies with divisions, fetch location assignments for all divisions
                    const assignmentsRes = await axiosInstance.get(
                        `/location-assignments/${company.id}`,
                        config
                    );
                    const assignments = assignmentsRes.data;
                    // Update each division with its corresponding location assignments
                    const updatedDivisions = company.divisions?.map((division: Division) => ({
                        ...division,
                        locationAssignments: assignments
                            .filter((assignment: any) => assignment.division && assignment.division.id === division.id)
                            .map((assignment: any) => ({ location: assignment.location })),
                    }));
                    setCompany({ ...company, divisions: updatedDivisions });
                } else {
                    // For companies without divisions, load global locations, contracts and contacts
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
                console.error('Failed to fetch extra data:', error);
            }
        };

        fetchExtraData();
    }, [selectedDivision, session, company?.id]);

    useEffect(() => {
        const fetchAllLocations = async () => {
            if (!session || !(session as any).accessToken) return;
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                };
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
        if (!company || !session || !(session as any).accessToken) return;
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

    // Handler functions for editing/adding a division location
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
        if (!session || !(session as any).accessToken) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            let locationResponse;
            if (!isNewLocation && editingLocation.id) {
                // For existing locations, assign the location to the current division or globally.
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
                // Create a new location then assign it.
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

            if (selectedDivision && selectedDivision.id) {
                // Update the selected division's location assignments within the company state
                setCompany((prev) => {
                    if (!prev || !prev.divisions) return prev;
                    return {
                        ...prev,
                        divisions: prev.divisions.map((division) => {
                            if (division.id === selectedDivision.id) {
                                const newAssignment = { location: locationResponse.data };
                                return {
                                    ...division,
                                    locationAssignments: division.locationAssignments
                                        ? [...division.locationAssignments, newAssignment]
                                        : [newAssignment],
                                };
                            }
                            return division;
                        }),
                    };
                });
            } else {
                // For companies without divisions, update the display locations list
                setDisplayLocations((prev) => {
                    if (!prev) return [locationResponse.data];
                    if (!isNewLocation) {
                        return prev.map((loc) =>
                            loc.id === editingLocation.id ? locationResponse.data : loc
                        );
                    }
                    return [...prev, locationResponse.data];
                });
            }
            setIsEditingLocation(false);
        } catch (error) {
            console.error('Location update failed', error);
        }
    };

    // New contact state and handlers
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [isAddingDivisionContact, setIsAddingDivisionContact] = useState(false);
    const [newContactFirstName, setNewContactFirstName] = useState('');
    const [newContactLastName, setNewContactLastName] = useState('');
    const [newContactPhone, setNewContactPhone] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');

    const handleAddContactClick = () => {
        setIsAddingContact(true);
    };

    const handleAddDivisionContactClick = () => {
        setIsAddingDivisionContact(true);
    };

    const handleContactSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!session || !(session as any).accessToken) {
            console.error('Missing session info');
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
                },
            };
            let contactResponse: { data: Contact };
            const contactData = {
                firstName: newContactFirstName,
                lastName: newContactLastName,
                phone: newContactPhone,
                email: newContactEmail,
            };
            if (company && company.hasDivisions && selectedDivision && selectedDivision.id) {
                contactResponse = await axiosInstance.post(
                    `/companies/${companyId}/divisions/${selectedDivision.id}/contacts`,
                    contactData,
                    config
                );
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
            setNewContactFirstName('');
            setNewContactLastName('');
            setNewContactPhone('');
            setNewContactEmail('');
            setIsAddingContact(false);
            setIsAddingDivisionContact(false);
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
                            onClick={() => router.push('/company')}
                            className="cursor-pointer text-lightbluesl hover:underline"
                        >
                            Company
                        </span>
                        <span>{'>'}</span>
                        <span className="font-bold">{company.name}</span>
                    </div>
                </div>
                <hr className="my-4" />

                {/* Company status and type */}
                <div className="flex flex-col space-y-1">
                    <span className={`font-semibold text-md ${getStatusColorClass(company.status)}`}>
                        {formatStatus(company.status)}
                    </span>
                    <span className="font-semibold text-lg">Type: {company.type}</span>
                </div>
                <hr className="my-4" />

                {/* Global Contacts Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">Contacts</h2>
                    <button
                        onClick={() => setIsAddingDivisionContact(true)}
                        className="bg-brandingpurple text-white px-7 py-2 rounded mt-1"
                    >
                        Add Contact
                    </button>
                    {contacts && contacts.length > 0 ? (
                        <div className="flex flex-row gap-4">
                            {contacts.map((contact) => (
                                <div key={contact.id} className="p-2 border rounded flex-1">
                                    <div className="font-semibold">{contact.firstName} {contact.lastName}</div>
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
                        <div className="text-gray-500 mt-1">No contacts available.</div>
                    )}
                   
                    <hr className="mt-4" />
                    {isAddingContact && (
                        <form
                            onSubmit={handleContactSubmit}
                            className="mt-4 p-4 border rounded space-y-2"
                        >
                            <h4 className="font-semibold">Add Contact</h4>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={newContactFirstName}
                                onChange={(e) => setNewContactFirstName(e.target.value)}
                                className="w-full border p-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={newContactLastName}
                                onChange={(e) => setNewContactLastName(e.target.value)}
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

                {/* Divisions Section */}
                {company.hasDivisions && company.divisions && company.divisions.length > 0 &&
                    company.divisions.map((division, index) => (
                        <div key={division.id} className="mt-6">
                            {index > 0 && <hr className="my-4" />}
                            <details className="group">
                                <summary className="flex justify-between items-center text-xl font-bold mb-4 cursor-pointer">
                                    <span>Division: {division.name}</span>
                                    <ChevronDown className="transition-transform text-darkbluesl duration-200 group-open:rotate-180" />
                                </summary>
                                <div className="flex flex-row gap-4">
                                    {/* Division Contracts */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">Contracts</h3>
                                        <button
                                            type="button"
                                            className="bg-brandingpurple text-white px-7 py-2 rounded mt-1"
                                        >
                                            Add Contracts
                                        </button>
                                        {division.contracts && division.contracts.length > 0 ? (
                                            division.contracts.map((contract) => (
                                                <div key={contract.id} className="flex flex-col p-2 border rounded mb-2">
                                                    <div className="mb-2">{contract.title}</div>
                                                    <button className="text-blue-600 underline self-start">
                                                        View Contract
                                                    </button>
                                                </div>
                                                
                                            ))
                                          
                                        ) : (
                                            
                                            <div className="text-gray-500 mt-1">No contracts available.</div>
                                        )}
                                        
                                    </div>

                                    {/* Division Locations */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-semibold">Locations</h3>
                                        </div>
                                        <button
                                            onClick={handleAddLocationClick}
                                            className="bg-brandingpurple text-white px-7 py-2 rounded mt-1"
                                        >
                                            Add Location
                                        </button>

                                        {/* Inline Edit/Add Location Form */}
                                        {isEditingLocation && (
                                            <form onSubmit={handleLocationSubmit} className="p-4 mb-4 space-y-2">
                                                <h4 className="font-semibold">
                                                    {isNewLocation ? 'Add New Location' : 'Edit Location'}
                                                </h4>
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
                                                <input
                                                    type="text"
                                                    placeholder="Street 2"
                                                    value={editingLocation.street2 || ''}
                                                    onChange={(e) =>
                                                        setEditingLocation({ ...editingLocation, street2: e.target.value })
                                                    }
                                                    className="w-full border p-2"
                                                />
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
                                        {(() => {
                                            const divisionLocations = division.locationAssignments
                                                ? division.locationAssignments.map(({ location }) => location)
                                                : [];
                                            return divisionLocations.length > 0 ? (
                                                divisionLocations.map((location, index) => {
                                                    const address = `${location.street1} ${location.street2 || ''} ${location.city} ${location.state} ${location.zipCode}`.trim();
                                                    const mapsUrl = /iPhone|iPad|iPod/.test(navigator.userAgent)
                                                        ? `http://maps.apple.com/?q=${encodeURIComponent(address)}`
                                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                                                    return (
                                                        <div
                                                            key={`${location.id}-${index}`}
                                                            className="flex flex-col p-2 mb-2"
                                                        >
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div className="font-bold">
                                                                    {location.name || 'Location Name'}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(mapsUrl, '_blank');
                                                                        }}
                                                                        className="text-lightbluesl"
                                                                    >
                                                                        <MapPin size={16} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditLocationClick(location);
                                                                        }}
                                                                        className="text-lightbluesl"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(address);
                                                                    alert('Address copied to clipboard!');
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="mb-1">{location.street1}</div>
                                                                {location.street2 && (
                                                                    <div className="mb-1">{location.street2}</div>
                                                                )}
                                                                <div className="mb-1">
                                                                    {location.city}, {location.state} {location.zipCode}
                                                                </div>
                                                                <div>United States</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-gray-500 mt-1">No locations assigned.</div>
                                            );
                                        })()}
                                    </div>
                                        
                                    {/* Division Contacts */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-semibold">Division Contacts</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsAddingDivisionContact(true)}
                                            className="bg-brandingpurple text-white px-7 py-2 rounded mt-1"
                                        >
                                            Add Division Contact
                                        </button>
                                        {division.contacts && division.contacts.length > 0 ? (
                                            division.contacts.map((contact) => (
                                                <div key={contact.id} className="p-2 border rounded mb-2 flex flex-col">
                                                    <div className="font-semibold">{contact.firstName} {contact.lastName}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Phone: {contact.phone || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Email: {contact.email || 'N/A'}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 mt-1">No contacts available.</div>
                                        )}

                                        {isAddingDivisionContact && (
                                            <form onSubmit={handleContactSubmit} className="p-4 border rounded mt-4 space-y-2">
                                                <h4 className="font-semibold">Add Division Contact</h4>
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={newContactFirstName}
                                                    onChange={(e) => setNewContactFirstName(e.target.value)}
                                                    className="w-full border p-2"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={newContactLastName}
                                                    onChange={(e) => setNewContactLastName(e.target.value)}
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
                                                        onClick={() => setIsAddingDivisionContact(false)}
                                                        className="border px-4 py-2"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                                {/* Job Bar */}
                                <div className="bg-white mt-6 border rounded p-4">
                                    <details className="group">
                                        <summary className="cursor-pointer flex justify-between items-center font-bold mb-2">
                                            <span>View Jobs</span>
                                            <ChevronDown className="transition-transform text-darkbluesl duration-200 group-open:rotate-180" />
                                        </summary>
                                        <div className="max-h-40 overflow-y-scroll border p-2">
                                            <div>Job 1</div>
                                            <div>Job 2</div>
                                            <div>Job 3</div>
                                            <div>Job 4</div>
                                            <div>Job 5</div>
                                            <div>Job 6</div>
                                            <div>Job 7</div>
                                            <div>Job 8</div>
                                            <div>Job 9</div>
                                            <div>Job 10</div>
                                        </div>
                                    </details>
                                    <div className="mt-4"></div>
                                </div>
                            </details>
                        </div>
                    ))
                }
                {/* Global Section for Company Without Divisions */}
                {!company.hasDivisions && (
                <div className="mt-6">
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Locations</h2>
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
                                            className="flex flex-col p-2 mb-2 cursor-pointer"
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
                                                        className="text-lightbluesl"
                                                    >
                                                        <MapPin size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditLocationClick(location);
                                                        }}
                                                        className="text-lightbluesl"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-1">{location.street1}</div>
                                            {location.street2 && <div className="mb-1">{location.street2}</div>}
                                            <div className="mb-1">
                                                {location.city}, {location.state} {location.zipCode}
                                            </div>
                                            <div>United States</div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500">No locations assigned.</p>
                            )}
                            <button
                                onClick={handleAddLocationClick}
                                className="flex items-center text-darkbluesl mt-2"
                            >
                                <Plus size={16} />
                                <span className="ml-1">Add Location</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Contracts</h2>
                            {contracts && contracts.length > 0 ? (
                                contracts.map((contract) => (
                                    <div key={contract.id} className="flex flex-col p-2 border rounded mb-2">
                                        <div className="mb-2 font-semibold">{contract.title}</div>
                                        <button className="text-blue-600 underline self-start">View Contract</button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No contracts available.</p>
                            )}
                        </div>
                    </div>
                </div>
                )}

                <hr className="my-4" />
                <div className="mt-4 flex justify-between">
                {showNewDivisionForm && (
                    <form onSubmit={handleNewDivisionSubmit} className="p-4 border rounded mt-4 space-y-2">
                    <h4 className="font-semibold">Add New Division</h4>
                    <input
                        type="text"
                        placeholder="Division Name"
                        value={newDivisionName}
                        onChange={(e) => setNewDivisionName(e.target.value)}
                        className="w-full border p-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Street 1"
                        value={newDivisionLocation.street1}
                        onChange={(e) =>
                        setNewDivisionLocation({ ...newDivisionLocation, street1: e.target.value })
                        }
                        className="w-full border p-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Street 2"
                        value={newDivisionLocation.street2 || ''}
                        onChange={(e) =>
                        setNewDivisionLocation({ ...newDivisionLocation, street2: e.target.value })
                        }
                        className="w-full border p-2"
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={newDivisionLocation.city}
                        onChange={(e) =>
                        setNewDivisionLocation({ ...newDivisionLocation, city: e.target.value })
                        }
                        className="w-full border p-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="State"
                        value={newDivisionLocation.state}
                        onChange={(e) =>
                        setNewDivisionLocation({ ...newDivisionLocation, state: e.target.value })
                        }
                        className="w-full border p-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Zip Code"
                        value={newDivisionLocation.zipCode}
                        onChange={(e) =>
                        setNewDivisionLocation({ ...newDivisionLocation, zipCode: e.target.value })
                        }
                        className="w-full border p-2"
                        required
                    />
                    <div className="flex gap-4">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
                        Save Division
                        </button>
                        <button
                        type="button"
                        onClick={() => setShowNewDivisionForm(false)}
                        className="border px-4 py-2"
                        >
                        Cancel
                        </button>
                    </div>
                    </form>
                )}
                <button
                    onClick={() => setShowNewDivisionForm(true)}
                    className="flex items-center text-darkbluesl mt-4"
                >
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
