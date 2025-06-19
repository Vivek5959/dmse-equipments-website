'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ApplyPage() {
  const [course, setCourse] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course || !supervisor || !details.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    // You can replace this with API call
    console.log('Submitted:', { course, supervisor, details });
    alert('Reimbursement Request Submitted!');
  };

  return (
    <div className="w-full flex flex-col items-center mt-12">
      {/* Breadcrumb */}
      <nav className="w-full max-w-3xl mb-6">
        <ol className="flex items-center space-x-2 text-gray-500 text-base">
          <li>Home</li>
          <li>&gt;</li>
          <li className="text-black">Reimbursement</li>
        </ol>
      </nav>

      {/* Form */}
      <div className="w-full max-w-2xl border rounded bg-white px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Course Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg text-black" htmlFor="course">
                Course :
              </label>
            </div>
            <div>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger id="course" className="w-full">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MLL212">MLL212</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Supervisor Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg text-black" htmlFor="supervisor">
                Supervisor:
              </label>
            </div>
            <div>
              <Select value={supervisor} onValueChange={setSupervisor}>
                <SelectTrigger id="supervisor" className="w-full">
                  <SelectValue placeholder="Select Supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prof. Vikrant Karra">Prof. Vikrant Karra</SelectItem>
                  <SelectItem value="Prof. Nivedita">Prof. Nivedita</SelectItem>
                  <SelectItem value="Prof. S. Kumar">Prof. S. Kumar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Details Text Area */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg text-black" htmlFor="details">
                Details:
              </label>
            </div>
            <div>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter the details"
                className="w-full border rounded px-4 py-2 text-base resize-none min-h-[120px]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button type="submit" className="w-56 bg-blue-600 hover:bg-blue-700">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
