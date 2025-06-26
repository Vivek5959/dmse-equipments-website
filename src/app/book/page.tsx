'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Lab {
  id: number;
  name: string;
  supervisor?: string;
}

interface Instrument {
  instrument_id: number;
  instrument_name: string;
  is_working: boolean;
  total: number;
  availability: { date: string; slots: { slotId: number; time: string; available: number; total: number }[] }[];
}

export default function BookingPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch labs from backend
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/equipment/labs', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) throw new Error('Failed to fetch labs');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid response format: Labs data is not an array');
        setLabs(data);
        if (data.length > 0 && data[0].id) {
          setSelectedLabId(data[0].id.toString());
        } else {
          setError('No labs available or invalid lab data');
        }
      } catch (err: any) {
        console.error('Error fetching labs:', err);
        setError('Failed to load labs. Please try again.');
      }
    };
    fetchLabs();
  }, []);

  // Fetch instruments when a lab is selected
  useEffect(() => {
    if (selectedLabId) {
      const fetchInstruments = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/equipment/instruments/${selectedLabId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!response.ok) throw new Error('Failed to fetch instruments');
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error('Invalid response format: Instruments data is not an array');
          setInstruments(data);
          if (data.length > 0 && data[0].instrument_id) {
            setSelectedInstrumentId(data[0].instrument_id.toString());
          }
        } catch (err: any) {
          console.error('Error fetching instruments:', err);
          setInstruments([]);
          setError('Failed to load instruments. Please select a different lab.');
        }
      };
      fetchInstruments();
    } else {
      setInstruments([]);
      setSelectedInstrumentId(null);
    }
  }, [selectedLabId]);

  // Handle Check Availability button click
  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLabId && selectedInstrumentId) {
      router.push(`/book/${selectedLabId}/${selectedInstrumentId}`);
    } else {
      alert('Please select both a lab and an instrument.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-12">
      {/* Breadcrumb */}
      <nav className="w-full max-w-3xl mb-6">
        <ol className="flex items-center space-x-2 text-gray-500 text-base">
          <li className="cursor-pointer" onClick={() => router.push('/')}>Home</li>
          <li></li>
          <li className="text-black">Booking</li>
        </ol>
      </nav>

      {/* Booking Form */}
      <div className="w-full max-w-2xl border rounded bg-white px-8 py-10">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleCheckAvailability} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-2">
              <label htmlFor="facility" className="font-semibold text-lg text-black">
                Facility/Lab:
              </label>
            </div>
            <div>
              <Select value={selectedLabId || ''} onValueChange={setSelectedLabId}>
                <SelectTrigger id="facility" className="w-full">
                  <SelectValue placeholder="Select Facility" />
                </SelectTrigger>
                <SelectContent>
                  {labs.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id.toString()}>
                      {lab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="instrument" className="font-semibold text-lg text-black">
                Instrument:
              </label>
            </div>
            <div>
              <Select
                value={selectedInstrumentId || ''}
                onValueChange={setSelectedInstrumentId}
                disabled={!selectedLabId}
              >
                <SelectTrigger id="instrument" className="w-full">
                  <SelectValue placeholder={selectedLabId ? 'Select Instrument' : 'Select a Lab First'} />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((instrument) => (
                    <SelectItem key={instrument.instrument_id} value={instrument.instrument_id.toString()}>
                      {instrument.instrument_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
  </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button type="submit" className="w-56 bg-blue-600 hover:bg-blue-700">
              Check Availability
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}