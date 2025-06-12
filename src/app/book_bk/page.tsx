'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';

const facilities = [
  { value: '3d-printing', label: '3D Printing' },
  { value: 'metallurgy-lab', label: 'Metallurgy Lab' },
];

const instruments = [
  { value: 'laser-cutting', label: 'Laser Cutting Machine' },
  { value: 'fdm-printer', label: 'FDM Printer' },
];

const slots = [
  { value: '10-12', label: '10:00 AM - 12:00 PM' },
  { value: '12-2', label: '12:00 PM - 2:00 PM' },
];

const supervisors = [
  { value: 'jayantj', label: 'Jayant Jain' },
  { value: 'ksnvikrant', label: 'Suryanarayana Vikrant Karra' },
  { value: 'rajesh', label: 'Rajesh Prasad' },
  { value: 'jacob', label: 'Josemon Jacob' },
  { value: 'bhabani', label: 'Bhabani K Satapathy' },
];

export default function BookingRequestPage() {
  const [facility, setFacility] = React.useState(facilities[0].value);
  const [instrument, setInstrument] = React.useState(instruments[0].value);
  const [slot, setSlot] = React.useState(slots[0].value);
  const [date, setDate] = React.useState(new Date());
  const [supervisor, setSupervisor] = React.useState('');
  const [supervisorQuery, setSupervisorQuery] = React.useState('');

  // Filter supervisors for combobox
  const filteredSupervisors = supervisors.filter(s =>
    s.label.toLowerCase().includes(supervisorQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center justify-center">
        <form
          className="bg-white border rounded-lg shadow-sm p-10 mt-10 w-full max-w-xl"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-semibold mb-8">Booking Request Initiation</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 items-center">
            <label className="font-semibold text-right">Facility/ Lab Name:</label>
            <Select value={facility} onValueChange={setFacility}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="font-semibold text-right">Instrument Name:</label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger>
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map(i => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="font-semibold text-right">Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {date ? format(date, 'dd MMMM, yyyy') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  required={true}
                  selected={date}
                  onSelect={setDate}
                //   initialFocus
                />
              </PopoverContent>
            </Popover>

            <label className="font-semibold text-right">Slot:</label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="font-semibold text-right">Supervisor:</label>
            <Combobox
              value={supervisor}
              onValueChange={setSupervisor}
              inputValue={supervisorQuery}
              onInputValueChange={setSupervisorQuery}
              options={filteredSupervisors}
              placeholder="Type to search supervisor..."
              displayValue={(val: string) => supervisors.find(s => s.value === val)?.label || ''}
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button type="submit" className="bg-blue-800 hover:bg-blue-700 w-40">
              Book
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
