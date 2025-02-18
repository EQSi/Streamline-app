"use client";

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession() as { data: { user: SessionUser } | null; status: string };
  const router = useRouter();

  // Redirect if not authenticated, but keep it separate from hooks.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Early return for loading state
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const userId = session?.user?.id;

  // Initialize the layouts state once and avoid conditional useState
  const [layouts, setLayouts] = useState(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = localStorage.getItem(`dashboardLayouts-${userId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {}; // default empty layout
  });

  // Handle saving layouts to localStorage on changes
  useEffect(() => {
    if (userId && Object.keys(layouts).length > 0) {
      localStorage.setItem(`dashboardLayouts-${userId}`, JSON.stringify(layouts));
    }
  }, [layouts, userId]);

  const cards = [
    { i: 'jobs', name: 'Jobs', content: 'Job Numbers with list by stage\nPerformance- still finding out how to measure' },
    { i: 'task', name: 'Task', content: 'Personal tasks, job tasks, and personal receipts/pictures' },
    { i: 'schedule', name: 'Schedule', content: 'Content for card 3 goes here.' },
    { i: 'card4', name: 'Card 4', content: 'Content for card 4 goes here.' },
    { i: 'card5', name: 'Card 5', content: 'Content for card 5 goes here.' },
    { i: 'card6', name: 'Card 6', content: 'Content for card 6 goes here.' },
    { i: 'card7', name: 'Card 7', content: 'Content for card 7 goes here.' },
  ];

  const defaultLayouts = {
    lg: cards.map((card, i) => ({
      i: card.i,
      x: (i % 3) * 6,
      y: Math.floor(i / 3) * 6,
      w: 12,
      h: 12,
      minW: 12,
      minH: 12
    }))
  };

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="mx-auto w-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts || defaultLayouts}
          breakpoints={{ lg: 2000, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 20, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
        >
          {cards.map((card) => (
            <div key={card.i} className="bg-white rounded-lg shadow-md">
              <div className="p-2">
                <h2 className="text-xl font-semibold mb-2">{card.name}</h2>
                <p className="text-gray-700 whitespace-pre-line">{card.content}</p>
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardPage;
