'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

type PermissionGroup = { id: string; name: string };
type Role = { id: string; name: string; permissionGroupId: string };
type Permission = { id: string; name: string };
type User = { id: string; name: string; email: string; permissionGroupId?: string };

export default function PermissionPage() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    // Sidebar navigation state
    const [sidebarSelection, setSidebarSelection] = useState<'roles' | 'permissionGroups' | 'users'>('roles');

    // State for permission groups
    const [groups, setGroups] = useState<PermissionGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState('');

    // State for roles
    const [roles, setRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [roleGroupId, setRoleGroupId] = useState('');
    
    // State for permissions
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [newPermissionName, setNewPermissionName] = useState('');

    // State for users and assignment
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedGroupForUser, setSelectedGroupForUser] = useState('');

    // Helper function to get axios config with authentication headers.
    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get('https://localhost:8080/api/permission-groups', getAuthConfig());
            setGroups(data);
        } catch (error) {
            console.error('Error fetching permission groups', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await axios.get('https://localhost:8080/api/roles', getAuthConfig());
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    const fetchPermissions = async () => {
        try {
            const { data } = await axios.get('https://localhost:8080/api/permissions', getAuthConfig());
            setPermissions(data);
        } catch (error) {
            console.error('Error fetching permissions', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('https://localhost:8080/api/users', getAuthConfig());
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchGroups();
            fetchRoles();
            fetchPermissions();
            fetchUsers();
        }
    }, [accessToken]);

    // Handler to create a new permission group
    const handleCreateGroup = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: createdGroup } = await axios.post(
                'https://localhost:8080/api/permission-groups',
                { name: newGroupName },
                getAuthConfig()
            );
            setGroups([...groups, createdGroup]);
            setNewGroupName('');
        } catch (error) {
            console.error('Error creating permission group', error);
        }
    };

    // Handler to create a new role
    const handleCreateRole = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: createdRole } = await axios.post(
                'https://localhost:8080/api/roles',
                { name: newRoleName, permissionGroupId: roleGroupId },
                getAuthConfig()
            );
            setRoles([...roles, createdRole]);
            setNewRoleName('');
            setRoleGroupId('');
        } catch (error) {
            console.error('Error creating role', error);
        }
    };

    // Handler to create a new permission
    const handleCreatePermission = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: createdPermission } = await axios.post(
                'https://localhost:8080/api/permissions',
                { name: newPermissionName },
                getAuthConfig()
            );
            setPermissions([...permissions, createdPermission]);
            setNewPermissionName('');
        } catch (error) {
            console.error('Error creating permission', error);
        }
    };

    // Handler to assign a user to a permission group
    const handleAssignUser = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: updatedUser } = await axios.post(
                'https://localhost:8080/api/assign-user',
                { userId: selectedUserId, permissionGroupId: selectedGroupForUser },
                getAuthConfig()
            );
            setUsers(users.map((user) => user.id === updatedUser.id ? updatedUser : user));
            setSelectedUserId('');
            setSelectedGroupForUser('');
        } catch (error) {
            console.error('Error assigning user to permission group', error);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300">
                <h2 className="text-xl font-bold mb-4">Admin Navigation</h2>
                <ul>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded mb-2 ${sidebarSelection === 'roles' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200'}`}
                            onClick={() => setSidebarSelection('roles')}
                        >
                            Roles Management
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded mb-2 ${sidebarSelection === 'permissionGroups' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200'}`}
                            onClick={() => setSidebarSelection('permissionGroups')}
                        >
                            Permission Groups
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded mb-2 ${sidebarSelection === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200'}`}
                            onClick={() => setSidebarSelection('users')}
                        >
                            Users Management
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8">
                {/* Roles Management */}
                {sidebarSelection === 'roles' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Roles Management</h2>
                        <form onSubmit={handleCreateRole} className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
                            <input
                                type="text"
                                placeholder="Role Name"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="border border-gray-300 rounded p-2 flex-1 mb-2 sm:mb-0"
                                required
                            />
                            <select
                                value={roleGroupId}
                                onChange={(e) => setRoleGroupId(e.target.value)}
                                className="border border-gray-300 rounded p-2 mb-2 sm:mb-0"
                                required
                            >
                                <option value="">Select Permission Group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                                Add Role
                            </button>
                        </form>
                        <ul className="list-disc ml-5">
                            {roles.map((role) => (
                                <li key={role.id} className="py-1">
                                    {role.name} – Group: {groups.find((g) => g.id === role.permissionGroupId)?.name || 'None'}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Permission Groups Management */}
                {sidebarSelection === 'permissionGroups' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Permission Groups</h2>
                        <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
                            <input
                                type="text"
                                placeholder="Group Name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="border border-gray-300 rounded p-2 flex-1 mb-2 sm:mb-0"
                                required
                            />
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                                Create Group
                            </button>
                        </form>
                        <ul className="list-disc ml-5">
                            {groups.map((group) => (
                                <li key={group.id} className="py-1">
                                    {group.name}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Users Management */}
                {sidebarSelection === 'users' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Users Management</h2>
                        <form onSubmit={handleAssignUser} className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="border border-gray-300 rounded p-2 mb-2 sm:mb-0"
                                required
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedGroupForUser}
                                onChange={(e) => setSelectedGroupForUser(e.target.value)}
                                className="border border-gray-300 rounded p-2 mb-2 sm:mb-0"
                                required
                            >
                                <option value="">Select Permission Group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                                Assign Group
                            </button>
                        </form>
                        <h3 className="text-xl font-semibold mb-2">User Assignments</h3>
                        <ul className="list-disc ml-5">
                            {users.map((user) => (
                                <li key={user.id} className="py-1">
                                    {user.name} – Group: {groups.find((g) => g.id === user.permissionGroupId)?.name || 'None'}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Permissions Table – common for all pages or placed independently */}
                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Permissions Table</h2>
                    <form onSubmit={handleCreatePermission} className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
                        <input
                            type="text"
                            placeholder="Permission Name"
                            value={newPermissionName}
                            onChange={(e) => setNewPermissionName(e.target.value)}
                            className="border border-gray-300 rounded p-2 flex-1 mb-2 sm:mb-0"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                            Add Permission
                        </button>
                    </form>
                    <ul className="list-disc ml-5">
                        {permissions.map((perm) => (
                            <li key={perm.id} className="py-1">
                                {perm.name}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}
