import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Card 1</h2>
            <p className="text-gray-700">Content for card 1 goes here.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Card 2</h2>
            <p className="text-gray-700">Content for card 2 goes here.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Card 3</h2>
            <p className="text-gray-700">Content for card 3 goes here.</p>
          </div>
          {/* Add more cards as needed */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;