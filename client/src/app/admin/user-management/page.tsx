/* 
*The purpose of this file is to provide the user management page for the admin. Specfically to controll the employees and their information.
*This page will allow the admin to add, edit, and delete employees. The admin can also view the employees and their information.

*Created By: JT Wellspring 
*Created On: 01/24/2025

*Last Updated By: JT Wellspring
*Updated On: 01/27/2025
*/

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

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
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
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
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('https://localhost:8080/api/employees', {
                    credentials: 'include'
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
                    credentials: 'include'
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
    }, []);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newUser = {
                username: newEmployee.username,
                password: newEmployee.password,
                role: newEmployee.role
            };

            const userRes = await fetch('https://localhost:8080/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
                credentials: 'include'
            });

            if (userRes.ok) {
                const createdUser = await userRes.json();
                const employeeToAdd = { ...newEmployee, userId: createdUser.id };

                const res = await fetch('https://localhost:8080/api/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(employeeToAdd),
                    credentials: 'include'
                });

                if (res.ok) {
                    const addedEmployee = await res.json();
                    setEmployees([...employees, addedEmployee]);
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
                        salary: 0
                    });
                } else {
                    throw new Error('Failed to add employee');
                }
            } else {
                throw new Error('Failed to create user');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const handleEditEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        try {
            const res = await fetch(`https://localhost:8080/api/employees/${editingEmployee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingEmployee),
                credentials: 'include'
            });

            if (res.ok) {
                const updatedEmployee = await res.json();
                setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
                setEditingEmployee(null);
            } else {
                throw new Error('Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        try {
            const res = await fetch(`https://localhost:8080/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Inactive' }),
                credentials: 'include'
            });

            if (res.ok) {
                setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: 'Inactive' } : emp));
            } else {
                throw new Error('Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleEditClick = (id: number) => {
        const employee = employees.find(emp => emp.id === id);
        if (employee) {
            setEditingEmployee(employee);
        }
    };

    const handleDeleteClick = (id: number) => {
        handleDeleteEmployee(id);
    };

    const handleBackClick = () => {
        router.push('/admin');
    };

    return (
        <div className="flex flex-col items-left min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                <button
                    onClick={handleBackClick}
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                >
                    Back to Admin
                </button>
            </div>
            <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Active Employees</h2>
                <table className="min-w-full bg-white dark:bg-gray-800" id="employeeList">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-gray-900 dark:text-gray-100">Name</th>
                            <th className="py-2 px-4 border-b text-left text-gray-900 dark:text-gray-100">Email</th>
                            <th className="py-2 px-4 border-b text-left text-gray-900 dark:text-gray-100">Position</th>
                            <th className="py-2 px-4 border-b text-right text-gray-900 dark:text-gray-100">Salary</th>
                            <th className="py-2 px-4 border-b text-left text-gray-900 dark:text-gray-100">User</th>
                            <th className="py-2 px-4 border-b text-left text-gray-900 dark:text-gray-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.filter(emp => emp.status === 'Active').map((employee) => (
                            <tr key={employee.id}>
                                <td className="py-2 px-4 border-b text-gray-900 dark:text-gray-100">{employee.firstName} {employee.lastName}</td>
                                <td className="py-2 px-4 border-b text-gray-900 dark:text-gray-100">{employee.email}</td>
                                <td className="py-2 px-4 border-b text-gray-900 dark:text-gray-100">{employee.position}</td>
                                <td className="py-2 px-4 border-b text-right text-gray-900 dark:text-gray-100">${employee.salary}</td>
                                <td className="py-2 px-4 border-b text-gray-900 dark:text-gray-100">{users.find(user => user.id === employee.userId)?.username}</td>
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
                        ))}
                    </tbody>
                </table>
                <h2 className="text-xl font-semibold mb-2 py-4 text-gray-900 dark:text-gray-100">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                <form
                    onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
                    className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full space-y-4"
                >
                    <label className="block text-gray-900 dark:text-gray-100">First Name</label>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={editingEmployee ? editingEmployee.firstName : newEmployee.firstName}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                                : setNewEmployee({ ...newEmployee, firstName: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Last Name</label>
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={editingEmployee ? editingEmployee.lastName : newEmployee.lastName}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                                : setNewEmployee({ ...newEmployee, lastName: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={editingEmployee ? editingEmployee.email : newEmployee.email}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, email: e.target.value })
                                : setNewEmployee({ ...newEmployee, email: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={editingEmployee ? editingEmployee.phoneNumber : newEmployee.phoneNumber}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, phoneNumber: e.target.value })
                                : setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Position</label>
                    <input
                        type="text"
                        placeholder="Position"
                        value={editingEmployee ? editingEmployee.position : newEmployee.position}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, position: e.target.value })
                                : setNewEmployee({ ...newEmployee, position: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Start Date</label>
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={editingEmployee ? editingEmployee.startDate : newEmployee.startDate}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, startDate: e.target.value })
                                : setNewEmployee({ ...newEmployee, startDate: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Status</label>
                    <select
                        value={editingEmployee ? editingEmployee.status : newEmployee.status}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, status: e.target.value })
                                : setNewEmployee({ ...newEmployee, status: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="Active">Active</option>
                        <option value="OnLeave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                    <label className="block text-gray-900 dark:text-gray-100">Salary</label>
                    <input
                        type="number"
                        placeholder="Salary"
                        value={editingEmployee ? editingEmployee.salary : newEmployee.salary}
                        onChange={(e) =>
                            editingEmployee
                                ? setEditingEmployee({ ...editingEmployee, salary: parseFloat(e.target.value) })
                                : setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })
                        }
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={newEmployee.username}
                        onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    />
                    <label className="block text-gray-900 dark:text-gray-100">Role</label>
                    <select
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="border border-gray-300 dark:border-gray-700 rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                    >
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin</option>
                        <option value="ExternalUser">External User</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                    >
                        {editingEmployee ? 'Update Employee' : 'Add Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
}
