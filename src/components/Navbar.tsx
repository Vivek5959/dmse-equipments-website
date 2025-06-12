import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="fixed w-screen background-blur-sm h-20 z-50 bg-blue-700 text-white flex items-center justify-between px-8 py-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </div>
      </div>
      <nav className="flex space-x-8">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/requests" className="hover:underline">All Requests</Link>
        <Link href="/logout" className="hover:underline">Log Out</Link>
      </nav>
    </div>
  );
}
