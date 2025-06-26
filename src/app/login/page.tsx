// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, login } from '../../api'; // Import named exports

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      console.log(`Attempting ${isRegister ? 'Register' : 'Login'} with username: ${username}`);
      const res = isRegister ? await register({ username, password, privilege_level: 'student' }) : await login({ username, password });
      console.log('API Response:', res.data);
      const token = isRegister ? (await login({ username, password })).data.token : res.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', res.data.user.id);
        console.log('Token and userId stored in localStorage');
      }
      alert(isRegister ? 'Registration successful, logged in' : 'Login successful');
      router.push('/apply-reimbursements');
    } catch (err) {
      const errorMsg = (err as any).response?.data?.error || (err as any).message || 'Unknown error';
      setError(`Authentication failed: ${errorMsg}`);
      console.error('Authentication Error Details:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-12">
      <div className="w-full max-w-2xl border rounded bg-white px-8 py-10">
        <h2 className="text-2xl font-semibold mb-6">{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-black mb-2" htmlFor="username">
              Username:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-black mb-2" htmlFor="password">
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between">
            <button type="submit" className="w-32 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
              {isRegister ? 'Register' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="w-32 border border-gray-300 hover:bg-gray-100 py-2 rounded"
            >
              {isRegister ? 'Switch to Login' : 'Switch to Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}