'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBolt, FaChartLine, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

interface AnalysisRecord {
  id: string;
  score: number | null;
  projectedScore: number | null;
  scoreBand: string | null;
  goalType: string | null;
  riskAlerts: string[];
  createdAt: { seconds: number } | null;
}

interface AnalysisHistoryProps {
  userId: string;
}

export default function AnalysisHistory({ userId }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAnalyses = async () => {
      setAnalysesLoading(true);
      try {
        const q = query(
          collection(db, 'creditAnalysisResults'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        if (!active) return;

        const rows: AnalysisRecord[] = snap.docs.map((d) => ({
          id: d.id,
          score: d.data().score ?? null,
          projectedScore: d.data().projectedScore ?? null,
          scoreBand: d.data().scoreBand ?? null,
          goalType: d.data().goalType ?? null,
          riskAlerts: d.data().riskAlerts ?? [],
          createdAt: d.data().createdAt ?? null,
        }));

        setAnalyses(rows);
      } catch (e) {
        console.error('Failed to load analyses:', e);
      } finally {
        if (active) setAnalysesLoading(false);
      }
    };

    void loadAnalyses();
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="frosted-glass rounded-2xl p-8 shadow-xl mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary font-serif flex items-center gap-2">
          <FaChartLine className="text-primary" /> Credit Analysis History
        </h2>
        <Link
          href="/credit-builder"
          className="text-sm text-primary font-semibold flex items-center gap-1 hover:text-secondary transition-colors"
        >
          New Analysis <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {analysesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-accent/60 rounded-xl">
          <FaChartLine className="text-4xl text-accent mx-auto mb-3" />
          <p className="text-secondary font-semibold">No analyses yet</p>
          <p className="text-sm text-darkwood mt-1 mb-4">Upload a credit report to get your first AI-powered analysis.</p>
          <Link
            href="/credit-builder"
            className="inline-block bg-primary hover:bg-secondary text-white text-sm font-bold px-5 py-2 rounded-lg transition-all"
          >
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const date = analysis.createdAt?.seconds
              ? new Date(analysis.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently';

            const scoreColor =
              (analysis.score ?? 0) >= 740
                ? 'text-primary'
                : (analysis.score ?? 0) >= 670
                ? 'text-amber'
                : 'text-secondary';

            const goalLabel: Record<string, string> = {
              buy_home: 'Buy a Home',
              finance_car: 'Finance a Car',
              premium_card: 'Premium Card',
              rent_apartment: 'Rent Apartment',
              business_funding: 'Business Funding',
              improve_score: 'Improve Score',
            };

            return (
              <div key={analysis.id} className="bg-white/70 border border-accent/40 rounded-xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-4xl font-black tabular-nums ${scoreColor}`}>{analysis.score ?? '—'}</div>
                      <div className="text-xs text-darkwood/60 font-medium">{analysis.scoreBand ?? 'Score'}</div>
                    </div>
                    {analysis.projectedScore && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-2xl font-bold text-primary/70">
                          <FaBolt className="text-sm" />
                          {analysis.projectedScore}
                        </div>
                        <div className="text-xs text-darkwood/60 font-medium">6-mo target</div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                      {analysis.goalType ? goalLabel[analysis.goalType] ?? analysis.goalType : 'General'}
                    </div>
                    <div className="text-xs text-darkwood/60 block">{date}</div>
                  </div>
                </div>

                {analysis.riskAlerts.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {analysis.riskAlerts.slice(0, 2).map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-xs text-secondary bg-accent/20 rounded-lg px-3 py-1.5"
                      >
                        <FaExclamationTriangle className="text-primary flex-shrink-0 mt-0.5" />
                        {alert}
                      </div>
                    ))}
                    {analysis.riskAlerts.length > 2 && (
                      <p className="text-xs text-darkwood/50 pl-1">+{analysis.riskAlerts.length - 2} more alerts in full report</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-1.5">
                    <FaCheckCircle className="flex-shrink-0" /> No risk alerts detected
                  </div>
                )}
              </div>
            );
          })}

          {analyses.length === 5 && (
            <p className="text-center text-xs text-darkwood/50 pt-1">Showing 5 most recent analyses</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
