import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { Session } from "next-auth";

interface MyAppProps extends AppProps {
  pageProps: {
    session?: Session;
  };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
