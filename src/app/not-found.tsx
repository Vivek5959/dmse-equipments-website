import Link from 'next/link'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Goodeats | Page not found',
  description: 'What would you like to cook today',
}

const PageNotFound: React.FC = () => {
  return (
    <section className='container pt-32 max-w-7xl mx-auto text-center flex flex-col gap-6 items-center'>
      <h1 className='text-4xl font-bold'>Page not found...</h1>
      <p className='text-lg'>The page you&apos;re searching for does not exist.</p>
      <Link href='/' className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'>
        Back to home
      </Link>
    </section>
  )
}

export default PageNotFound