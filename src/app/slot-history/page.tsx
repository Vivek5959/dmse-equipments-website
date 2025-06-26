'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Lab {
  id: number;
  name: string;
}

interface Instrument {
  instrument_id: number;
  instrument_name: string;
}

export default function Page() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [selectedInstrumentName, setSelectedInstrumentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch labs
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await fetch('http://localhost:5000/api/equipment/labs', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch labs');
        }
        const data = await response.json();
        setLabs(data);
        if (data.length > 0) {
          setSelectedLabId(data[0].id.toString());
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchLabs();
  }, []);

  // Fetch instruments for selected lab
  useEffect(() => {
    if (!selectedLabId) return;
    const fetchInstruments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/equipment/instruments/${selectedLabId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch instruments');
        }
        const data = await response.json();
        setInstruments(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchInstruments();
  }, [selectedLabId]);

  const handleCheckHistory = () => {
    if (!selectedLabId || !selectedInstrumentName) {
      setError('Please select a lab and instrument.');
      return;
    }
    const instrument = instruments.find(inst => inst.instrument_name === selectedInstrumentName);
    if (instrument) {
      router.push(`/slot-history/${selectedLabId}/${instrument.instrument_id}`);
    } else {
      setError('Selected instrument not found.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-12 px-8">
      {/* Breadcrumb */}
      <nav className="w-full max-w-3xl mb-6">
        <ol className="flex items-center space-x-2 text-gray-500 text-base">
          <li className="cursor-pointer" onClick={() => router.push('/')}>Home</li>
          <li></li>
          <li className="text-black">Slot History</li>
        </ol>
      </nav>

      <div className="w-full max-w-2xl border rounded bg-white px-8 py-10 shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={(e) => { e.preventDefault(); handleCheckHistory(); }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-2">
              <label htmlFor="facility" className="font-semibold text-lg text-black">
                Facility/Lab:
              </label>
            </div>
            <div>
              <Select value={selectedLabId} onValueChange={setSelectedLabId}>
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
                value={selectedInstrumentName}
                onValueChange={setSelectedInstrumentName}
                disabled={!selectedLabId}
              >
                <SelectTrigger id="instrument" className="w-full">
                  <SelectValue placeholder={selectedLabId ? "Select Instrument" : "Select a Lab First"} />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((instrument) => (
                    <SelectItem key={instrument.instrument_id} value={instrument.instrument_name}>
                      {instrument.instrument_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button type="submit" className="w-56 bg-blue-600 hover:bg-blue-700">
              View Slot History
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}