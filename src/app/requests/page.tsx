'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Request = {
  sNo: number;
  appNo: string;
  appliedOn: string;
  instrument: string;
  bookingDate: string;
  status: string;
};

export default function Page() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    fetch('/requests.json')
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  return (
    <main className="max-w-6xl mx-auto w-full px-4 py-8">
      <h2 className="text-2xl font-semibold mb-8">All Requests</h2>

      {/* Filters */}
      {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 justify-end">
        <select className="border border-gray-400 rounded px-3 py-2 w-28">
          <option>All</option>
        </select>
        <select className="border border-gray-400 rounded px-3 py-2 w-28">
          <option>Latest</option>
        </select>
      </div> */}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="px-4 py-2 text-left font-semibold">S. No.</th>
              <th className="px-4 py-2 text-left font-semibold">App. No.</th>
              <th className="px-4 py-2 text-left font-semibold">Applied on</th>
              <th className="px-4 py-2 text-left font-semibold">Instrument</th>
              <th className="px-4 py-2 text-left font-semibold">Booking Date</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="px-4 py-2">{req.sNo}</td>
                <td className="px-4 py-2">{req.appNo}</td>
                <td className="px-4 py-2">{req.appliedOn}</td>
                <td className="px-4 py-2">{req.instrument}</td>
                <td className="px-4 py-2">{req.bookingDate}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      req.status === 'Approved'
                        ? 'text-green-700 font-medium'
                        : req.status === 'Pending'
                        ? 'text-orange-500 font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/requests/${req.appNo}`}>
                    <Button variant="link" className="text-blue-700 hover:underline">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
