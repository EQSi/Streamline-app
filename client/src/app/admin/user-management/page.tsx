'use client';

import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from '@/src/state/axios';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Search, ChevronDown } from 'lucide-react';


/**
 * @file page.tsx
 * @module UserManagementPage
 *
 * @remarks
 * Developer Notes:
 * - The user management page component is responsible for rendering the user management dashboard.
 * - The goal of this page is to allow the admin to add new users, edit existing users, or mark a user as terminated.
 * - Each user will have infromation that corresponds to them including personal information, position, and status.
 * - This page is marked complete and has finished UI for it as of 2025-02-22. JTW
 *
 * @returns {JSX.Element} 
 */


// Helper to format phone numbers e.g. (123) 456-7890
const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Helper to format enum position values with spaces (e.g. FieldTechnicianL1 => Field Technician L1)
const formatPosition = (position: string = ""): string => {
    return position.replace(/([A-Z])/g, ' $1').trim();
};

// Utility to hash a password using bcrypt
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Function to validate login credentials
const validateCredentials = (username: string, password: string): { isValid: boolean; errors: string[] } => {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const errors: string[] = [];

    if (!usernameRegex.test(username)) {
        errors.push("Username must be between 3-20 characters, start with a letter, and can only contain letters, numbers, and underscores.");
    }

    if (!passwordRegex.test(password)) {
        errors.push("Password must be at least 8 characters long, contain at least one number, one uppercase letter, and one special character.");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Function to calculate password strength
const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
};

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    position?: string;
    startDate: string;
    status: string;
    userId: number;
    salary: number;
}

interface User {
    id: string;
    username: string;
    role: string;
    roleId?: string;
}

interface Role {
    id: string;
    name: string;
}

