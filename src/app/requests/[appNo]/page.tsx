'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RequestDetail = {
  appNo: string;
  instrument: string;
  supervisor: string;
  bookedSlot: string;
  bookingTime: string;
  status: string;
  remarks: string;
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/requests.json')
      .then(res => res.json())
      .then(data => {
        const foundRequest = data.find((req: any) => req.appNo === params.appNo);
        if (foundRequest) {
          setRequest({
            appNo: foundRequest.appNo,
            instrument: foundRequest.instrument,
            supervisor: foundRequest.supervisor || 'Prof. Vikrant Karra',
            bookedSlot: foundRequest.bookingDate,
            bookingTime: foundRequest.appliedOn,
            status: foundRequest.status,
            remarks: foundRequest.remarks || 'NA'
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching request:', err);
        setLoading(false);
      });
  }, [params.appNo]);

  const handleDelete = () => {
    // Here you would call your delete API, then redirect
    // fetch(`/api/requests/${params.appNo}`, { method: 'DELETE' })
    //   .then(() => {
    //     router.push('/requests');
    //   });
    router.push('/requests');
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-full w-full bg-white">
        <div className="px-8 py-6">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex-1 min-h-full w-full bg-white">
        <div className="px-8 py-6">
          <div>Request not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full bg-white justify-center">
      <div className="px-8 py-6 flex flex-col items-center justify-center max-w-200">
        {/* Breadcrumb Navigation */}
        <nav className="text-gray-600 text-sm mb-6 flex items-center space-x-2 w-full justify-start">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>&gt;</span>
          <Link href="/requests" className="hover:text-gray-800">All Requests</Link>
          <span>&gt;</span>
          <span className="text-gray-800">{request.appNo}</span>
        </nav>

        {/* Request Details */}
        <div className="bg-slate-50 rounded-lg p-6 w-full">
          <div className="space-y-4">
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Application Number:</span>
              <span className="text-gray-900">{request.appNo}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Instrument:</span>
              <span className="text-gray-900">{request.instrument}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Supervisor:</span>
              <span className="text-gray-900">{request.supervisor}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Booked Slot:</span>
              <span className="text-gray-900">{request.bookedSlot}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Booking Time:</span>
              <span className="text-gray-900">{request.bookingTime}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Status:</span>
              <span className={
                request.status === 'Accepted' || request.status === 'Approved'
                  ? 'text-green-700 font-medium'
                  : request.status === 'Pending'
                  ? 'text-orange-500 font-medium'
                  : 'text-gray-900'
              }>
                {request.status}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-40">Remarks:</span>
              <span className="text-gray-900">{request.remarks}</span>
            </div>
          </div>
        </div>

        {/* Delete Button with Dialog */}
        <div className="mt-8 w-full flex justify-end">
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your request.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
