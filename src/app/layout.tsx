import type { Metadata } from "next";
import Navbar from '@/components/Navbar'
// import Footer from '@/components/Footer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'DMSE Equipment Booking',
  description: 'Book lab equipment from DMSE',
}

export default function RootLayout({
  children,
}: {children: React.ReactNode}) {
  return (
    <html lang='en' className='bg-white text-slate-900 antialiased'>
      <link rel='icon' href='/iitd_logo.png' />
      <body className='antialiased overflow-y-auto'>
        <Navbar />
        <main className='pt-20 min-h-screen flex flex-col'>
          {children}
        </main>
        {/* <Footer /> */}
      </body>
    </html>
  )
}
