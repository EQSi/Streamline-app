"use client";

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * @file page.tsx
 * @module DashboardPage
 *
 * @remarks
 * Developer Notes:
 * - The dashboard page component is responsible for rendering the user's dashboard.
 * - The goal of this page is eventual allow user full customization of their dashboard.
 * - Different positions will have different dashboards and based upon their position they will have different priorties
 * - Current page is in Progress and just the start of the stomping ground for the dashboard
 * - Started on 2025-01-12. JTW
 * 
 * @returns {JSX.Element} 
 */

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

  const cards = [
    { i: 'jobs', name: 'Jobs', content: 'Job Numbers with list by stage\nPerformance- still finding out how to measure' },
    { i: 'task', name: 'Task', content: 'Personal tasks, job tasks, and personal receipts/pictures' },
    { i: 'schedule', name: 'Schedule', content: 'Content for card 3 goes here.' },
    { i: 'card4', name: 'Card 4', content: 'Content for card 4 goes here.' },
    { i: 'card5', name: 'Card 5', content: 'Content for card 5 goes here.' },
    { i: 'card6', name: 'Card 6', content: 'Content for card 6 goes here.' },
    { i: 'card7', name: 'Card 7', content: 'Content for card 7 goes here.' },
  ];

  // Define multiple default layout options
  const dashboardOptions = {
    default: {
      lg: cards.map((card, i) => {
        // For an iPad Pro 12 layout on a 12-column grid.
        if (i < 4) {
          return {
            i: card.i,
            x: i * 3,      // positions: 0, 3, 6, 9
            y: 0,
            w: 3,          // each card takes 3 columns (4 cards fill 12 columns)
            h: 4,
            minW: 3,
            minH: 4,
          };
        } else {
          // Second row: 3 cards centered by occupying 4 columns each.
          const positions = [0, 4, 8];
          return {
            i: card.i,
            x: positions[i - 4],
            y: 4,
            w: 4,          // each card takes 4 columns (3 cards fill 12 columns)
            h: 4,
            minW: 4,
            minH: 4,
          };
        }
      }),
    },
    alt1: {
      lg: cards.map((card, i) => {
        // Alternate arrangement: first row 3 cards, second row 4 cards.
        if (i < 3) {
          // First row: 3 cards taking 4 columns each.
          const positions = [0, 4, 8];
          return {
            i: card.i,
            x: positions[i],
            y: 0,
            w: 4,
            h: 4,
            minW: 4,
            minH: 4,
          };
        } else {
          // Second row: 4 cards evenly spaced taking 3 columns each.
          return {
            i: card.i,
            x: (i - 3) * 3, // produces 0, 3, 6, 9 for indices 3-6
            y: 4,
            w: 3,
            h: 4,
            minW: 3,
            minH: 4,
          };
        }
      }),
    },
    alt2: {
      lg: cards.map((card, i) => {
        // Compact arrangement: slightly shorter cards.
        if (i < 4) {
          return {
            i: card.i,
            x: i * 3,     // positions: 0, 3, 6, 9
            y: 0,
            w: 3,
            h: 3,
            minW: 3,
            minH: 3,
          };
        } else {
          // Second row: 3 cards, each taking 4 columns.
          const positions = [0, 4, 8];
          return {
            i: card.i,
            x: positions[i - 4],
            y: 3,
            w: 4,
            h: 3,
            minW: 4,
            minH: 3,
          };
        }
      }),
    },
  };

  // State for current layout selection
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'alt1' | 'alt2'>('default');

  // Initialize the layouts state once and avoid conditional useState
  const [layouts, setLayouts] = useState(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = localStorage.getItem(`dashboardLayouts-${userId}`);
      if (saved) return JSON.parse(saved);
    }
    // if no saved layout, use the default dashboard option
    return dashboardOptions[selectedLayout];
  });

  // Handle saving layouts to localStorage on changes
  useEffect(() => {
    if (userId && Object.keys(layouts).length > 0) {
      localStorage.setItem(`dashboardLayouts-${userId}`, JSON.stringify(layouts));
    }
  }, [layouts, userId]);

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  // Handle change in dashboard selection
  const handleDashboardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = e.target.value as 'default' | 'alt1' | 'alt2';
    setSelectedLayout(chosen);
    setLayouts(dashboardOptions[chosen]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="mx-auto w-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <select
            className="border p-2 rounded"
            value={selectedLayout}
            onChange={handleDashboardSelect}
          >
            <option value="default">Default Layout</option>
            <option value="alt1">Alternate Layout 1</option>
            <option value="alt2">Alternate Layout 2</option>
          </select>
        </div>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 2000, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 20, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          // Adding compactType can help enforce a one-row layout if not manually set.
          compactType="horizontal"
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
