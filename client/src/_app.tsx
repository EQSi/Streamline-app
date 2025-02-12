import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { Session } from "next-auth";
import { AbilityProvider } from "@/context/abilityContext";

interface MyAppProps extends AppProps {
  pageProps: {
    session?: Session;
  };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AbilityProvider>
        <Component {...pageProps} />
      </AbilityProvider>
    </SessionProvider>
  );
}

export default MyApp;
