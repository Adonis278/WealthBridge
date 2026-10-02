'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaHistory } from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentSessions } from '@/lib/creditBuilderService';

export default function HistoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRecentSessions(user.uid, 20);
        setSessions(data);
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
            <h1 className="text-3xl font-bold text-secondary font-serif flex items-center gap-2">
              <FaHistory className="text-primary" /> Session History
            </h1>
            <p className="text-sm text-darkwood mt-1">All saved credit builder sessions and analysis states.</p>
          </div>

          {loading ? (
            <div className="frosted-glass rounded-2xl p-6 shadow-xl text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
              <p className="text-sm text-darkwood mt-3">Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="frosted-glass rounded-2xl p-6 shadow-xl text-center">
              <p className="text-secondary font-semibold">No sessions found</p>
              <p className="text-sm text-darkwood mt-1 mb-4">Create your first session in Credit Builder.</p>
              <Link href="/credit-builder" className="bg-primary hover:bg-amber text-white px-5 py-2 rounded-lg font-semibold text-sm">
                Start Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const updated = session.updatedAt?.seconds
                  ? new Date(session.updatedAt.seconds * 1000).toLocaleString()
                  : 'Recently';
                const score = session.analysis?.rawResult?.credit_summary?.current_score ?? session.creditReport?.scoreSnapshot ?? '—';

                return (
                  <div key={session.id} className="frosted-glass rounded-xl p-4 border border-accent/30 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-darkwood">Session ID</p>
                        <p className="text-sm font-semibold text-secondary">{session.id}</p>
                        <p className="text-xs text-darkwood mt-1">Updated: {updated}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold uppercase tracking-wide">
                          {session.status || 'draft'}
                        </span>
                        <p className="text-2xl font-black text-secondary mt-2">{score}</p>
                        <p className="text-xs text-darkwood">Score</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
