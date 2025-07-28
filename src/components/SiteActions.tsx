'use client';

import { useRouter } from 'next/navigation';

export function CreateSiteButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push('/sites/new')}
      className="admin-button admin-button-primary"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add New Site
    </button>
  );
}

export function CreateFirstSiteButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push('/sites/new')}
      className="admin-button admin-button-primary"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Create Your First Site
    </button>
  );
}