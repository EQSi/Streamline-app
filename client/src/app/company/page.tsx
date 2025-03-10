'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/src/state/axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

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
            const response = await axiosInstance.post(
                '/companies',
                { name, type, status, hasDivisions },
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
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="hasDivisions" className="ml-2 block text-sm text-gray-700">
                    Has Divisions?
                </label>
            </div>
            <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700">
                Add Company
            </button>
        </form>
    );
};

type SortCriteria = 'name' | 'type' | 'active';

const sortCompanies = (companies: Company[], criteria: SortCriteria, ascending: boolean = true): Company[] => {
    const sorted = companies.slice().sort((a, b) => {
        switch (criteria) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'type':
                return a.type.localeCompare(b.type);
            case 'active': {
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

type FilterCriteria = {
    search: string;
    type: CompanyType | 'All';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'All';
};

const CompaniesPage: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
    // Retaining sorting state but without visible sort buttons.
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
    const [sortAscending] = useState(true);

    const [filters, setFilters] = useState<FilterCriteria>({
        search: '',
        type: 'All',
        status: 'All',
    });

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

    const handleFilterChange = (field: keyof FilterCriteria, value: string) => {
        setFilters({ ...filters, [field]: value });
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

    const filteredCompanies = companies.filter((company) => {
        const matchesSearch = company.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type === 'All' || company.type === filters.type;
        const matchesStatus = filters.status === 'All' || company.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
    });

    const sortedCompanies = sortCompanies(filteredCompanies, sortCriteria, sortAscending);

    return (
        <div className="min-h-screen w-full px-4 py-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Companies</h1>
                <div className="flex items-center space-x-1 text-sm">
                    <span
                        onClick={() => router.push('/dashboard')}
                        className="cursor-pointer text-lightbluesl hover:underline "
                    >
                        Dashboard
                    </span>
                    <span>{'>'}</span>
                    <span className="font-bold">Companies</span>
                </div>
            </div>
            <hr className="w-full border-t-2 border-gray-500 mb-4" />

            {/* Consolidated filter bar with search, filters, and the Add New Company button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full border pl-10 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={20} className="text-gray-500" />
                        </div>
                    </div>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="All">All Types</option>
                        <option value="Customer">Customer</option>
                        <option value="Subcontractor">Subcontractor</option>
                        <option value="Vendor">Vendor</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="All">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    <button
                        onClick={() => setShowAddCompanyForm((prev) => !prev)}
                        className="bg-[#414A9E] text-white rounded px-4 py-2 hover:bg-[#29ABE2]"
                    >
                        {showAddCompanyForm ? 'Cancel' : 'Add New Company'}
                    </button>
                </div>
            </div>

            {showAddCompanyForm && <AddCompanyForm onAddCompany={handleAddCompany} />}

            <div className="w-full">
                <div className="min-w-full bg-gray-50 text-[#29ABE3]" id="companyList">
                    <div className="flex justify-between border-b">
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Name</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Type</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Status</div>
                        <div className="px-2 py-2"></div>
                    </div>
                </div>
                {sortedCompanies.map((company, index) => (
                    <div
                        key={company.id}
                        onClick={() => router.push(`/company/details/${company.id}`)}
                        className={`group flex justify-between items-center py-4 px-4 border-b ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        } hover:bg-gray-100 cursor-pointer`}
                    >
                        <div className="flex-1">{company.name}</div>
                        <div className="flex-1">{company.type}</div>
                        <div className="flex-1">
                            <span className={getStatusClass(company.status)}>{formatStatus(company.status)}</span>
                        </div>
                        <div>
                            <ArrowRight size={20} className="text-lightbluesl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompaniesPage;
