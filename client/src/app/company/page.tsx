'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/src/state/axios';

export type CompanyType = 'Customer' | 'Subcontractor' | 'Vendor';

export interface Location {
    id?: number;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface Division {
    id?: number;
    name: string;
    location: Location;
}

export interface Contract {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    documents: Documents;
}

export interface Documents {
    id: number;
    title: string;
    url: string;
    type: string;
    fileSize: number;
    company: Company;
    division: Division;
    contract: Contract;
    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: number;
    name: string;
    type: CompanyType;
    hasDivisions: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    divisions: Division[];
    contracts: Contract[];
    documents: Documents[];
}

interface AddCompanyFormProps {
    onAddCompany: (company: Company) => void;
}

const AddCompanyForm: React.FC<AddCompanyFormProps> = ({ onAddCompany }) => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [type, setType] = useState<CompanyType>('Customer');
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');
    const [hasDivisions, setHasDivisions] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
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
            // Removed extra fields since the new route only requires name, type, status, and hasDivisions
            const response = await axiosInstance.post(
                '/companies',
                {
                    name,
                    type,
                    status,
                    hasDivisions,
                },
                config
            );
            onAddCompany(response.data);
            setName('');
            setType('Customer');
            setStatus('ACTIVE');
            setHasDivisions(false);
        } catch (error) {
            console.error('Failed to add company', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                    type="text"
                    placeholder="Company Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CompanyType)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                >
                    <option value="Customer">Customer</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Vendor">Vendor</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>
            <div className="flex items-center">
                <input
                    id="hasDivisions"
                    type="checkbox"
                    checked={hasDivisions}
                    onChange={(e) => setHasDivisions(e.target.checked)}
                    className="h-4 w-4 tex</p>t-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="hasDivisions" className="ml-2 block text-sm text-gray-700">
                    Has Divisions?
                </label>
            </div>
            <button
                type="submit"
                className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
            >
                Add Company
            </button>
        </form>
    );
};

interface EditCompanyFormProps {
    company: Company;
    onUpdateCompany: (updatedCompany: Company) => void;
    onCancel: () => void;
}

