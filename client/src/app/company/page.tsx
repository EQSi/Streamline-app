'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/state/axios';

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

export interface Company {
    id: number;
    name: string;
    type: CompanyType;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    divisions: Division[];
}

interface AddCompanyFormProps {
    onAddCompany: (company: Company) => void;
}

const AddCompanyForm: React.FC<AddCompanyFormProps> = ({ onAddCompany }) => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [type, setType] = useState<CompanyType>('Customer');
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

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
            const response = await axios.post(
                'https://localhost:8080/api/companies',
                {
                    name,
                    type,
                    status,
                    divisions: [],
                },
                config
            );
            onAddCompany(response.data);
            setName('');
            setType('Customer');
            setStatus('ACTIVE');
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
            <button
                type="submit"
                className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
            >
                Add Company
            </button>
        </form>
    );
};

const AddDivisionForm: React.FC<{ companyId: number; onAddDivision: (companyId: number, division: Division) => void }> = ({ companyId, onAddDivision }) => {
    const { data: session } = useSession();

    const [divisionName, setDivisionName] = useState('');
    const [divStreet1, setDivStreet1] = useState('');
    const [divStreet2, setDivStreet2] = useState('');
    const [divCity, setDivCity] = useState('');
    const [divState, setDivState] = useState('');
    const [divZipCode, setDivZipCode] = useState('');

    const handleAddDivision = async () => {
        if (!session || !(session as any).accessToken) {
            console.error('No access token found');
            return;
        }
        if (divisionName && divStreet1 && divCity && divState && divZipCode) {
            const newDivision: Division = {
                name: divisionName,
                location: {
                    street1: divStreet1,
                    street2: divStreet2,
                    city: divCity,
                    state: divState,
                    zipCode: divZipCode,
                },
            };

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                };
                const response = await axios.post(
                    `https://localhost:8080/api/companies/${companyId}/divisions`,
                    newDivision,
                    config
                );
                onAddDivision(companyId, response.data);
                // Reset fields
                setDivisionName('');
                setDivStreet1('');
                setDivStreet2('');
                setDivCity('');
                setDivState('');
                setDivZipCode('');
            } catch (error) {
                console.error('Failed to add division', error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Add Division</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700">Division Name</label>
                <input
                    type="text"
                    placeholder="Division Name"
                    value={divisionName}
                    onChange={(e) => setDivisionName(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Street Address 1</label>
                <input
                    type="text"
                    placeholder="Street Address 1"
                    value={divStreet1}
                    onChange={(e) => setDivStreet1(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Street Address 2</label>
                <input
                    type="text"
                    placeholder="Street Address 2"
                    value={divStreet2}
                    onChange={(e) => setDivStreet2(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                    type="text"
                    placeholder="City"
                    value={divCity}
                    onChange={(e) => setDivCity(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                    type="text"
                    placeholder="State"
                    value={divState}
                    onChange={(e) => setDivState(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                    type="text"
                    placeholder="Zip Code"
                    value={divZipCode}
                    onChange={(e) => setDivZipCode(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2"
                    required
                />
            </div>
            <button
                type="button"
                onClick={handleAddDivision}
                className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
            >
                Add Division
            </button>
        </div>
    );
};

const CompaniesPage: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [expandedCompanyIds, setExpandedCompanyIds] = useState<number[]>([]);
    const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  
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

    const toggleAddCompanyForm = () => setShowAddCompanyForm((prev) => !prev);

    const handleAddCompany = (company: Company) => {
        setCompanies([...companies, company]);
        setShowAddCompanyForm(false);
    };

    const handleAddDivision = (companyId: number, division: Division) => {
        setCompanies((prevCompanies) =>
            prevCompanies.map((company) =>
                company.id === companyId
                    ? { ...company, divisions: [...company.divisions, division] }
                    : company
            )
        );
        setExpandedCompanyIds([]);
    };

    const handleBack = () => router.back();

    const toggleExpandCompany = (companyId: number) => {
        console.log('Toggling company:', companyId);
        if (expandedCompanyIds.includes(companyId)) {
            setExpandedCompanyIds([]);
        } else {
            setExpandedCompanyIds([companyId]);
        }
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

    return (
        <div className="min-h-screen w-full px-4 py-8">
            <div className="mb-4">
                <button onClick={handleBack} className="text-blue-500 hover:underline">
                    &larr; Dashboard
                </button>
            </div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Companies</h1>
                <button
                    onClick={toggleAddCompanyForm}
                    className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                >
                    {showAddCompanyForm ? 'Cancel' : 'Add New Company'}
                </button>
            </div>
            {showAddCompanyForm && <AddCompanyForm onAddCompany={handleAddCompany} />}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                {companies.length > 0 ? (
                    companies.map((company) => (
                        <div 
                            key={company.id} 
                            className={`bg-white p-4 rounded shadow transition-shadow duration-300 ${
                                expandedCompanyIds.includes(company.id) ? 'md:col-span-1 lg:col-span-1' : ''
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">{company.name}</h2>
                                <button
                                    onClick={() => toggleExpandCompany(company.id)}
                                    className="text-blue-500 hover:underline flex items-center"
                                >
                                    {expandedCompanyIds.includes(company.id) ? (
                                        <>
                                            Collapse <ChevronUp className="ml-1" />
                                        </>
                                    ) : (
                                        <>
                                            Expand <ChevronDown className="ml-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-gray-600">{company.type}</p>
                            <p className={`text-gray-600 ${getStatusClass(company.status)}`}>
                                {formatStatus(company.status)}
                            </p>
                            <div className={`overflow-hidden transition-all duration-300 ${
                                expandedCompanyIds.includes(company.id) ? 'max-h-[2000px]' : 'max-h-0'
                            }`}>
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold">Divisions</h3>
                                    {company.divisions && company.divisions.length > 0 ? (
                                        company.divisions.map((div, idx) => (
                                            <div key={idx} className="mt-2">
                                                <p className="font-bold">{div.name}</p>
                                                <p>
                                                    {div.location.street1}, {div.location.city},{' '}
                                                    {div.location.state} {div.location.zipCode}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No divisions added yet.</p>
                                    )}
                                    <div className="mt-4">
                                        <AddDivisionForm
                                            companyId={company.id}
                                            onAddDivision={handleAddDivision}
                                        />
                                    </div>
                                </div>
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
