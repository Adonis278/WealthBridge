'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChartLine, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestSession } from '@/lib/creditBuilderService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const record = await getLatestSession(user.uid);
        setLatest(record);
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => setLoading(false));
  }, [user]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-5xl space-y-6">
          <div className="frosted-glass rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold text-secondary font-serif">Dashboard</h1>
            <p className="text-sm text-darkwood mt-1">Latest credit session snapshot and analysis status.</p>
          </div>

          {loading ? (
            <div className="frosted-glass rounded-2xl p-6 shadow-xl text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
              <p className="text-sm text-darkwood mt-3">Loading latest session...</p>
            </div>
          ) : !latest ? (
            <div className="frosted-glass rounded-2xl p-6 shadow-xl text-center">
              <FaClock className="text-3xl text-primary mx-auto mb-2" />
              <p className="text-secondary font-semibold">No analysis session yet</p>
              <p className="text-sm text-darkwood mt-1 mb-4">Start Credit Builder to create your first session.</p>
              <Link href="/credit-builder" className="bg-primary hover:bg-amber text-white px-5 py-2 rounded-lg font-semibold text-sm">
                Open Credit Builder
              </Link>
            </div>
          ) : (
            <div className="frosted-glass rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold uppercase tracking-wide">
                  {latest.status || 'draft'}
                </span>
                <Link href="/history" className="text-sm text-primary hover:underline">View full history</Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/70 border border-accent/30 rounded-xl p-4">
                  <p className="text-xs text-darkwood">Goal</p>
                  <p className="text-sm font-semibold text-secondary mt-1">{latest.goals?.primaryGoal || 'Not set'}</p>
                </div>
                <div className="bg-white/70 border border-accent/30 rounded-xl p-4">
                  <p className="text-xs text-darkwood">Current Score</p>
                  <p className="text-2xl font-black text-primary mt-1">{latest.analysis?.rawResult?.credit_summary?.current_score ?? latest.creditReport?.scoreSnapshot ?? '—'}</p>
                </div>
                <div className="bg-white/70 border border-accent/30 rounded-xl p-4">
                  <p className="text-xs text-darkwood">DTI</p>
                  <p className="text-2xl font-black text-secondary mt-1">{latest.dti?.calculatedDTI != null ? `${latest.dti.calculatedDTI}%` : '—'}</p>
                </div>
              </div>

              {latest.analysis?.riskWarnings?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                    <FaExclamationTriangle /> Risk Warnings
                  </div>
                  <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                    {latest.analysis.riskWarnings.slice(0, 3).map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <Link href="/credit-builder" className="inline-flex items-center gap-2 bg-primary hover:bg-amber text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
                  <FaChartLine /> Continue in Credit Builder
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
