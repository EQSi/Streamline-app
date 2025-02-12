import { createContext, useContext, useEffect, useState } from "react";
import { Ability, AbilityBuilder } from "@casl/ability";
import { useSession } from "next-auth/react";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "Job" | "Quote" | "Invoice" | "User" | "Role" | "AppSettings" | "all";

export type AppAbility = Ability<[Actions, Subjects]>;

const AbilityContext = createContext<AppAbility | null>(null);

export const defineAbilityFor = (role: string, permissions: string[]) => {
  const { can, cannot, build } = new AbilityBuilder<Ability<[Actions, Subjects]>>(Ability);

  if (permissions.includes("manage_jobs")) can("manage", "Job");
  if (permissions.includes("view_jobs")) can("read", "Job");
  if (permissions.includes("schedule_jobs")) can("update", "Job");
  if (permissions.includes("create_quotes")) can("create", "Quote");
  if (permissions.includes("edit_quotes")) can("update", "Quote");
  if (permissions.includes("approve_quotes")) can("update", "Quote");
  if (permissions.includes("upload_invoices")) can("create", "Invoice");
  if (permissions.includes("view_invoices")) can("read", "Invoice");
  if (permissions.includes("manage_users")) can("manage", "User");
  if (permissions.includes("manage_roles_permissions")) can("manage", "Role");
  if (permissions.includes("manage_app_settings")) can("manage", "AppSettings");
  if (permissions.includes("full_admin_access")) can("manage", "all");

  return build();
};

export const AbilityProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [ability, setAbility] = useState<AppAbility>(new Ability());

  useEffect(() => {
    if (session?.user) {
      const userWithPermissions = session.user as {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: string;
        permissions: string[];
      };
      const updatedAbility = defineAbilityFor(
        userWithPermissions.role,
        userWithPermissions.permissions || []
      );
      setAbility(updatedAbility);
    }
  }, [session]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
};

export const useAbility = () => {
  const context = useContext(AbilityContext);
  if (!context) throw new Error("useAbility must be used within an AbilityProvider");
  return context;
};
