"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    position: string;
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

export default function UserManagementPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
    const [newEmployee, setNewEmployee] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        position: "",
        startDate: "",
        status: "Active",
        userId: 0,
        username: "",
        password: "",
        role: "Employee",
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
        if (!session || !session.accessToken) return;

        const fetchEmployees = async () => {
            try {
                const res = await fetch('https://localhost:8080/api/employees', {
                    credentials: 'include',
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setEmployees(data);
                } else {
                    throw new Error('Failed to fetch employees');
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch('https://localhost:8080/api/users', {
                    credentials: 'include',
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    throw new Error('Failed to fetch users');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchEmployees();
        fetchUsers();
    }, [session?.accessToken]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.accessToken) return;

        try {
            const newUser = {
                username: newEmployee.username,
                password: newEmployee.password,
                role: newEmployee.role,
            };

            const userRes = await fetch('https://localhost:8080/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(newUser),
                credentials: 'include',
            });

            if (userRes.ok) {
                const createdUser = await userRes.json();
                const employeeToAdd = { ...newEmployee, userId: createdUser.id };

                const res = await fetch('https://localhost:8080/api/employees', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Cache-Control": "no-store",
                    },
                    body: JSON.stringify(employeeToAdd),
                    credentials: 'include',
                });

                if (res.ok) {
                    const addedEmployee = await res.json();
                    setEmployees((prevEmployees) => [...prevEmployees, addedEmployee]);
                    setNewEmployee({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phoneNumber: "",
                        position: "",
                        startDate: "",
                        status: "Active",
                        userId: 0,
                        username: "",
                        password: "",
                        role: "Employee",
                        salary: 0,
                    });
                } else {
                    throw new Error('Failed to add employee');
                }
            } else {
                throw new Error('Failed to create user');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Error adding employee, please try again');
        }
    };

    const handleEditEmployee = async (e: React.FormEvent, employee: Employee) => {
        e.preventDefault();
        if (!session?.accessToken) return;

        try {
            const userToUpdate = users.find((user) => user.id === employee.userId);
            if (userToUpdate) {
                const updatedUser = {
                    ...userToUpdate,
                    username: userToUpdate.username,
                    role: userToUpdate.role,
                };

                const userRes = await fetch(`https://localhost:8080/api/users/${userToUpdate.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Cache-Control": "no-store",
                    },
                    body: JSON.stringify(updatedUser),
                    credentials: 'include',
                });

                if (!userRes.ok) {
                    throw new Error('Failed to update user');
                }
            }

            const updatedEmployeeData = {
                ...employee,
                startDate: new Date(employee.startDate).toISOString(),
            };

            const res = await fetch(`https://localhost:8080/api/employees/${employee.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Cache-Control": "no-store",
                },
                body: JSON.stringify(updatedEmployeeData),
                credentials: 'include',
            });

            if (res.ok) {
                const updatedEmployee = await res.json();
                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
                );
                setEditingEmployeeId(null);
            } else {
                throw new Error('Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error updating employee, please try again');
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        if (!session?.accessToken) return;

        try {
            const res = await fetch(`https://localhost:8080/api/employees/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
            });

            if (res.ok) {
                setEmployees(employees.filter(emp => emp.id !== id));
            } else {
                throw new Error('Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleEditClick = (id: number) => {
        setEditingEmployeeId(editingEmployeeId === id ? null : id);
    };

    const handleDeleteClick = (id: number) => {
        handleDeleteEmployee(id);
    };

    const handleBackClick = () => {
        router.push('/admin');
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
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={newEmployee.firstName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={newEmployee.lastName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={newEmployee.phoneNumber}
                                onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Position</label>
                            <input
                                type="text"
                                placeholder="Position"
                                value={newEmployee.position}
                                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={newEmployee.startDate}
                                onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
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
                            <label className="block text-sm font-medium text-gray-700">Salary</label>
                            <input
                                type="number"
                                placeholder="Salary"
                                value={newEmployee.salary}
                                onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                placeholder="Username"
                                value={newEmployee.username}
                                onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={newEmployee.password}
                                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={newEmployee.role}
                                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                            >
                                <option value="Employee">Employee</option>
                                <option value="Manager">Manager</option>
                                <option value="ProjectManager">ProjectManager</option>
                                <option value="Office">Office</option>
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
                                    <td className="py-2 px-4 border-b">{employee.position}</td>
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
                                                <label>First Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={employee.firstName}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, firstName: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={employee.lastName}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, lastName: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={employee.email}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, email: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    value={employee.phoneNumber}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, phoneNumber: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Position</label>
                                                <input
                                                    type="text"
                                                    placeholder="Position"
                                                    value={employee.position}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, position: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    placeholder="Start Date"
                                                    value={employee.startDate}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, startDate: e.target.value } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
                                                <label>Status</label>
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
                                                <label>Salary</label>
                                                <input
                                                    type="number"
                                                    placeholder="Salary"
                                                    value={employee.salary}
                                                    onChange={(e) => setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, salary: parseFloat(e.target.value) } : emp))}
                                                    className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                                                />
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
