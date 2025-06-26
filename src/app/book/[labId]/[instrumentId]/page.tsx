'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { jwtDecode } from 'jwt-decode';

interface SlotAvailability {
  slotId: number;
  time: string;
  available: number;
  total: number;
}

interface Availability {
  date: string;
  slots?: SlotAvailability[];
}

interface Instrument {
  instrument_id: number;
  instrument_name: string;
  is_working: boolean;
  total: number;
  lab_name: string;
  availability: Availability[];
}

interface Lab {
  id: number;
  name: string;
}

interface DecodedToken {
  id: number;
  privilege_level: string;
}

interface BookingData {
  labId: number;
  labName: string;
  instrumentName: string;
  date: string;
  timeSlot: string;
}

export default function AvailabilityPage() {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const router = useRouter();
  const { labId, instrumentId } = useParams();

  // Fetch instrument and lab data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        // Fetch instruments with cache-busting
        const instrumentResponse = await fetch(`http://localhost:5000/api/equipment/instruments/${labId}?t=${Date.now()}`, {
          headers,
        });
        if (!instrumentResponse.ok) {
          const errorText = await instrumentResponse.text();
          throw new Error(`Failed to fetch instrument data: ${errorText}`);
        }
        const instrumentData = await instrumentResponse.json();
        console.log('Instrument data:', instrumentData);
        if (!Array.isArray(instrumentData)) throw new Error('Invalid response format: Instrument data is not an array');
        const selectedInstrument = instrumentData.find((inst: Instrument) => inst.instrument_id === Number(instrumentId));
        if (selectedInstrument) {
          console.log('Selected instrument:', selectedInstrument);
          console.log('Lab name from instrument:', selectedInstrument.lab_name);
          setInstrument(selectedInstrument);
          setLab({ id: Number(labId), name: selectedInstrument.lab_name || 'Unknown Lab' });
        } else {
          throw new Error('Instrument not found');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
        setError(`Failed to load data: ${err.message}. Please try again or contact admin.`);
      }
    };
    fetchData();
  }, [labId, instrumentId]);

  // Handle booking click
  const handleBookClick = (date: string, timeSlot: string) => {
    if (!lab || !instrument) return;
    setBookingData({
      labId: lab.id,
      labName: lab.name,
      instrumentName: instrument.instrument_name,
      date: format(parse(date, 'yyyy-MM-dd', new Date()), 'dd MMMM, yyyy'),
      timeSlot,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookingData) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to book a slot.');
      router.push('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (!decoded.id) throw new Error('Invalid token: User ID not found');
      const userId = decoded.id;
      const [startHour] = bookingData.timeSlot.split('-').map((t) => parseInt(t));
      const localDate = parse(bookingData.date, 'dd MMMM, yyyy', new Date());
      localDate.setHours(startHour, 0, 0, 0);

      // Convert local time to UTC by subtracting timezone offset
      const utcTime = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      const slotISO = utcTime.toISOString();

      const requestBody = {
        lab_id: bookingData.labId,
        lab_name: bookingData.labName,
        instrument_name: bookingData.instrumentName, // Send instrument_name instead of instrument_id
        slot: slotISO,
        requested_by: userId,
      };
      console.log('Sending booking request:', requestBody);

      const response = await fetch('http://localhost:5000/api/equipment/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to book slot');
      alert(`Slot booked successfully! Booking ID: ${data.bookingId}`);
      setIsModalOpen(false);
      setBookingData(null);
      router.push('/');
    } catch (err: any) {
      console.error('Error booking slot:', err);
      alert(`Failed to book slot: ${err.message}`);
    }
  };

  if (!instrument || !lab) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 min-h-full w-full bg-white">
      <div className="px-8 py-6">
        <nav className="text-gray-600 text-sm mb-4 flex items-center space-x-2">
          <span className="cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span></span>
          <span className="cursor-pointer" onClick={() => router.push('/book')}>Booking</span>
          <span></span>
          <span>{lab.name}</span>
          <span></span>
          <span className="text-gray-800">{instrument.instrument_name}</span>
        </nav>

        <h1 className="text-2xl font-semibold mb-2 text-gray-800">{instrument.instrument_name}</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {instrument.is_working ? (
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-gray-800">S. No.</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Time</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Available Slots</th>
                <th className="text-left py-2 px-3 font-medium text-gray-800">Book</th>
              </tr>
            </thead>
            <tbody>
              {instrument.availability.map((avail) => (
                <React.Fragment key={avail.date}>
                  <tr>
                    <td colSpan={4} className="bg-blue-100 text-blue-900 font-semibold py-2 px-3">
                      {format(parse(avail.date, 'yyyy-MM-dd', new Date()), 'EEEE, do MMMM, yyyy')}
                    </td>
                  </tr>
                  {avail.slots && avail.slots.length > 0 ? (
                    avail.slots.map((slot) => (
                      <tr key={slot.slotId} className="border-b last:border-0">
                        <td className="py-2 px-3 text-gray-700">{slot.slotId}</td>
                        <td className="py-2 px-3 text-gray-700">{slot.time}</td>
                        <td className="py-2 px-3 text-gray-700">{slot.available} out of {slot.total}</td>
                        <td className="py-2 px-3">
                          {slot.available > 0 ? (
                            <span
                              className="text-blue-700 cursor-pointer hover:underline"
                              onClick={() => handleBookClick(avail.date, slot.time)}
                            >
                              Book
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-gray-700">
                        No slots available for this date
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-red-500">This instrument is currently not working.</p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setBookingData(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-2 text-gray-700">
              Booking Request Initiation
            </DialogTitle>
          </DialogHeader>
          {bookingData && (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mx-auto rounded bg-white" style={{ maxWidth: 480 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Facility/Lab Name:</label>
                    <input
                      type="text"
                      value={bookingData.labName}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Instrument Name:</label>
                    <input
                      type="text"
                      value={bookingData.instrumentName}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Date:</label>
                    <input
                      type="text"
                      value={bookingData.date}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Slot:</label>
                    <input
                      type="text"
                      value={bookingData.timeSlot}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    type="submit"
                    className="w-48 bg-blue-600 hover:bg-blue-700 text-md"
                  >
                    Book
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
