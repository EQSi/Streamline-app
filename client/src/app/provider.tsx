"use client"; // ✅ Ensure it runs on the client

import { SessionProvider } from "next-auth/react";
import StoreProvider from "./redux";
import { AbilityProvider } from "@/src/context/abilityContext";

export function Providers({ children, session }: { children: React.ReactNode; session?: any }) {
  return (
    <SessionProvider session={session}> {/* ✅ Explicitly pass session */}
      <AbilityProvider>
        <StoreProvider>{children}</StoreProvider>
      </AbilityProvider>
    </SessionProvider>
  );
}
