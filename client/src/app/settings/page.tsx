'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode } from '@/state';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <button
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            className={`${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <span>Push Notifications</span>
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}