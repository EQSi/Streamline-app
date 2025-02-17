'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Role {
    id: string;
    name: string;
}
interface Permission {
    id: string;
    name: string;
}
interface PermissionGroup {
    id: string;
    name: string;
    permissions: Permission[];
}

export default function PermissionPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allGroups, setAllGroups] = useState<PermissionGroup[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [assignedGroups, setAssignedGroups] = useState<PermissionGroup[]>([]);

    const token = session?.accessToken;

    useEffect(() => {
        if (!token) return;
        loadRoles();
        loadPermissionGroups();
    }, [token]);

    async function loadRoles() {
        try {
            const res = await fetch('https://localhost:8080/api/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            setRoles(await res.json());
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch roles', variant: 'destructive' });
        }
    }

    async function loadPermissionGroups() {
        try {
            const res = await fetch('https://localhost:8080/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            setAllGroups(await res.json());
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch permission groups', variant: 'destructive' });
        }
    }

    async function loadRolePermissions(roleId: string) {
        try {
            const res = await fetch(`https://localhost:8080/api/roles/${roleId}/permissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            setAssignedGroups(await res.json());
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch role permissions', variant: 'destructive' });
        }
    }

    function togglePermission(groupId: string, permission: Permission) {
        setAssignedGroups((prev) => {
            const group = prev.find((g) => g.id === groupId);
            if (!group) {
                const fullGroup = allGroups.find((g) => g.id === groupId);
                if (!fullGroup) return prev;
                return [...prev, { ...fullGroup, permissions: [permission] }];
            }
            const hasPermission = group.permissions.some((p) => p.id === permission.id);
            const updatedPermissions = hasPermission
                ? group.permissions.filter((p) => p.id !== permission.id)
                : [...group.permissions, permission];
            if (!updatedPermissions.length) {
                return prev.filter((g) => g.id !== groupId);
            }
            return prev.map((g) =>
                g.id === groupId ? { ...g, permissions: updatedPermissions } : g
            );
        });
    }

    async function saveRolePermissions() {
        if (!selectedRole) return;
        try {
            const res = await fetch(`https://localhost:8080/api/roles/${selectedRole.id}/permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ permissionGroups: assignedGroups })
            });
            if (!res.ok) throw new Error();
            toast({ title: 'Success', description: 'Permissions saved', variant: 'default' });
        } catch {
            toast({ title: 'Error', description: 'Failed to save permissions', variant: 'destructive' });
        }
    }

    return (
        <div className="flex gap-4">
            <Card className="w-1/4">
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <ScrollArea className="max-h-[70vh]">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={cn(
                                "cursor-pointer p-2 rounded text-sm",
                                selectedRole?.id === role.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                            onClick={() => {
                                setSelectedRole(role);
                                loadRolePermissions(role.id);
                            }}
                        >
                            {role.name}
                        </div>
                    ))}
                </ScrollArea>
            </Card>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        {selectedRole
                            ? `Permissions for ${selectedRole.name}`
                            : "Select a role to view permissions"}
                    </CardTitle>
                </CardHeader>
                {selectedRole && (
                    <CardContent>
                        <Accordion type="multiple">
                            {allGroups.map((group) => {
                                const isAssigned = assignedGroups.find((g) => g.id === group.id);
                                return (
                                    <AccordionItem key={group.id} value={group.id}>
                                        <AccordionTrigger className="font-semibold">
                                            {group.name}
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-2 mt-2">
                                            {group.permissions.map((perm) => {
                                                const assigned = isAssigned?.permissions.some((p) => p.id === perm.id);
                                                return (
                                                    <div key={perm.id} className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={!!assigned}
                                                            onCheckedChange={() => togglePermission(group.id, perm)}
                                                        />
                                                        <span>{perm.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                        <Button className="mt-4" onClick={saveRolePermissions}>
                            Save Permissions
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
