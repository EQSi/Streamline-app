'use client';

import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from '@/state/axios';

interface Employee {
    id: number;
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
    id: number;
    username: string;
    role: string; 
}

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

export default function UserManagementPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
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
        role: "EMPLOYEE",
        salary: 0
    });
    const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
    const [showActiveEmployees, setShowActiveEmployees] = useState(true);

    const handleShowAddEmployeeForm = () => {
        setShowAddEmployeeForm(!showAddEmployeeForm);
    };

    const toggleEmployeeFilter = () => {
        setShowActiveEmployees(!showActiveEmployees);
    };

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

        fetchEmployees();
        fetchUsers();
    }, [session]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.accessToken) return;

        try {
            // Hash the password before sending using bcrypt
            const hashedPassword = await hashPassword(newEmployee.password);

            const newUser = {
                username: newEmployee.username,
                password: hashedPassword,
                role: newEmployee.role,
            };

            const userRes = await axiosInstance.post('/users', newUser, {
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                },
            });

            const createdUser = userRes.data;
            const { username, password, role, ...employeeData } = newEmployee;
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
                role: "EMPLOYEE",
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
            // If a new password is provided, update the user password
            if (editingPassword.trim() !== "") {
                const hashedPassword = await hashPassword(editingPassword);
                await axiosInstance.put(`/users/${employee.userId}`, { password: hashedPassword }, {
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

    const handleDeleteEmployee = async (id: number) => {
        if (!session?.accessToken) return;

        try {
            await axiosInstance.delete(`/employees/${id}`, {
                headers: {
                    "Authorization": `Bearer ${(session as any).accessToken}`,
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
            });

            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleEditClick = (id: number) => {
        setEditingPassword("");
        setEditingEmployeeId(editingEmployeeId === id ? null : id);
    };

    const handleDeleteClick = (id: number) => {
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

    return (
        <div className="flex flex-col items-left min-h-screen bg-gray-50 py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    onClick={handleBackClick}
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                >
                    Back to Admin
                </button>
            </div>
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={handleShowAddEmployeeForm}
                    className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 w-52"
                >
                    {showAddEmployeeForm ? 'Cancel' : 'Add New Employee'}
                </button>
                <button
                    onClick={toggleEmployeeFilter}
                    className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600 w-52"
                >
                    {showActiveEmployees ? 'Show Previous Employees' : 'Show Active Employees'}
                </button>
            </div>
            {showAddEmployeeForm && (
                <div className="mx-full">
                    <h2 className="text-xl font-semibold mb-2 py-4">Add New Employee</h2>
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
                                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={newEmployee.role}
                                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="EMPLOYEE">EMPLOYEE</option>
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
                <h2 className="text-xl font-semibold mb-4">{showActiveEmployees ? 'Active Employees' : 'Non-Active Employees'}</h2>
                <table className="min-w-full bg-white" id="employeeList">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Email</th>
                            <th className="py-2 px-4 border-b text-left">Position</th>
                            <th className="py-2 px-4 border-b text-left">User</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.filter(emp => showActiveEmployees ? emp.status === 'Active' : emp.status !== 'Active').map((employee) => (
                            <React.Fragment key={employee.id}>
                                <tr>
                                    <td className="py-2 px-4 border-b">{employee.firstName} {employee.lastName}</td>
                                    <td className="py-2 px-4 border-b">{employee.email}</td>
                                    <td className="py-2 px-4 border-b">{formatPosition(employee.position)}</td>
                                    <td className="py-2 px-4 border-b">{users.find(user => user.id === employee.userId)?.username}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            data-id={employee.id}
                                            className="edit-btn bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600 mr-2"
                                            onClick={() => handleEditClick(employee.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            data-id={employee.id}
                                            className="delete-btn bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                                            onClick={() => handleDeleteClick(employee.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                {editingEmployeeId === employee.id && (
                                    <tr>
                                        <td colSpan={5} className="py-2 px-2 border-b">
                                            <form
                                                onSubmit={(e) => handleEditEmployee(e, employee)}
                                                className="bg-white p-8 rounded shadow w-full space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="First Name"
                                                        value={employee.firstName}
                                                        onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, firstName: e.target.value } : emp))}
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Last Name"
                                                        value={employee.lastName}
                                                        onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, lastName: e.target.value } : emp))}
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={employee.email}
                                                        onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, email: e.target.value } : emp))}
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                                    <select
                                                        value={employee.position}
                                                        onChange={(e) =>
                                                            setEmployees(
                                                                employees.map(emp =>
                                                                    emp.id === employee.id ? { ...emp, position: e.target.value } : emp
                                                                )
                                                            )
                                                        }
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone Number"
                                                        value={employee.phoneNumber}
                                                        onChange={(e) => 
                                                            setEmployees(employees.map(emp => 
                                                                emp.id === employee.id ? { ...emp, phoneNumber: formatPhoneNumber(e.target.value) } : emp
                                                            ))
                                                        }
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        placeholder="Start Date"
                                                        value={formatDateForInput(employee.startDate)}
                                                        onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, startDate: e.target.value } : emp))}
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                    <select
                                                        value={employee.status}
                                                        onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, status: e.target.value } : emp))}
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
                                                            value={employee.salary}
                                                            onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, salary: parseFloat(e.target.value) } : emp))}
                                                            className="border border-gray-300 rounded w-full px-3 py-2 pl-8 focus:outline-none focus:ring focus:ring-indigo-300"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={editingPassword}
                                                        onChange={(e) => setEditingPassword(e.target.value)}
                                                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                                                >
                                                    Update Employee
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
