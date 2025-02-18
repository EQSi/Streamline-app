'use client'; // ✅ This ensures it runs on the client

import { SessionProvider } from "next-auth/react";
import StoreProvider from "./redux";
import { AbilityProvider } from "@/src/context/abilityContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AbilityProvider>
        <StoreProvider>{children}</StoreProvider>
      </AbilityProvider>
    </SessionProvider>
  );
}
