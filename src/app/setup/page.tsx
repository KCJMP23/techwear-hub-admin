'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Setup completed successfully! You can now sign in with admin@example.com / password');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Initial Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This will create an admin user for your platform
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="bg-white px-6 py-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Admin User Details</h3>
              <p className="text-sm text-gray-600">Email: admin@example.com</p>
              <p className="text-sm text-gray-600">Password: password</p>
            </div>
          </div>

          {message && (
            <div className={`rounded-md p-4 ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>

          <div className="text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-500">
              Skip for now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}