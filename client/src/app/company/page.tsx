'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type CompanyType = 'Customer' | 'Subcontractor' | 'Vendor';

export interface Company {
    id: number;
    name: string;
    type: CompanyType;
    location: {
        id?: number;
        name: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
    divisions: {
        id?: number;
        name: string;
        description?: string;
    }[];
    contracts: {
        id?: number;
        title: string;
        status: string;
        startDate: string;
        endDate?: string;
    }[];
    contacts: {
        id?: number;
        name: string;
        email: string;
        phone?: string;
    }[];
    ratings: {
        id?: number;
        rating: number;
        comment?: string;
    }[];
    rates: {
        id?: number;
        rate: number;
        description?: string;
    }[];
}

const AddCompanyForm: React.FC<{ onAddCompany: (company: Company) => void }> = ({ onAddCompany }) => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [type, setType] = useState<CompanyType>('Customer');
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [stateValue, setStateValue] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [divisions, setDivisions] = useState<string[]>([]);
    const [divisionInput, setDivisionInput] = useState('');

    const handleAddDivision = () => {
        if (divisionInput) {
            setDivisions([...divisions, divisionInput]);
            setDivisionInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${session?.accessToken || ''}`,
                },
            };
            const response = await axios.post('https://localhost:8080/api/companies', {
                name,
                type,
                location: { name: location, address, city, state: stateValue, zipCode },
                divisions: divisions.map((division) => ({ name: division })),
            }, config);
            onAddCompany(response.data);
            setName('');
            setType('Customer');
            setLocation('');
            setAddress('');
            setCity('');
            setStateValue('');
            setZipCode('');
            setDivisions([]);
        } catch (error) {
            console.error('Failed to add company', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CompanyType)}
                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                >
                    <option value="Customer">Customer</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Vendor">Vendor</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <input
                    type="text"
                    placeholder="Location Name"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    required
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        type="text"
                        placeholder="State"
                        value={stateValue}
                        onChange={(e) => setStateValue(e.target.value)}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                        type="text"
                        placeholder="Zip Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Divisions</label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Division"
                        value={divisionInput}
                        onChange={(e) => setDivisionInput(e.target.value)}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <button
                        type="button"
                        onClick={handleAddDivision}
                        className="bg-green-500 text-white rounded px-6 py-2 hover:bg-green-600"
                    >
                        Add
                    </button>
                </div>
                {divisions.length > 0 && (
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                        {divisions.map((division, index) => (
                            <li key={index}>{division}</li>
                        ))}
                    </ul>
                )}
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

const CompaniesPage: React.FC = () => {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);

    const handleAddCompany = (company: Company) => {
        setCompanies([...companies, company]);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen w-full px-4 py-8">
            <div className="mb-4">
                <button onClick={handleBack} className="text-blue-500 hover:underline">
                    &larr; Dashboard
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-4">Companies</h1>
            <AddCompanyForm onAddCompany={handleAddCompany} />
        </div>
    );
};

export default CompaniesPage;
