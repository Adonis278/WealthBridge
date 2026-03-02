'use client';

import dynamic from 'next/dynamic';

const EducationClient = dynamic(() => import('@/components/education/EducationClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-darkwood">Loading education hub...</p>
        </div>
      </div>
    </div>
  ),
});

export default function EducationPage() {
  return <EducationClient />;
}
