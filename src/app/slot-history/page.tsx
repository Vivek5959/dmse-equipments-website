'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Lab {
  id: string;
  name: string;
  instruments: {
    id: string;
    name: string;
  }[];
}

export default function Page() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const router = useRouter();

  // Load labs data from public/labs.json on component mount
  useEffect(() => {
    fetch('/labs.json')
      .then((res) => res.json())
      .then((data) => {
        setLabs(data.labs);
        // Optionally set the first lab as default
        if (data.labs.length > 0) {
          setSelectedLabId(data.labs[0].id);
        }
      })
      .catch((err) => console.error("Error loading labs.json:", err));
  }, []);

  const selectedLab = labs.find(lab => lab.id === selectedLabId);
  const instruments = selectedLab?.instruments || [];

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLabId && selectedInstrumentId) {
      router.push(`/slot-history/${selectedLabId}/${selectedInstrumentId}`);
    } else {
      alert("Please select both a lab and an instrument.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-12 px-8">
      {/* Breadcrumb */}
      <nav className="w-full max-w-3xl mb-6">
        <ol className="flex items-center space-x-2 text-gray-500 text-base">
          <li>Home</li>
          <li>&gt;</li>
          <li className="text-black">Slot History</li>
        </ol>
      </nav>

      <div className="w-full max-w-2xl border rounded bg-white px-8 py-10 shadow-md">
        <form onSubmit={handleCheckAvailability} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="facility"
                className="font-semibold text-lg text-black"
              >
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
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="instrument"
                className="font-semibold text-lg text-black"
              >
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
                  <SelectValue placeholder={selectedLabId ? "Select Instrument" : "Select a Lab First"} />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((instrument) => (
                    <SelectItem key={instrument.id} value={instrument.id}>
                      {instrument.name}
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
