"use client";

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';


const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage: React.FC = () => {
  
  const userId = 'exampleUserId';

  const [minimizedCards, setMinimizedCards] = useState<{ [key: string]: boolean }>({});
  const [layouts, setLayouts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dashboardLayouts-${userId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const cards = [
    { i: 'jobs', name: 'Jobs', content: 'Job Numbers with list by stage\nPerformance- still finding out how to measure' },
    { i: 'task', name: 'Task', content: 'Personal tasks, job tasks, and personal reciepts/pictures' },
    { i: 'schedule', name: 'Schedule', content: 'Content for card 3 goes here.' },
    { i: 'card4', name: 'Card 4', content: 'Content for card 4 goes here.' },
    { i: 'card5', name: 'Card 5', content: 'Content for card 5 goes here.' },
    { i: 'card6', name: 'Card 6', content: 'Content for card 6 goes here.' },
    { i: 'card7', name: 'Card 7', content: 'Content for card 7 goes here.' },
  ];

  const defaultLayouts = {
    lg: cards.map((card, i) => ({
      i: card.i,
      x: i % 3,
      y: Math.floor(i / 3),
      w: 3,
      h: 3,
      minW: 2,
      minH: 2
    }))
  };

  useEffect(() => {
    if (Object.keys(layouts).length > 0) {
      localStorage.setItem(`dashboardLayouts-${userId}`, JSON.stringify(layouts));
    }
  }, [layouts, userId]);

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  const toggleMinimize = (cardId: string) => {
    setMinimizedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{card.name}</h2>
                  <button 
                    onClick={() => toggleMinimize(card.i)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {minimizedCards[card.i] ? 'Expand' : 'Minimize'}
                  </button>
                </div>
                {!minimizedCards[card.i] && (
                  <p className="text-gray-700 whitespace-pre-line">{card.content}</p>
                )}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardPage;