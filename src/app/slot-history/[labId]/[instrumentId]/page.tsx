'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface Booking {
  applicationNo: string;
  slot: string;
  bookingDate: string;
  userName: string;
  supervisor: string;
  status: string;
}

interface HistoryGroup {
  date: string;
  bookings: Booking[];
}

interface SlotHistory {
  lab_name: string;
  instrument_name: string;
  history: HistoryGroup[];
}

interface Instrument {
  instrument_id: number;
  instrument_name: string;
}

interface DecodedToken {
  id: number;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [slotHistory, setSlotHistory] = useState<SlotHistory | null>(null);
  const [instrumentName, setInstrumentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch instrument name and slot history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const decoded: DecodedToken = jwtDecode(token);
        if (!decoded.id) {
          throw new Error('Invalid token: User ID not found');
        }

        // Fetch instruments to get instrument_name for instrument_id
        const instrumentResponse = await fetch(
          `http://localhost:5000/api/equipment/instruments/${params.labId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!instrumentResponse.ok) {
          const errorText = await instrumentResponse.text();
          throw new Error(`Failed to fetch instruments: ${errorText}`);
        }
        const instruments: Instrument[] = await instrumentResponse.json();
        const instrument = instruments.find(
          (inst) => inst.instrument_id === parseInt(params.instrumentId as string)
        );
        if (!instrument) {
          throw new Error(`Instrument with ID ${params.instrumentId} not found`);
        }
        setInstrumentName(instrument.instrument_name);

        // Fetch slot history using instrument_name
        const response = await fetch(
          `http://localhost:5000/api/equipment/slot-history?lab_id=${params.labId}&instrument_name=${encodeURIComponent(instrument.instrument_name)}&user_id=${decoded.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch slot history: ${errorText}`);
        }
        const data = await response.json();
        console.log('Slot history data:', data);
        setSlotHistory(data);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
        setError(`Failed to load slot history: ${err.message}. Please try again or contact admin.`);
      }
    };
    fetchData();
  }, [params.labId, params.instrumentId]);

  if (!slotHistory || !instrumentName) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 min-h-full w-full bg-white">
      <div className="px-8 py-6">
        <nav className="text-gray-600 text-sm mb-4 flex items-center space-x-2">
          <span className="cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span></span>
          <span className="cursor-pointer" onClick={() => router.push('/slot-history')}>Slot History</span>
          <span></span>
          <span>{slotHistory.lab_name}</span>
          <span></span>
          <span className="text-gray-800">{instrumentName}</span>
        </nav>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {instrumentName} Slot History
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {slotHistory.history.length === 0 ? (
          <p className="text-gray-700">No booking history found for this instrument.</p>
        ) : (
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-gray-800">S. No.</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Application No.</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Slot</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Booking Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">User Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Supervisor</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {slotHistory.history.map((group, groupIdx) => (
                <React.Fragment key={group.date}>
                  <tr>
                    <td colSpan={7} className="bg-blue-100 text-blue-900 font-semibold py-2 px-3">
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
                      <td className="py-2 px-3 text-gray-700">{booking.status}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}