const EditCompanyForm: React.FC<EditCompanyFormProps> = ({ company, onUpdateCompany, onCancel }) => {
    const { data: session } = useSession();
    const [name, setName] = useState(company.name);
    const [type, setType] = useState<CompanyType>(company.type);
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>(company.status);
    const [hasDivisions, setHasDivisions] = useState(company.hasDivisions);

    const handleSubmit = async (e: React.FormEvent) => {
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
            const response = await axiosInstance.put(
                `/companies/${company.id}`,
                { name, type, status, hasDivisions },
                config
            );
            onUpdateCompany(response.data);
        } catch (error) {
            console.error('Failed to update company', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded shadow w-full space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CompanyType)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                >
                    <option value="Customer">Customer</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Vendor">Vendor</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>
            <div className="flex items-center">
                <input
                    id="editHasDivisions"
                    type="checkbox"
                    checked={hasDivisions}
                    onChange={(e) => setHasDivisions(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="editHasDivisions" className="ml-2 block text-sm text-gray-700">
                    Has Divisions?
                </label>
            </div>
            <div className="flex space-x-4">
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                    Save
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700">
                    Cancel
                </button>
            </div>
        </form>
    );
};

type SortCriteria = 'name' | 'type' | 'active';

const sortCompanies = (
    companies: Company[],
    criteria: SortCriteria,
    ascending: boolean = true
): Company[] => {
    const sorted = companies.slice().sort((a, b) => {
        switch (criteria) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'type':
                return a.type.localeCompare(b.type);
            case 'active': {
                // Active companies come first
                const aActive = a.status === 'ACTIVE' ? 1 : 0;
                const bActive = b.status === 'ACTIVE' ? 1 : 0;
                return bActive - aActive;
            }
            default:
                return 0;
        }
    });
    return ascending ? sorted : sorted.reverse();
};

interface SortButtonsProps {
    onSortChange: (criteria: SortCriteria, ascending: boolean) => void;
}

const SortButtons: React.FC<SortButtonsProps> = ({ onSortChange }) => {
    const [activeCriteria, setActiveCriteria] = React.useState<SortCriteria>('name');
    const [ascending, setAscending] = React.useState(true);

    const handleSort = (criteria: SortCriteria) => {
        const newAscending = activeCriteria === criteria ? !ascending : true;
        setActiveCriteria(criteria);
        setAscending(newAscending);
        onSortChange(criteria, newAscending);
    };

    return (
        <div className="mt-4 flex space-x-2 justify-start">
            <button
                onClick={() => handleSort('name')}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            >
                Sort by Name {activeCriteria === 'name' && (ascending ? '↑' : '↓')}
            </button>
            <button
                onClick={() => handleSort('type')}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            >
                Sort by Type {activeCriteria === 'type' && (ascending ? '↑' : '↓')}
            </button>
            <button
                onClick={() => handleSort('active')}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            >
                Sort by Active {activeCriteria === 'active' && (ascending ? '↑' : '↓')}
            </button>
        </div>
    );
};

const CompaniesPage: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

    // New sort state
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
    const [sortAscending, setSortAscending] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!session || !(session as any).accessToken) {
                console.error('No access token found');
                return;
            }
            try {
                const response = await axiosInstance.get('/companies', {
                    headers: {
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                });
                setCompanies(response.data);
            } catch (error) {
                console.error('Failed to fetch companies:', error);
            }
        };

        fetchCompanies();
    }, [session]);

    const handleAddCompany = (company: Company) => {
        setCompanies([...companies, company]);
        setShowAddCompanyForm(false);
    };

    const handleUpdateCompany = (updatedCompany: Company) => {
        setCompanies((prevCompanies) =>
            prevCompanies.map((company) =>
                company.id === updatedCompany.id ? updatedCompany : company
            )
        );
        setEditingCompanyId(null);
    };

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

    const getStatusClass = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
        switch (status) {
            case 'ACTIVE':
                return 'text-green-500';
            case 'INACTIVE':
                return 'text-red-500';
            case 'SUSPENDED':
                return 'text-yellow-500';
            default:
                return '';
        }
    };

    const handleSortChange = (criteria: SortCriteria, ascending: boolean) => {
        setSortCriteria(criteria);
        setSortAscending(ascending);
    };

    const sortedCompanies = sortCompanies(companies, sortCriteria, sortAscending);

    return (
        <div className="min-h-screen w-full px-4 py-8">
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Companies</h1>
                    <div className="flex items-center space-x-1 text-sm">
                        <span
                            className="cursor-pointer text-blue-600 hover:underline"
                            onClick={() => router.push('/dashboard')}
                        >
                            Dashboard
                        </span>
                        <span>{'>'}</span>
                        <span className="font-bold">Companies</span>
                    </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <SortButtons onSortChange={handleSortChange} />
                    <button
                        onClick={() => setShowAddCompanyForm((prev) => !prev)}
                        className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                    >
                        {showAddCompanyForm ? 'Cancel' : 'Add New Company'}
                    </button>
                </div>
            </div>
            {showAddCompanyForm && (
                <AddCompanyForm onAddCompany={handleAddCompany} />
            )}
            <div className="mt-8 grid grid-cols-1 gap-4">
                {sortedCompanies.length > 0 ? (
                    sortedCompanies.map((company) => (
                        <div key={company.id} className="bg-white p-4 rounded shadow transition-shadow duration-300">
                            <div className="flex justify-between items-center">
                                {editingCompanyId === company.id ? (
                                    <EditCompanyForm
                                        company={company}
                                        onUpdateCompany={handleUpdateCompany}
                                        onCancel={() => setEditingCompanyId(null)}
                                    />
                                ) : (
                                    <>
                                        <div>
                                            <h2 className="text-xl font-bold">{company.name}</h2>
                                            <p className="text-gray-600">{company.type}</p>
                                            <p className={`text-gray-600 ${getStatusClass(company.status)}`}>
                                                {formatStatus(company.status)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingCompanyId(company.id)}
                                                className="bg-orange-400 text-white rounded px-4 py-2 hover:bg-orange-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => router.push(`/company/details/${company.id}`)}
                                                className="bg-cyan-400 text-white rounded px-4 py-2 hover:bg-cyan-600"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No companies added yet.</p>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
