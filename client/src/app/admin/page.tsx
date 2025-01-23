'use client';

import { useState } from 'react';

interface UserFormData {
    username: string;
    password: string;
    roles: 'Employee' | 'Admin' | 'ExternalUser';
    googleId: string;
    googleAccessToken: string;
    googleRefreshToken: string;
    isAdmin: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    position: string;
    startDate: string;
    salary: number;
    status: 'Active' | 'OnLeave' | 'Terminated' | 'Suspended';
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

export default function UserManagementPage() {
    const initialFormData: UserFormData = {
        username: '',
        password: '',
        roles: 'Employee',
        googleId: '',
        googleAccessToken: '',
        googleRefreshToken: '',
        isAdmin: false,
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        position: '',
        startDate: '',
        salary: 0,
        status: 'Active',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    const [formData, setFormData] = useState<UserFormData>(initialFormData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('User created successfully');
                clearForm();
            } else {
                throw new Error('Failed to create user');
            }
        } catch (err) {
            alert('Error creating user');
            console.error(err);
        }
    };

    const clearForm = () => {
        setFormData(initialFormData);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Add New User</h1>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* User Account Information */}
                    <div className="col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Google ID</label>
                        <input
                            type="text"
                            value={formData.googleId}
                            onChange={(e) => setFormData({...formData, googleId: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Google Access Token</label>
                        <input
                            type="text"
                            value={formData.googleAccessToken}
                            onChange={(e) => setFormData({...formData, googleAccessToken: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Google Refresh Token</label>
                        <input
                            type="text"
                            value={formData.googleRefreshToken}
                            onChange={(e) => setFormData({...formData, googleRefreshToken: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={formData.roles}
                            onChange={(e) => setFormData({...formData, roles: e.target.value as 'Employee' | 'Admin' | 'ExternalUser'})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                            <option value="ExternalUser">External User</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Is Admin</label>
                        <input
                            type="checkbox"
                            checked={formData.isAdmin}
                            onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                            className="mt-1 block"
                        />
                    </div>

                    {/* Employee Information */}
                    <div className="col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <input
                            type="text"
                            required
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Salary</label>
                        <input
                            type="number"
                            required
                            value={formData.salary}
                            onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value)})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'OnLeave' | 'Terminated' | 'Suspended'})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="Active">Active</option>
                            <option value="OnLeave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                        <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    
                    <div className="col-span-2 flex justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        >
                            Create User
                        </button>
                        <button
                            type="button"
                            onClick={clearForm}
                            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                        >
                            Clear Fields
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
