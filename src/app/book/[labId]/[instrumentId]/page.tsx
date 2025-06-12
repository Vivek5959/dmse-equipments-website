'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { useState, useEffect } from 'react';
import { format, addDays, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';

interface Instrument {
  id: string;
  name: string;
}

interface Lab {
  id: string;
  name: string;
  instruments: Instrument[];
}

interface Slot {
  date: string;
  times: {
    id: number;
    time: string;
    available: number;
    total: number;
  }[];
}

const supervisors = [
  { value: 'jayantj', label: 'Prof. Jayant Jain' },
  { value: 'ksnvikrant', label: 'Prof. Suryanarayana Vikrant Karra' },
  { value: 'rajesh', label: 'Prof. Rajesh Prasad' },
  { value: 'jacob', label: 'Prof. Josemon Jacob' },
  { value: 'bhabani', label: 'Prof. Bhabani K Satapathy' },
];

export default function Page() {
  const params = useParams();
  const [lab, setLab] = useState<Lab | null>(null);
  const [instrument, setInstrument] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<{
    labName: string;
    instrumentName: string;
    date: string;
    timeSlot: string;
  } | null>(null);

  // Modal form state
  const [supervisor, setSupervisor] = useState('');
  const [supervisorQuery, setSupervisorQuery] = useState('');
  const filteredSupervisors = supervisors.filter(s =>
    s.label.toLowerCase().includes(supervisorQuery.toLowerCase()) ||
    s.value.toLowerCase().includes(supervisorQuery.toLowerCase())
  );

  // Generate slots for next 7 days with static available slots
  const [slots] = useState<Slot[]>(() => {
    const dates: Slot[] = [];
    const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const slotDate = addDays(today, i);
    dates.push({
      date: format(slotDate, 'EEEE, do MMMM, yyyy'),
      times: [
        { id: 3*i - 2, time: '10:00 AM to 12:00 PM', available: 2, total: 4 },
        { id: 3*i - 1, time: '12:00 PM to 2:00 PM', available: 3, total: 4 },
        { id: 3*i,     time: '4:00 PM to 6:00 PM', available: 0, total: 4 },
      ],
    });
  }


    return dates;
  });

  // Load lab and instrument data
  useEffect(() => {
    fetch('/labs.json')
      .then((res) => res.json())
      .then((data) => {
        const foundLab = data.labs.find((l: Lab) => l.id === params.labId);
        if (foundLab) {
          setLab(foundLab);
          const foundInstrument = foundLab.instruments.find(
            (i : Instrument) => i.id === params.instrumentId
          );
          setInstrument(foundInstrument?.name || '');
        }
      });
  }, [params.labId, params.instrumentId]);

  // Handle booking click
  const handleBookClick = (date: string, timeSlot: string) => {
    setBookingData({
      labName: lab?.name || '',
      instrumentName: instrument,
      date: format(parse(date, 'EEEE, do MMMM, yyyy', new Date()), 'dd MMMM, yyyy'),
      timeSlot,
    });
    setIsModalOpen(true);
  };

  const resetValues = () => {
    setBookingData(null);
    setSupervisor('');
    setSupervisorQuery('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle booking logic here
    console.log('Booking Data:', {
      labName: bookingData?.labName,
      instrumentName: bookingData?.instrumentName,
      date: bookingData?.date,
      timeSlot: bookingData?.timeSlot,
      supervisor,
    });
    // Reset form and close modal
    resetValues();
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 min-h-full w-full bg-white">
      <div className="px-8 py-6">
        <nav className="text-gray-600 text-sm mb-4 flex items-center space-x-2">
          <span>Home</span>
          <span>&gt;</span>
          <span>Booking</span>
          <span>&gt;</span>
          <span>{lab?.name || 'Loading...'}</span>
          <span>&gt;</span>
          <span className="text-gray-800">{instrument || 'Loading...'}</span>
        </nav>

        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          {instrument || 'Loading Instrument...'}
        </h1>

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
            {slots.map((slotGroup, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td colSpan={5} className="bg-blue-100 text-blue-900 font-semibold py-2 px-3">
                    {slotGroup.date}
                  </td>
                </tr>
                {slotGroup.times.map((slot) => (
                  <tr key={slot.id} className="border-b last:border-0">
                    <td className="py-2 px-3 text-gray-700">{slot.id}</td>
                    <td className="py-2 px-3 text-gray-700">{slot.time}</td>
                    <td className="py-2 px-3 text-gray-700">{slot.available} out of {slot.total}</td>
                    <td className="py-2 px-3">
                      {slot.available > 0 ? (
                        <span
                          className="text-blue-700 cursor-pointer hover:underline"
                          onClick={() => handleBookClick(slotGroup.date, slot.time)}
                        >
                          Book
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg" onCloseAutoFocus={() => resetValues()}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-2 text-gray-700">
              Booking Request Initiation
            </DialogTitle>
          </DialogHeader>
          {bookingData && (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mx-auto rounded bg-white" style={{ maxWidth: 480 }}>
                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">
                      Facility/ Lab Name:
                    </label>
                    <input
                      type="text"
                      value={bookingData.labName}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">
                      Instrument Name:
                    </label>
                    <input
                      type="text"
                      value={bookingData.instrumentName}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">
                      Date:
                    </label>
                    <input
                      type="text"
                      value={bookingData.date}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">
                      Slot:
                    </label>
                    <input
                      type="text"
                      value={bookingData.timeSlot}
                      disabled
                      className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                      tabIndex={-1}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">
                      Supervisor:
                    </label>
                    <Combobox
                      value={supervisor}
                      onValueChange={setSupervisor}
                      inputValue={supervisorQuery}
                      onInputValueChange={setSupervisorQuery}
                      options={filteredSupervisors}
                      placeholder="Type to search supervisor..."
                      displayValue={(val: string) =>
                        supervisors.find(s => s.value === val)?.label || ''
                      }
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
