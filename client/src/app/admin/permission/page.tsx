'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/src/state/axios';
import { useAbility } from '@/src/context/abilityContext';

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
    const [userRole, setUserRole] = useState<string>(''); 
    const [newRoleName, setNewRoleName] = useState<string>(''); 
    const [showNewRoleForm, setShowNewRoleForm] = useState<boolean>(false);

    useEffect(() => {
        const fetchRolesAndPermissions = async () => {
            if (!session || !session.user || !session.accessToken) return;
            const userId = (session.user as any).id;
    
            try {
                const userResponse = await axiosInstance.get(`/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                const fetchedUserRole = userResponse.data.role;
                setUserRole(fetchedUserRole.name);

                const [rolesRes, permissionsRes] = await Promise.all([
                    axiosInstance.get('/roles', {
                        headers: { "Authorization": `Bearer ${session.accessToken}` }
                    }),
                    axiosInstance.get('/permissions', {
                        headers: { "Authorization": `Bearer ${session.accessToken}` }
                    })
                ]);

                const rolesData = await Promise.all(rolesRes.data.map(async (role: Role) => {
                    const permissionGroupRes = await axiosInstance.get(`/roles/${role.id}/permission-group`, {
                        headers: { "Authorization": `Bearer ${session.accessToken}` }
                    });
                    return { ...role, permissionGroup: { ...permissionGroupRes.data, permissions: permissionGroupRes.data.permissions || [], name: permissionGroupRes.data.name || '' } };
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
            if (hasPermission) {
                await axiosInstance.delete(`/permission-groups/${selectedRole.permissionGroup.id}/permissions/${permissionId}`, {
                    headers: { "Authorization": `Bearer ${session.accessToken}` }
                });
            } else {
                await axiosInstance.post(`/permission-groups/${selectedRole.permissionGroup.id}/permissions`, {
                    permissionIds: updatedPermissions.map(p => p.permissionId),
                }, {
                    headers: { "Authorization": `Bearer ${session.accessToken}` }
                });
            }
            
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

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !session.accessToken || !newRoleName.trim()) return;

        try {
            const roleRes = await axiosInstance.post(
                '/roles',
                { name: newRoleName.trim() },
                { headers: { Authorization: `Bearer ${session.accessToken}` } }
            );
            const createdRole: Role = roleRes.data;

            const pgRes = await axiosInstance.post(
                `/roles/${createdRole.id}/permission-group`,
                {},
                { headers: { Authorization: `Bearer ${session.accessToken}` } }
            );
            const permissionGroup = { ...pgRes.data, permissions: [] };

            const newRole: Role = {
                ...createdRole,
                permissionGroup,
            };

            setRoles((prev) => [...prev, newRole]);
            setNewRoleName('');
            setShowNewRoleForm(false);
        } catch (error) {
            console.error('Error creating new role:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    //const canAccessPage = ability.can('manage', 'Role') || userRole === 'ADMIN';
    //if (!canAccessPage) {
        //return (
            //<div className="flex justify-center items-center min-h-screen">
                //You do not have access to this page.
            //</div>
        //);
    //}

    return (
        <div className="flex flex-col items-start min-h-screen bg-gray-50 py-4 px-4">
            <h1 className="text-2xl font-bold mb-2">Permission Management</h1>
            {/* Add New Role Button */}
            <div className="w-full mb-4">
                <button
                    onClick={() => setShowNewRoleForm(prev => !prev)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                    {showNewRoleForm ? 'Cancel' : 'Add New Role'}
                </button>
                {showNewRoleForm && (
                    <div className="mt-4 bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
                        <form onSubmit={handleCreateRole} className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <input
                                type="text"
                                placeholder="Enter role name"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition duration-200">
                                Create Role
                            </button>
                        </form>
                    </div>
                )}
            </div>
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
