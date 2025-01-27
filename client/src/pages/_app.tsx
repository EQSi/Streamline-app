// filepath: /Users/jtwellspring/repos/Streamline-app/client/src/pages/_app.tsx
"use client";

import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;