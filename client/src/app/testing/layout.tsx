'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test health endpoint
        const healthRes = await fetch('https://localhost:8080/api/health');
        const healthData = await healthRes.json();
        console.log("Health Data:", healthData); // Log health data for debugging
        setHealthStatus(JSON.stringify(healthData, null, 2));

        // Test auth endpoint
        const authRes = await fetch('https://localhost:8080/api/test/auth', {
          credentials: 'include',
        });
        const authData = await authRes.json();
        console.log("Auth Data:", authData); // Log auth data for debugging
        setAuthStatus(JSON.stringify(authData, null, 2));
      } catch (err) {
        setHealthStatus(`Error: ${err.message}`);
        setAuthStatus(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <h2 className="text-xl mb-4">Health Check</h2>
          <pre className="bg-gray-100 p-2 mb-4 rounded" style={{ color: 'black' }}>
            {healthStatus}
          </pre>
          <h2 className="text-xl mb-4">Auth Check</h2>
          <pre className="bg-gray-100 p-2 rounded" style={{ color: 'black' }}>
            {authStatus}
          </pre>
        </>
      )}
    </div>
  );
}
