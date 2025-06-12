'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

// Types
interface Lab {
  id: string;
  name: string;
  instruments: {
    id: string;
    name: string;
  }[];
}

// Example static booking data (replace with real data as needed)
const bookingHistory = [
  {
    date: 'Monday, 26th May, 2025',
    bookings: [
      {
        applicationNo: '20143',
        slot: '10:00 AM - 12:00 PM',
        bookingDate: '03/05/2025 01:02 PM',
        userName: 'Rishabh Verma',
        supervisor: 'Prof. Vikrant',
      },
      {
        applicationNo: '20226',
        slot: '10:00 AM - 12:00 PM',
        bookingDate: '04/05/2025 03:23 PM',
        userName: 'Rishabh Verma',
        supervisor: 'Prof. Jayant',
      },
      {
        applicationNo: '20228',
        slot: '10:00 AM - 12:00 PM',
        bookingDate: '04/05/2025 03:27 PM',
        userName: 'Rishabh Verma',
        supervisor: 'Prof. Jayant',
      },
    ],
  },
];

export default function Page() {
  const params = useParams();
  const [lab, setLab] = useState<Lab | null>(null);
  const [instrument, setInstrument] = useState<string>('');

  // Load lab and instrument data
  useEffect(() => {
    fetch('/labs.json')
      .then((res) => res.json())
      .then((data) => {
        const foundLab = data.labs.find((l: Lab) => l.id === params.labId);
        if (foundLab) {
          setLab(foundLab);
          const foundInstrument = foundLab.instruments.find(
            (i: any) => i.id === params.instrumentId
          );
          setInstrument(foundInstrument?.name || '');
        }
      });
  }, [params.labId, params.instrumentId]);

  return (
    <div className="flex-1 min-h-full w-full bg-white">
      <div className="px-8 py-6">
        <nav className="text-gray-600 text-sm mb-4 flex items-center space-x-2">
          <span>Home</span>
          <span>&gt;</span>
          <span>Slot History</span>
          <span>&gt;</span>
          <span>{lab?.name || 'Loading...'}</span>
          <span>&gt;</span>
          <span className="text-gray-800">{instrument || 'Loading...'}</span>
        </nav>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          { instrument ? instrument.concat(' Slot History') : 'Loading...' }
        </h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium text-gray-800">S. No.</th>
              <th className="text-left py-2 px-3 font-medium text-gray-800">Application No.</th>
              <th className="text-left py-2 px-3 font-medium text-gray-800">Slot</th>
              <th className="text-left py-2 px-3 font-medium text-gray-800">Booking Date</th>
              <th className="text-left py-2 px-3 font-medium text-gray-800">User name</th>
              <th className="text-left py-2 px-3 font-medium text-gray-800">Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {bookingHistory.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <tr>
                  <td colSpan={6} className="bg-blue-100 text-blue-900 font-semibold py-2 px-3">
                    {group.date}
                  </td>
                </tr>
                {group.bookings.map((booking, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-3 text-gray-700">{idx + 1}</td>
                    <td className="py-2 px-3 text-gray-700">{booking.applicationNo}</td>
                    <td className="py-2 px-3 text-gray-700">{booking.slot}</td>
                    <td className="py-2 px-3 text-gray-700">{booking.bookingDate}</td>
                    <td className="py-2 px-3 text-gray-700">{booking.userName}</td>
                    <td className="py-2 px-3 text-gray-700">{booking.supervisor}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
