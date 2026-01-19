'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';

export default function TestFirebasePage() {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const checkFirebase = async () => {
      const checks: any = {
        authInitialized: false,
        dbInitialized: false,
        envVarsLoaded: false,
        authConfig: null,
        errors: []
      };

      try {
        // Check environment variables
        checks.envVarsLoaded = !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        );

        // Check Firebase Auth initialization
        if (auth) {
          checks.authInitialized = true;
          checks.authConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + '...',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          };
        }

        // Check Firestore initialization
        if (db) {
          checks.dbInitialized = true;
        }
      } catch (error: any) {
        checks.errors.push(error.message);
      }

      setStatus(checks);
    };

    checkFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Configuration Test</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${status.envVarsLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-semibold">Environment Variables:</span>
            <span>{status.envVarsLoaded ? '✓ Loaded' : '✗ Not Loaded'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${status.authInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-semibold">Firebase Auth:</span>
            <span>{status.authInitialized ? '✓ Initialized' : '✗ Not Initialized'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${status.dbInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-semibold">Firestore Database:</span>
            <span>{status.dbInitialized ? '✓ Initialized' : '✗ Not Initialized'}</span>
          </div>

          {status.authConfig && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h2 className="font-bold mb-2">Firebase Configuration:</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(status.authConfig, null, 2)}
              </pre>
            </div>
          )}

          {status.errors && status.errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded">
              <h2 className="font-bold text-red-700 mb-2">Errors:</h2>
              <ul className="list-disc list-inside text-red-700">
                {status.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded">
            <h2 className="font-bold text-blue-900 mb-2">✅ Next Steps:</h2>
            <ol className="list-decimal list-inside text-blue-900 space-y-2">
              <li>Ensure all checks above show green checkmarks</li>
              <li>Go to Firebase Console and enable Email/Password authentication</li>
              <li>Test signup at <a href="/signup" className="text-blue-600 underline">/signup</a></li>
              <li>Test login at <a href="/login" className="text-blue-600 underline">/login</a></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
