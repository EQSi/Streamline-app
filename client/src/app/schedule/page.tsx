'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

// Dynamically import Calendar to prevent SSR issues
const Calendar = dynamic(
  () => import('react-big-calendar').then((mod) => mod.Calendar),
  { ssr: false }
);

import { dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ScheduleLayout from '../layout';

const localizer = dayjsLocalizer(dayjs);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

const events: CalendarEvent[] = [
  {
    title: 'Meeting',
    start: new Date(),
    end: new Date(),
    allDay: false,
  },
];

export default function SchedulePage() {
  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 2rem)' }}
      />
    </div>
  );
}