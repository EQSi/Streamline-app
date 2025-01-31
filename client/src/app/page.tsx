'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('https://localhost:3000/login');
  }, [router]);

  return null; // Render nothing while redirecting
}