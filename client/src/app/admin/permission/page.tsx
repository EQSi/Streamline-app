'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useAbility } from '@/src/context/abilityContext'; // Adjust the import path as needed

interface Permission {
    id: string;
    name: string;
}

interface PermissionOnGroup {
    id: string;
    permissionId: string;
    permission: Permission;
}

interface PermissionGroup {
    id: string;
    name: string;
    permissions: PermissionOnGroup[];
}

interface Role {
    id: string;
    name: string;
    permissionGroup: PermissionGroup | null;
}

const formatRoleName = (name: string) => {
    return name
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function PermissionManagementPage() {
    const { data: session } = useSession();
    const ability = useAbility();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userRole, setUserRole] = useState<string>(''); // Store current user's role name

    useEffect(() => {
        const fetchRolesAndPermissions = async () => {
            if (!session || !session.user || !session.accessToken) return;
            const userId = (session.user as any).id;
    
                try {
                    const userResponse = await axios.get(`https://localhost:8080/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                // Assume userResponse.data.role is an object with a name field.
                const fetchedUserRole = userResponse.data.role;
                setUserRole(fetchedUserRole.name);

                const [rolesRes, permissionsRes] = await Promise.all([
                    axios.get('https://localhost:8080/api/roles', {
                        headers: { "Authorization": `Bearer ${session.accessToken}` }
                    }),
                    axios.get('https://localhost:8080/api/permissions', {
                        headers: { "Authorization": `Bearer ${session.accessToken}` }
                    })
                ]);

                const rolesData = await Promise.all(rolesRes.data.map(async (role: Role) => {
                    try {
                        const permissionGroupRes = await axios.get(`https://localhost:8080/api/roles/${role.id}/permission-group`, {
                            headers: { "Authorization": `Bearer ${session.accessToken}` }
                        });
                        return { ...role, permissionGroup: { ...permissionGroupRes.data, name: permissionGroupRes.data.name || '' } };
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status === 404) {
                            console.warn(`Permission group not found for role ${role.id}`);
                            return { ...role, permissionGroup: null };
                        } else {
                            console.error(`Error fetching permission group for role ${role.id}:`, error);
                            return { ...role, permissionGroup: null };
                        }
                    }
                }));

                setRoles(rolesData);
                setPermissions(permissionsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchRolesAndPermissions();
    }, [session]);

    const handleRoleChange = (roleId: string) => {
        setSelectedRole(roles.find(r => r.id === roleId) || null);
    };

    const handlePermissionToggle = async (permissionId: string) => {
        if (!session || !selectedRole || !selectedRole.permissionGroup) return;
        
        const hasPermission = selectedRole.permissionGroup.permissions.some(p => p.permissionId === permissionId);
        const updatedPermissions = hasPermission
            ? selectedRole.permissionGroup.permissions.filter(p => p.permissionId !== permissionId)
            : [
                  ...selectedRole.permissionGroup.permissions,
                  { id: permissionId, permissionId, permission: permissions.find(p => p.id === permissionId)! }
              ];
        
        try {
            await axios.post(`https://localhost:8080/api/permission-groups/${selectedRole.permissionGroup.id}/permissions`, {
                permissionIds: updatedPermissions.map(p => p.permissionId),
            }, {
                headers: { "Authorization": `Bearer ${session.accessToken}` }
            });
            
            setRoles(roles.map(role =>
                role.id === selectedRole.id
                    ? {
                          ...role,
                          permissionGroup: role.permissionGroup
                              ? {
                                    id: role.permissionGroup.id,
                                    name: role.permissionGroup.name || '',
                                    permissions: updatedPermissions
                                }
                              : null
                      }
                    : role
            ));
            setSelectedRole(prev => prev
                ? { 
                      ...prev, 
                      permissionGroup: prev.permissionGroup
                          ? {
                                id: prev.permissionGroup.id,
                                name: prev.permissionGroup.name || '',
                                permissions: updatedPermissions
                            }
                          : null
                  }
                : null
            );
        } catch (error) {
            console.error('Error updating permissions:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    // Use the userRole from fetched data along with ability checks to determine access.
    const canAccessPage = ability.can('manage', 'Role') || userRole === 'ADMIN';

    if (!canAccessPage) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                You do not have access to this page.
            </div>
        );
    }

    // Debug logging
    console.log('Current ability:', ability);
    console.log('Can manage role:', ability.can('manage', 'Role'));
    console.log('Selected role:', selectedRole);

    return (
        <div className="flex flex-col items-start min-h-screen bg-gray-50 py-4 px-4">
            <h1 className="text-2xl font-bold mb-2">Permission Management</h1>
            <div className="flex w-full">
                {/* Role Selection */}
                <div className="w-1/3 pr-2">
                    <h2 className="text-lg font-semibold mb-2">Roles</h2>
                    <ul className="bg-white rounded-lg shadow-md p-2 divide-y">
                        {roles.map(role => (
                            <li
                                key={role.id}
                                className={`p-2 cursor-pointer ${selectedRole?.id === role.id ? 'bg-indigo-100' : ''}`}
                                onClick={() => handleRoleChange(role.id)}
                            >
                                {formatRoleName(role.name)}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Permissions */}
                <div className="w-2/3 pl-4">
                    {selectedRole && selectedRole.permissionGroup && (
                        <>
                            <h2 className="text-lg font-semibold mb-2">
                                Permissions for {formatRoleName(selectedRole.name)}
                            </h2>
                            <div className="grid grid-cols-2 gap-2 bg-white rounded-lg shadow-md p-4">
                                {permissions.map(permission => (
                                    <div key={permission.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRole?.permissionGroup?.permissions.some(p => p.permissionId === permission.id) ?? false}
                                            onChange={() => handlePermissionToggle(permission.id)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-900">{permission.name}</label>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
