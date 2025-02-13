'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, RootState } from '@/src/app/redux';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface Role {
    id: string;
    name: string;
}
interface PermissionGroup {
    id: string;
    name: string;
    permissions: Permission[];
}

interface Permission {
    id: string;
    name: string;
}

interface User {
    id: string;
    username: string;
    roleId: string;
}

export default function PermissionPage() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedPermissionGroups, setSelectedPermissionGroups] = useState<PermissionGroup[]>([]);
    const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);
    const { data: session } = useSession();

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
        fetchUsers();
    }, [session]);

    const fetchRoles = async () => {
        try {
            const response = await fetch('https://localhost:8080/api/roles', {
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await fetch('https://localhost:8080/api/permissions', {
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            const data = await response.json();
            setPermissions(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch permissions", variant: "destructive" });
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://localhost:8080/api/users', {
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
        }
    };

    const fetchRolePermissionGroups = async (roleId: string) => {
        try {
            const response = await fetch(`https://localhost:8080/api/roles/${roleId}/permissions`, {
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            const data = await response.json();
            setSelectedPermissionGroups(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch permissions", variant: "destructive" });
        }
    };

    const handleRoleSelection = (role: Role) => {
        setSelectedRole(role);
        fetchRolePermissionGroups(role.id);
    };

    const handlePermissionToggle = (permissionId: string) => {
        if (!selectedRole) return;

        const updatedPermissionGroups = selectedPermissionGroups.map(pg => {
            const hasPermission = pg.permissions.some(p => p.id === permissionId);
            if (hasPermission) {
                return {
                    ...pg,
                    permissions: pg.permissions.filter(p => p.id !== permissionId)
                };
            } else {
                return {
                    ...pg,
                    permissions: [...pg.permissions, permissions.find(p => p.id === permissionId)!]
                };
            }
        });

        setSelectedPermissionGroups(updatedPermissionGroups);
        savePermissions(selectedRole.id, updatedPermissionGroups);
    };

    const savePermissions = async (roleId: string, permissionGroups: PermissionGroup[]) => {
        try {
            await fetch(`https://localhost:8080/api/roles/${roleId}/permissions`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ permissionGroups })
            });
            toast({ title: "Success", description: "Permissions updated successfully", variant: "success" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
        }
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-100 dark:bg-gray-900 p-4">
                <h2 className="text-xl font-semibold mb-4">Roles</h2>
                <ul className="space-y-2">
                    {roles.map((role) => (
                        <li
                            key={role.id}
                            className={`p-2 rounded cursor-pointer ${selectedRole?.id === role.id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800'}`}
                            onClick={() => handleRoleSelection(role)}
                        >
                            {role.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-4">
                {selectedRole ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Permissions for {selectedRole.name}</h2>
                        <h3 className="text-lg font-semibold">Assigned Permission Groups</h3>
                        <ul className="space-y-2 mb-4">
                            {selectedPermissionGroups.map(pg => (
                                <li key={pg.id} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">
                                    {pg.name}
                                </li>
                            ))}
                        </ul>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Assigned</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell>{permission.name}</TableCell>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissionGroups.some(pg => pg.permissions.some(p => p.id === permission.id))}
                                                onChange={() => handlePermissionToggle(permission.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Select a role to view permissions</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
