'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { Ability, AbilityBuilder } from "@casl/ability";
import { useSession } from "next-auth/react";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "Job" | "Quote" | "Invoice" | "User" | "Role" | "AppSettings" | "all";

export type AppAbility = Ability<[Actions, Subjects]>;

const createDefaultAbility = () => {
  const { can, build } = new AbilityBuilder<AppAbility>(Ability);
  return build();
};

const AbilityContext = createContext<AppAbility | null>(null);

export const AbilityProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [ability, setAbility] = useState<AppAbility>(createDefaultAbility());

  useEffect(() => {
    if (session?.user) {
      const userWithPermissions = session.user as {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: string;
        permissions: string[];
      };
      
      const { can, build } = new AbilityBuilder<AppAbility>(Ability);

      userWithPermissions.permissions.forEach(permission => {
        switch (permission) {
          case "view_jobs":
            can("read", "Job");
            break;
          case "create_jobs":
            can("create", "Job");
            break;
          case "edit_jobs":
            can("update", "Job");
            break;
          case "delete_jobs":
            can("delete", "Job");
            break;
          case "schedule_jobs":
            can("manage", "Job");
            break;
          case "view_quotes":
            can("read", "Quote");
            break;
          case "create_quotes":
            can("create", "Quote");
            break;
          case "edit_quotes":
            can("update", "Quote");
            break;
          case "delete_quotes":
            can("delete", "Quote");
            break;
          case "upload_invoices":
            can("create", "Invoice");
            break;
          case "view_invoices":
            can("read", "Invoice");
            break;
          case "delete_invoices":
            can("delete", "Invoice");
            break;
          case "manage_application_settings":
            can("manage", "AppSettings");
            break;
          case "manage_users":
            can("manage", "User");
            break;
          case "view_dashboard":
            can("read", "all");
            break;
          case "manage_permissions":
            can("manage", "Role");
            break;
          default:
            break;
        }
      });

      setAbility(build());
    }
  }, [session]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

export const useAbility = () => {
  const context = useContext(AbilityContext);
  if (!context) throw new Error("useAbility must be used within an AbilityProvider");
  return context;
};