export default function UserManagementPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [visibleUserCount, setVisibleUserCount] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [editingPassword, setEditingPassword] = useState("");
    const [newEmployee, setNewEmployee] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        position: "OfficeStaff",
        startDate: "",
        status: "Active",
        userId: 0,
        username: "",
        password: "",
        roleId: "",
        salary: 0
    });
    const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

    // New filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // options: all, active, onleave, terminated, suspended
    const [groupFilter, setGroupFilter] = useState('all'); // filter by position
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (!session || !(session as any).accessToken) return;

        const fetchEmployees = async () => {
            try {
                const res = await axiosInstance.get('/employees', {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                setEmployees(res.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get('/users', {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                setUsers(res.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchRoles = async () => {
            try {
                const res = await axiosInstance.get('/roles', {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                setRoles(res.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchEmployees();
        fetchUsers();
        fetchRoles();
    }, [session]);

    const handleShowAddEmployeeForm = () => {
        setShowAddEmployeeForm(!showAddEmployeeForm);
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.accessToken) return;

        try {
            const { isValid, errors } = validateCredentials(newEmployee.username, newEmployee.password);
            if (!isValid) {
                alert(errors.join('\n'));
                return;
            }

            const hashedPassword = await hashPassword(newEmployee.password);
            const newUser = {
                username: newEmployee.username,
                password: hashedPassword,
                roleId: newEmployee.roleId,
            };

            const userRes = await axiosInstance.post('/users', newUser, {
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                },
            });

            const createdUser = userRes.data;
            const { username, password, roleId, ...employeeData } = newEmployee;
            const employeeToAdd = { ...employeeData, userId: createdUser.id };

            const res = await axiosInstance.post('/employees', employeeToAdd, {
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                    "Cache-Control": "no-store",
                },
            });

            const addedEmployee = res.data;
            setEmployees((prevEmployees) => [...prevEmployees, addedEmployee]);
            setUsers((prevUsers) => [...prevUsers, createdUser]);
            setNewEmployee({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                position: "OfficeStaff",
                startDate: "",
                status: "Active",
                userId: 0,
                username: "",
                password: "",
                roleId: "",
                salary: 0,
            });
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Error adding employee, please try again');
        }
    };

    const handleEditEmployee = async (e: React.FormEvent, employee: Employee) => {
        e.preventDefault();
        if (!session?.accessToken) return;
    
        try {
            const updatedEmployeeData = {
                ...employee,
                startDate: new Date(employee.startDate).toISOString(),
            };
    
            const res = await axiosInstance.put(`/employees/${employee.id}`, updatedEmployeeData, {
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                    "Cache-Control": "no-store",
                },
            });
    
            const updatedEmployee = res.data;
            setEmployees((prevEmployees) =>
                prevEmployees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
            );
    
            // Get the currently selected role from the users state
            const currentUser = users.find(user => user.id === employee.userId.toString());
            if (currentUser) {
                const matchingRole = roles.find(r => r.name === currentUser.role);
                if (!matchingRole) {
                    alert('Role not found');
                    return;
                }
                const updatePayload: any = { roleId: matchingRole.id };
                if (editingPassword.trim() !== "") {
                    const { isValid, errors } = validateCredentials(currentUser.username, editingPassword);
                    if (!isValid) {
                        alert(errors.join('\n'));
                        return;
                    }
                    updatePayload.password = await hashPassword(editingPassword);
                }
                await axiosInstance.put(`/users/${employee.userId}`, updatePayload, {
                    headers: { 
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${(session as any).accessToken}`,
                    },
                });
            }
    
            setEditingEmployeeId(null);
            setEditingPassword("");
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error updating employee, please try again');
        }
    };

    const handleDeleteEmployee = async (id: String) => {
        if (!session?.accessToken) return;

        try {
            await axiosInstance.delete(`/employees/${id}`, {
                headers: {
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
            });
            setEmployees(employees.filter(emp => emp.id !== id.toString()));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleDeleteClick = (id: string) => {
        handleDeleteEmployee(id);
    };

    const handleBackClick = () => {
        router.push('/admin');
    };

    // Helper to convert a date string for input[type="date"] (yyyy-mm-dd)
    const formatDateForInput = (dateStr: string) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
    };

    // Compute filtered employees based on search, status and group (position) filter and sort alphabetically.
    const filteredEmployees = employees
        .filter(emp => {
            const fullName = (emp.firstName + " " + emp.lastName).toLowerCase();
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                fullName.includes(searchLower) || emp.email.toLowerCase().includes(searchLower);
            const matchesStatus = statusFilter === 'all'
                ? true
                : emp.status.toLowerCase() === statusFilter;
            const matchesGroup = groupFilter === 'all'
                ? true
                : emp.position === groupFilter;
            return matchesSearch && matchesStatus && matchesGroup;
        })
        .sort((a, b) => {
            const nameA = (a.firstName + " " + a.lastName).toLowerCase();
            const nameB = (b.firstName + " " + b.lastName).toLowerCase();
            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });

    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="flex mx-full justify-between items-center mb-4 ">
                <h1 className="text-2xl font-bold">Users</h1>
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
                    <span className="font-bold">Users</span>
                </div>
            </div>
            <hr className="w-full border-t-2 border-gray-500 mb-4" />
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border pl-10 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="text-gray-500" size={20} />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="active">Active</option>
                        <option value="all">All Statuses</option>
                        <option value="onleave">On Leave</option>
                        <option value="terminated">Terminated</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <select
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="all">All Groups</option>
                        {["ProjectManager", "FieldManager", "FieldTechnicianL1", "FieldTechnicianL2", "FieldTechnicianL3", "OfficeStaff", "Owner"].map(pos => (
                            <option key={pos} value={pos}>
                                {formatPosition(pos)}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="asc">A - Z</option>
                        <option value="desc">Z - A</option>
                    </select>
                </div>
                <div>
                    <button
                        onClick={handleShowAddEmployeeForm}
                        className="bg-[#414A9E] text-white rounded px-4 py-2 hover:bg-[#29ABE2]"
                    >
                        {showAddEmployeeForm ? 'Cancel' : 'Add New User'}
                    </button>
                </div>
            </div>
            {showAddEmployeeForm && (
                <div className="mx-full">
                    <h2 className="text-xl font-semibold mb-2 py-4">Add New User</h2>
                    <form
                        onSubmit={handleAddEmployee}
                        className="bg-white p-8 rounded shadow w-full space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={newEmployee.firstName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={newEmployee.lastName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={newEmployee.phoneNumber}
                                onChange={(e) =>
                                    setNewEmployee({ ...newEmployee, phoneNumber: formatPhoneNumber(e.target.value) })
                                }
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select
                                value={newEmployee.position}
                                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            >
                                {["ProjectManager", "FieldManager", "FieldTechnicianL1", "FieldTechnicianL2", "FieldTechnicianL3", "OfficeStaff", "Owner"].map(pos => (
                                    <option key={pos} value={pos}>
                                        {formatPosition(pos)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={newEmployee.startDate}
                                onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={newEmployee.status}
                                onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            >
                                <option value="Active">Active</option>
                                <option value="OnLeave">On Leave</option>
                                <option value="Terminated">Terminated</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    placeholder="Salary"
                                    value={newEmployee.salary}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })}
                                    className="border border-gray-300 rounded w-full px-3 py-2 pl-8 focus:outline-none focus:ring focus:ring-indigo-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                placeholder="Username"
                                value={newEmployee.username}
                                onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={newEmployee.password}
                                onChange={(e) => {
                                    const newPassword = e.target.value;
                                    setNewEmployee({ ...newEmployee, password: newPassword });
                                    const { isValid, errors } = validateCredentials(newEmployee.username, newPassword);
                                    if (!isValid) console.log(errors.join('\n'));
                                }}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <p className="text-sm text-gray-500">
                            Password must be at least 8 chars, with at least one uppercase, one digit, and one special character.
                        </p>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={newEmployee.roleId}
                                onChange={(e) => setNewEmployee({ ...newEmployee, roleId: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                        >
                            Add Employee
                        </button>
                    </form>
                </div>
            )}

            <div className="w-full">
                <div className="min-w-full bg-gray-50 text-[#29ABE3]" id="employeeList">
                    <div className="group flex justify-between border-b">
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Name</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Group</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">Email</div>
                        <div className="px-2 py-2 font-semibold flex-1 text-left">User</div>
                        <div className="px-2 py-2 font-semibold w-8"></div>
                    </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {filteredEmployees.map((employee, index) => (
                        <AccordionItem key={employee.id} value={employee.id}>
                            <AccordionTrigger
                                className={`group flex justify-between items-center py-4 px-4 border-b ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } hover:bg-gray-100`}
                            >
                                <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                                    <span className="truncate w-1/4">
                                        {employee.firstName} {employee.lastName}
                                    </span>
                                    <span className="truncate w-1/4 ml-2">
                                        {formatPosition(employee.position)}
                                    </span>
                                    <span className="truncate w-1/4">{employee.email}</span>
                                    <span className="truncate w-1/4 ml-2">
                                        {users.find(user => user.id === employee.userId.toString())?.username}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="border-b">
                                    <div className="p-6 bg-gray-100">
                                        <form
                                            onSubmit={(e) => handleEditEmployee(e, employee)}
                                            className="space-y-4"
                                        >
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.firstName}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map((emp) =>
                                                                    emp.id === employee.id
                                                                        ? { ...emp, firstName: e.target.value }
                                                                        : emp
                                                                )
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.lastName}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map((emp) =>
                                                                    emp.id === employee.id
                                                                        ? { ...emp, lastName: e.target.value }
                                                                        : emp
                                                                )
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={employee.email}
                                                    onChange={(e) =>
                                                        setEmployees(
                                                            employees.map((emp) =>
                                                                emp.id === employee.id
                                                                    ? { ...emp, email: e.target.value }
                                                                    : emp
                                                            )
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Position
                                                </label>
                                                <select
                                                    value={employee.position}
                                                    onChange={(e) =>
                                                        setEmployees(
                                                            employees.map((emp) =>
                                                                emp.id === employee.id
                                                                    ? { ...emp, position: e.target.value }
                                                                    : emp
                                                            )
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                >
                                                    {[
                                                        "ProjectManager",
                                                        "FieldManager",
                                                        "FieldTechnicianL1",
                                                        "FieldTechnicianL2",
                                                        "FieldTechnicianL3",
                                                        "OfficeStaff",
                                                        "Owner",
                                                    ].map((pos) => (
                                                        <option key={pos} value={pos}>
                                                            {formatPosition(pos)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={employee.phoneNumber}
                                                    onChange={(e) =>
                                                        setEmployees(
                                                            employees.map((emp) =>
                                                                emp.id === employee.id
                                                                    ? { ...emp, phoneNumber: formatPhoneNumber(e.target.value) }
                                                                    : emp
                                                            )
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Start Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formatDateForInput(employee.startDate)}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map((emp) =>
                                                                    emp.id === employee.id
                                                                        ? { ...emp, startDate: e.target.value }
                                                                        : emp
                                                                )
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Status
                                                    </label>
                                                    <select
                                                        value={employee.status}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map((emp) =>
                                                                    emp.id === employee.id
                                                                        ? { ...emp, status: e.target.value }
                                                                        : emp
                                                                )
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="OnLeave">On Leave</option>
                                                        <option value="Terminated">Terminated</option>
                                                        <option value="Suspended">Suspended</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Salary
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                        $
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={employee.salary}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map((emp) =>
                                                                    emp.id === employee.id
                                                                        ? { ...emp, salary: parseFloat(e.target.value) }
                                                                        : emp
                                                                )
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 pl-8 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={editingPassword}
                                                    onChange={(e) => setEditingPassword(e.target.value)}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Role
                                                </label>
                                                <select
                                                    value={
                                                        // Use the new roleId property, or fallback to an empty string if not set
                                                        users.find(user => user.id === employee.userId.toString())?.roleId || ""
                                                    }
                                                    onChange={(e) => {
                                                        const newRoleId = e.target.value;
                                                        setUsers(
                                                            users.map(user =>
                                                                user.id === employee.userId.toString()
                                                                    ? {
                                                                          ...user,
                                                                          // Update the roleId and set role to the corresponding role name from the roles list.
                                                                          roleId: newRoleId,
                                                                          role: roles.find(role => role.id === newRoleId)?.name || "",
                                                                      }
                                                                    : user
                                                            )
                                                        );
                                                    }}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                >
                                                    <option value="">Select Role</option>
                                                    {roles.map((role) => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="submit"
                                                    className="bg-[#29ABE3] text-white rounded px-4 py-2 hover:bg-[#1C8FA6]"
                                                >
                                                    Update Employee
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(employee.id)}
                                                    className="bg-[#FF9F1C] text-white rounded px-4 py-2 hover:bg-[#FFA726]"
                                                >
                                                    Make Inactive
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            {filteredEmployees.length > visibleUserCount && (
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
                        Page {currentPage} of {Math.ceil(filteredEmployees.length / visibleUserCount)}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev: number) => prev + 1)
                        }
                        disabled={currentPage === Math.ceil(filteredEmployees.length / visibleUserCount)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
