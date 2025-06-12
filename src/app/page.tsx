import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="flex-1 flex items-center justify-center bg-white">
      <div className="flex gap-8">
        <Link href="/book" passHref>
          <Button
            variant="outline"
            className="w-64 h-64 flex flex-col items-center justify-center rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors text-xl"
          >
            Book
          </Button>
        </Link>
        <Link href="/slot-history" passHref>
          <Button
            variant="outline"
            className="w-64 h-64 flex flex-col items-center justify-center rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors text-xl"
          >
            View Slot History
          </Button>
        </Link>
      </div>
    </main>
  );
}
