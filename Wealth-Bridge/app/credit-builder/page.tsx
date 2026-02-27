'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt, FaFileAlt,
  FaShieldAlt, FaLink, FaTimes, FaHome, FaCar, FaBuilding, FaBriefcase,
  FaChartLine, FaChevronDown, FaChevronUp, FaArrowRight, FaLock,
  FaDollarSign, FaUserTie, FaMoneyBillWave, FaBolt, FaCheck,
} from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { getCreditScore } from '@/lib/creditService';
import { addPoints } from '@/lib/gamificationService';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type GoalType = 'buy_home' | 'finance_car' | 'premium_card' | 'rent_apartment' | 'business_funding' | 'improve_score';

interface FinancialContext {
  occupation: string;
  annualIncome: string;
  monthlyDebt: string;
  rentMortgage: string;
  totalCreditLimit: string;
  savings: string;
  selfEmployed: boolean;
}

interface FactorData {
  current: number;
  ideal: number;
  impact_level: string;
  estimated_score_gain: string;
  recommendation: string;
}

interface AiResult {
  credit_summary: { current_score: number; score_band: string; projected_score: number; projection_timeline_months: number };
  factor_analysis: Record<string, FactorData>;
  goal_alignment: { readiness_score_percent: number; dti_percent?: number | null; notes?: string };
  risk_alerts: string[];
  action_plan: Array<{ phase: string; steps: string[] }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = [
  { type: 'buy_home' as GoalType, label: 'Buy a Home', icon: FaHome, gradient: 'from-primary to-secondary' },
  { type: 'finance_car' as GoalType, label: 'Finance a Car', icon: FaCar, gradient: 'from-darkwood to-secondary' },
  { type: 'premium_card' as GoalType, label: 'Premium Credit Card', icon: FaCreditCard, gradient: 'from-amber to-primary' },
  { type: 'rent_apartment' as GoalType, label: 'Rent an Apartment', icon: FaBuilding, gradient: 'from-secondary to-darkwood' },
  { type: 'business_funding' as GoalType, label: 'Business Funding', icon: FaBriefcase, gradient: 'from-primary to-darkwood' },
  { type: 'improve_score' as GoalType, label: 'Improve Score Generally', icon: FaChartLine, gradient: 'from-accent to-amber' },
];

const DEADLINES = [
  { value: '3', label: '3 Months', sublabel: 'Urgent' },
  { value: '6', label: '6 Months', sublabel: 'Standard' },
  { value: '12', label: '12 Months', sublabel: 'Comfortable' },
  { value: 'flexible', label: 'Flexible', sublabel: 'No rush' },
];

const FACTOR_LABELS: Record<string, string> = {
  payment_history: 'Payment History',
  utilization: 'Credit Utilization',
  credit_age: 'Credit Age',
  credit_mix: 'Credit Mix',
  new_credit: 'New Credit',
};

const FACTOR_WEIGHTS: Record<string, number> = {
  payment_history: 35,
  utilization: 30,
  credit_age: 15,
  credit_mix: 10,
  new_credit: 10,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreditBuilderPage() {
  const { user } = useAuth();

  // Stage: 1=Goal Capture, 2=Credit Access, 3=Financial Context, 4=Dashboard
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1 – Goal
  const [goalType, setGoalType] = useState<GoalType | ''>('');
  const [targetScore, setTargetScore] = useState('720');
  const [deadlineMonths, setDeadlineMonths] = useState('');
  const [majorApplications, setMajorApplications] = useState('');

  // Stage 2 – Credit Access
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [reportFileName, setReportFileName] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<{
    score?: number; positives: string[]; warnings: string[]; recommendations: string[];
  } | null>(null);
  const [reportUploadId, setReportUploadId] = useState<string | null>(null);
  const [softPullLoading, setSoftPullLoading] = useState(false);
  const [softPullStatus, setSoftPullStatus] = useState<string | null>(null);
  const [firebaseWarning, setFirebaseWarning] = useState<string | null>(null);

  // Stage 3 – Financial context
  const [financialContext, setFinancialContext] = useState<FinancialContext>({
    occupation: '', annualIncome: '', monthlyDebt: '', rentMortgage: '',
    totalCreditLimit: '', savings: '', selfEmployed: false,
  });

  // Dashboard
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [llmAdvice, setLlmAdvice] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>('Month 1-2');
  const [creditScore, setCreditScore] = useState(680);
  const [analysisSaved, setAnalysisSaved] = useState(false);

  const uploadRef = useRef<HTMLDivElement | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const displayScore = aiResult?.credit_summary?.current_score ?? reportAnalysis?.score ?? creditScore;
  const projectedScore = aiResult?.credit_summary?.projected_score ?? null;
  const scoreBand =
    aiResult?.credit_summary?.score_band ??
    (displayScore >= 800 ? 'Exceptional' : displayScore >= 740 ? 'Very Good' : displayScore >= 670 ? 'Good' : displayScore >= 580 ? 'Fair' : 'Poor');
  const modeLabel = displayScore < 580 ? 'Rebuild Mode' : displayScore > 760 ? 'Optimization Mode' : 'Build Mode';

  const dtiPct =
    aiResult?.goal_alignment?.dti_percent ??
    (() => {
      const monthly = parseFloat(financialContext.annualIncome) / 12;
      const debt = parseFloat(financialContext.monthlyDebt);
      if (monthly > 0 && !isNaN(debt)) return Math.round((debt / monthly) * 100);
      return null;
    })();

  const readinessPct = aiResult?.goal_alignment?.readiness_score_percent ?? null;

  function getScoreColor(s: number) {
    if (s >= 740) return 'text-accent';
    if (s >= 670) return 'text-amber';
    if (s >= 580) return 'text-amber';
    return 'text-red-300';
  }

  function getImpactColor(level: string) {
    if (level === 'High') return 'text-red-600 bg-red-50 border-red-200';
    if (level === 'Medium') return 'text-darkwood bg-amber/20 border-amber';
    return 'text-primary bg-primary/10 border-primary/30';
  }

  function getFactorBarColor(current: number, ideal: number) {
    if (current >= ideal) return 'bg-primary';
    if (current >= ideal * 0.6) return 'bg-amber';
    return 'bg-secondary';
  }

  // ── Load credit score from Firebase ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const result = await getCreditScore(user.uid);
      if ((result as any).warning) setFirebaseWarning((result as any).warning);
      if (result.success && result.data) setCreditScore(result.data.currentScore);
    };
    load().catch(console.error);
  }, [user]);

  // ── PDF extraction ────────────────────────────────────────────────────────
  const extractPdfText = async (file: File) => {
    const pdfjs = await import('pdfjs-dist');
    const pdfjsLib: any = pdfjs;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    let text = '';
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      text += content.items.map((i: any) => i.str).join(' ') + '\n';
    }
    return text;
  };

  // ── Basic local report analysis ────────────────────────────────────────────
  const analyzeReportText = (text: string) => {
    const n = text.replace(/\s+/g, ' ').toLowerCase();
    const positives: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const scoreMatch = n.match(/(?:credit score|score)\D{0,12}(\d{3})/);
    const score = scoreMatch ? Number(scoreMatch[1]) : undefined;
    const utilMatch = n.match(/utilization\D{0,10}(\d{1,3})%/);
    if (utilMatch) {
      const u = Number(utilMatch[1]);
      if (u > 30) { warnings.push(`High utilization detected: ${u}%.`); recommendations.push('Pay down balances below 30%.'); }
      else positives.push(`Utilization is healthy at ${u}%.`);
    }
    if (/late payment|past due|30 day|60 day|90 day/.test(n)) {
      warnings.push('Late or past-due payments detected.'); recommendations.push('Set up autopay to avoid missed payments.');
    } else { positives.push('No late payment indicators found.'); }
    if (/collection|charge[- ]?off|bankrupt|foreclosure/.test(n)) {
      warnings.push('Derogatory marks detected.'); recommendations.push('Dispute inaccuracies and negotiate settlements where possible.');
    }
    if (typeof score === 'number') {
      if (score >= 740) positives.push(`Score ${score} — Very Good range.`);
      else if (score >= 670) { positives.push(`Score ${score} — Good range.`); recommendations.push('Lower utilization to reach Very Good.'); }
      else { warnings.push(`Score ${score} — needs improvement.`); recommendations.push('Pay on time and reduce balances to build momentum.'); }
    }
    return { score, positives, warnings, recommendations };
  };

  // ── Process uploaded file ─────────────────────────────────────────────────
  const processReportFile = async (file: File) => {
    if (!user) { setReportError('Please log in first.'); return; }
    setReportError(null);
    setReportAnalysis(null);
    setReportText(null);
    setReportLoading(true);
    setReportFileName(file.name);
    setReportUploadId(null);
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
        text = await extractPdfText(file);
      else text = await file.text();
      if (!text || text.trim().length < 50) throw new Error('Report looks empty. Try a full PDF or TXT export.');
      const trimmed = text.trim();
      setReportText(trimmed);
      const analysis = analyzeReportText(trimmed);
      setReportAnalysis(analysis);
      // Save report metadata to Firestore (no raw-file upload — avoids browser CORS)
      const docRef = await addDoc(collection(db, 'creditReports'), {
        userId: user.uid, fileName: file.name, score: analysis.score ?? null, createdAt: serverTimestamp(),
      });
      setReportUploadId(docRef.id);
      await addDoc(collection(db, 'creditReportAnalyses'), { reportId: docRef.id, analysis, createdAt: serverTimestamp() });
      // Advance to Stage 3 — full AI runs after financial context is collected
      setStage(3);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Could not read this report. Try PDF or TXT format.';
      setReportError(msg);
    } finally {
      setReportLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!user) { setReportError('Please log in before uploading.'); return; }
    if (!agreementAccepted) { setShowAgreement(true); return; }
    processReportFile(file);
  };

  // ── AI analysis – called after Stage 3 ───────────────────────────────────
  const runAiAnalysis = async () => {
    if (!reportText) { setLlmError('Upload a report first.'); return; }
    setLlmLoading(true);
    setLlmError(null);
    setAiResult(null);
    setLlmAdvice(null);
    try {
      const resp = await fetch('/api/credit-report-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: reportText.slice(0, 12000),
          score: reportAnalysis?.score ?? null,
          reportId: reportUploadId,
          userId: user?.uid ?? null,
          profile: { goalType, targetScore, deadlineMonths, majorApplications },
          financialContext,
        }),
      });
      if (!resp.ok) throw new Error('AI analysis failed. Please try again.');
      const data = await resp.json();
      if (data.result) {
        const parsed = data.result as AiResult;
        setAiResult(parsed);
        if (user) {
          try {
            await addDoc(collection(db, 'creditAnalysisResults'), {
              userId: user.uid,
              reportId: reportUploadId ?? null,
              goalType,
              targetScore,
              deadlineMonths,
              score: parsed.credit_summary?.current_score ?? null,
              projectedScore: parsed.credit_summary?.projected_score ?? null,
              scoreBand: parsed.credit_summary?.score_band ?? null,
              riskAlerts: parsed.risk_alerts ?? [],
              result: parsed,
              createdAt: serverTimestamp(),
            });
            setAnalysisSaved(true);
          } catch (saveErr) {
            console.error('Failed to save analysis to Firestore:', saveErr);
          }
          addPoints(user.uid, 100).catch(console.error);
        }
      }
      if (data.advice) setLlmAdvice(data.advice);
      setStage(4);
    } catch (err) {
      setLlmError(err instanceof Error ? err.message : 'Could not run analysis. Please try again.');
    } finally {
      setLlmLoading(false);
    }
  };

  const requestSoftPull = async () => {
    if (!user) { setSoftPullStatus('Please log in to request a soft pull.'); return; }
    setSoftPullLoading(true);
    setSoftPullStatus(null);
    try {
      const resp = await fetch('/api/credit-soft-pull', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Soft pull failed.');
      setSoftPullStatus(data?.message || 'Request submitted.');
    } catch {
      setSoftPullStatus('Soft pull requires bureau integration. Feature coming soon.');
    } finally {
      setSoftPullLoading(false);
    }
  };

  const handleReset = () => {
    setStage(1);
    setGoalType('');
    setDeadlineMonths('');
    setTargetScore('720');
    setMajorApplications('');
    setAiResult(null);
    setLlmAdvice(null);
    setReportText(null);
    setReportAnalysis(null);
    setReportFileName(null);
    setReportError(null);
    setAnalysisSaved(false);
    setFinancialContext({ occupation: '', annualIncome: '', monthlyDebt: '', rentMortgage: '', totalCreditLimit: '', savings: '', selfEmployed: false });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* ── Agreement Modal ── */}
        <AnimatePresence>
          {showAgreement && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative"
              >
                <button
                  onClick={() => setShowAgreement(false)}
                  className="absolute top-4 right-4 text-darkwood hover:text-secondary"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaLock className="text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary font-serif">Data Use Agreement</h2>
                </div>
                <div className="space-y-3 text-sm text-darkwood max-h-56 overflow-y-auto pr-1">
                  <p>By uploading, you confirm you have the legal right to share this report and the information is accurate.</p>
                  <p>
                    You authorize WealthBridge to store your file in Firebase and analyze it with AI tools.
                    We do not sell your data. Deletion can be requested at any time via support.
                  </p>
                  <p>
                    This analysis is for <strong>educational purposes only</strong> and is not financial, legal, or credit repair advice.
                  </p>
                  <p className="font-semibold text-secondary">No hard inquiry will be made against your credit.</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreementAccepted}
                      onChange={e => setAgreementAccepted(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-secondary">
                      I agree —{' '}
                      <Link href="/terms" className="underline" target="_blank" rel="noreferrer">
                        Terms &amp; Conditions
                      </Link>
                    </span>
                  </label>
                  <button
                    onClick={() => setShowAgreement(false)}
                    disabled={!agreementAccepted}
                    className="bg-primary disabled:opacity-50 hover:bg-amber text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
            <FaBolt className="text-[10px]" />
            <span>Credit Strategy Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary font-serif mb-2">AI Credit Optimizer</h1>
          <p className="text-darkwood max-w-xl mx-auto text-sm">
            Goal-driven credit strategy — aligned to your timeline, risk profile, and objectives.
          </p>
        </motion.div>

        {/* ── Stage Progress Indicator (stages 1–3 only) ── */}
        {stage < 4 && (
          <div className="flex items-center justify-center mb-10">
            {[
              { n: 1 as const, label: 'Goal' },
              { n: 2 as const, label: 'Credit Access' },
              { n: 3 as const, label: 'Financials' },
            ].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      stage === n
                        ? 'bg-primary text-white shadow-lg ring-4 ring-primary/20'
                        : stage > n
                        ? 'bg-secondary text-white'
                        : 'bg-accent/40 text-darkwood'
                    }`}
                  >
                    {stage > n ? <FaCheck className="text-xs" /> : n}
                  </div>
                  <span
                    className={`text-[11px] mt-1 font-semibold ${
                      stage === n ? 'text-primary' : stage > n ? 'text-secondary' : 'text-darkwood/50'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`h-0.5 w-14 md:w-24 mx-1 mb-4 ${stage > n ? 'bg-secondary' : 'bg-accent/40'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* STAGE 1 — Goal Capture                                               */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {stage === 1 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Goal Cards */}
            <div className="frosted-glass rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-secondary font-serif mb-1">What&apos;s your credit goal?</h2>
              <p className="text-sm text-darkwood mb-6">
                Your entire strategy will be personalised to your specific objective and urgency.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GOALS.map(({ type, label, icon: Icon, gradient }) => (
                  <button
                    key={type}
                    onClick={() => setGoalType(type)}
                    className={`group relative rounded-2xl p-5 border-2 text-left transition-all duration-200 overflow-hidden ${
                      goalType === type
                        ? 'border-primary shadow-lg scale-[1.02]'
                        : 'border-amber/50 hover:border-primary/60 hover:scale-[1.01] bg-white/60'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity ${
                        goalType === type ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'
                      }`}
                    />
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
                      <Icon className="text-white text-lg" />
                    </div>
                    <span className="text-sm font-semibold text-secondary leading-snug">{label}</span>
                    {goalType === type && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <FaCheck className="text-white text-[9px]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Score + Applications */}
            <div className="frosted-glass rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-secondary font-serif mb-5">Set your targets</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">Target Credit Score</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range" min={580} max={850} step={5}
                      value={targetScore || 720}
                      onChange={e => setTargetScore(e.target.value)}
                      className="flex-1 accent-primary h-2"
                    />
                    <span className="text-2xl font-black text-primary w-14 text-center">{targetScore || 720}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-darkwood mt-1.5">
                    <span>580 — Fair</span><span>720 — Good</span><span>850 — Exceptional</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Planned major applications in next 6–12 months?
                  </label>
                  <select
                    value={majorApplications}
                    onChange={e => setMajorApplications(e.target.value)}
                    className="w-full border border-amber rounded-xl px-3 py-2.5 bg-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes — mortgage, auto, or business loan</option>
                    <option value="no">No major applications planned</option>
                    <option value="unsure">Not sure yet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="frosted-glass rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-secondary font-serif mb-4">When do you need this?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DEADLINES.map(({ value, label, sublabel }) => (
                  <button
                    key={value}
                    onClick={() => setDeadlineMonths(value)}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      deadlineMonths === value
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-amber/40 bg-white/60 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-bold text-secondary">{label}</div>
                    <div className="text-[11px] text-darkwood mt-0.5">{sublabel}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStage(2)}
                disabled={!goalType || !deadlineMonths}
                className="flex items-center space-x-2 bg-primary hover:bg-amber disabled:opacity-40 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg text-sm"
              >
                <span>Next: Credit Access</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* STAGE 2 — Credit Access                                              */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {stage === 2 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!user && (
              <div className="frosted-glass rounded-2xl p-6 text-center">
                <p className="text-darkwood mb-3">Log in to securely upload and track your credit data.</p>
                <a href="/login" className="inline-block bg-primary hover:bg-amber text-white font-bold py-2 px-6 rounded-lg transition-all">
                  Log In
                </a>
              </div>
            )}
            {firebaseWarning && (
              <div className="rounded-xl border border-amber bg-white/80 px-4 py-3 text-sm text-secondary">
                {firebaseWarning}
              </div>
            )}

            {/* Consent strip */}
            <div
              className={`frosted-glass rounded-2xl p-5 border-2 transition-all ${
                agreementAccepted ? 'border-primary/50 bg-primary/5' : 'border-amber'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      agreementAccepted ? 'bg-primary' : 'bg-amber/20'
                    }`}
                  >
                    {agreementAccepted
                      ? <FaCheck className="text-white text-xs" />
                      : <FaLock className="text-amber text-xs" />}
                  </div>
                  <div>
                    <div className="font-semibold text-secondary text-sm">
                      {agreementAccepted ? '✓ Agreement accepted' : 'Step 1 — Review & accept data agreement'}
                    </div>
                    <div className="text-xs text-darkwood mt-0.5">
                      No hard inquiry · Data encrypted in Firebase · AI advice disclaimer applies
                    </div>
                  </div>
                </div>
                {!agreementAccepted && (
                  <button
                    onClick={() => setShowAgreement(true)}
                    className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber transition-all"
                  >
                    Review Agreement
                  </button>
                )}
              </div>
            </div>

            {/* Upload + Soft Pull side by side */}
            <div className="grid md:grid-cols-2 gap-6" ref={uploadRef}>
              {/* Upload Report */}
              <div className="frosted-glass rounded-2xl p-6 border border-amber/40">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FaCloudUploadAlt className="text-primary text-lg" />
                  </div>
                  <div>
                    <div className="font-bold text-secondary text-sm">Upload Credit Report</div>
                    <div className="text-xs text-darkwood">PDF, TXT or CSV — stored securely in Firebase</div>
                  </div>
                </div>

                <label
                  className={`block relative cursor-pointer ${!agreementAccepted ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="border-2 border-dashed border-amber/60 hover:border-primary rounded-xl p-7 text-center transition-all bg-white/60 hover:bg-white/80">
                    {reportLoading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-9 w-9 border-4 border-primary border-t-transparent mb-2" />
                        <span className="text-sm text-darkwood">Uploading &amp; analyzing…</span>
                      </div>
                    ) : reportFileName ? (
                      <div className="flex items-center justify-center space-x-2 text-primary text-sm">
                        <FaFileAlt />
                        <span className="font-medium">{reportFileName}</span>
                        <FaCheckCircle className="text-primary" />
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="text-4xl text-primary/40 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-secondary">Click or drag to upload</div>
                        <div className="text-xs text-darkwood mt-1">PDF · TXT · CSV</div>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.txt,.csv"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </label>

                {!agreementAccepted && (
                  <button
                    onClick={() => setShowAgreement(true)}
                    className="mt-2 text-xs text-primary underline"
                  >
                    Accept agreement to enable upload
                  </button>
                )}
                {reportError && <div className="mt-3 text-sm text-red-600">{reportError}</div>}

                {/* Free report links */}
                <div className="mt-5 pt-4 border-t border-amber/30">
                  <div className="text-xs font-bold text-secondary mb-2 uppercase tracking-wide">Get a free report:</div>
                  {[
                    ['AnnualCreditReport.com (official)', 'https://www.annualcreditreport.com/'],
                    ['Experian Free Report', 'https://www.experian.com/'],
                    ['Equifax Free Report', 'https://www.equifax.com/personal/credit-report-services/free-credit-reports/'],
                    ['TransUnion Free Report', 'https://www.transunion.com/'],
                  ].map(([name, url]) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 text-xs text-primary hover:underline mb-1.5"
                    >
                      <FaLink className="text-[10px]" />
                      <span>{name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Soft Pull */}
              <div className="frosted-glass rounded-2xl p-6 flex flex-col justify-between border border-amber/40">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
                      <FaShieldAlt className="text-secondary text-lg" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary text-sm">Soft Pull Credit Check</div>
                      <div className="text-xs text-darkwood">No impact to your credit score</div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-darkwood mb-5">
                    {[
                      'No hard inquiry — score is not affected',
                      'Instant bureau score retrieval',
                      'Requires Experian API integration',
                    ].map(item => (
                      <li key={item} className="flex items-center space-x-2">
                        <FaCheck className="text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {softPullStatus && (
                    <div className="text-xs text-darkwood bg-white/80 rounded-lg p-2.5 border border-amber/40 mb-3">
                      {softPullStatus}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={requestSoftPull}
                    disabled={softPullLoading || !user}
                    className="w-full bg-secondary hover:bg-darkwood disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all"
                  >
                    {softPullLoading ? 'Requesting…' : 'Request Soft Pull'}
                  </button>
                  <p className="text-[10px] text-darkwood/50 text-center mt-2">Bureau integration in progress — coming soon</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStage(1)} className="text-sm text-darkwood hover:text-secondary">
                ← Back to Goal
              </button>
              {reportAnalysis && (
                <button
                  onClick={() => setStage(3)}
                  className="flex items-center space-x-2 bg-primary hover:bg-amber text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg text-sm"
                >
                  <span>Next: Financial Context</span>
                  <FaArrowRight />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* STAGE 3 — Financial Context                                          */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {stage === 3 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="frosted-glass rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-secondary font-serif mb-1">Financial Context</h2>
              <p className="text-sm text-darkwood mb-6">
                This powers your DTI calculation, utilization modeling, and approval readiness score. All fields are optional
                but improve accuracy.
              </p>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { field: 'occupation', label: 'Occupation / Job Title', icon: FaUserTie, type: 'text', placeholder: 'e.g. Software Engineer' },
                  { field: 'annualIncome', label: 'Annual Gross Income ($)', icon: FaDollarSign, type: 'number', placeholder: 'e.g. 65000' },
                  { field: 'monthlyDebt', label: 'Total Monthly Debt Payments ($)', icon: FaMoneyBillWave, type: 'number', placeholder: 'e.g. 800' },
                  { field: 'rentMortgage', label: 'Rent / Mortgage ($/month)', icon: FaBuilding, type: 'number', placeholder: 'e.g. 1500' },
                  { field: 'totalCreditLimit', label: 'Total Credit Limits ($)', icon: FaCreditCard, type: 'number', placeholder: 'e.g. 12000' },
                  { field: 'savings', label: 'Savings / Emergency Fund ($)', icon: FaDollarSign, type: 'number', placeholder: 'e.g. 3000' },
                ].map(({ field, label, icon: Icon, type, placeholder }) => (
                  <label key={field} className="block">
                    <span className="flex items-center space-x-1.5 text-sm font-semibold text-secondary mb-1.5">
                      <Icon className="text-primary text-xs" />
                      <span>{label}</span>
                    </span>
                    <input
                      type={type}
                      value={(financialContext as any)[field]}
                      placeholder={placeholder}
                      onChange={e => setFinancialContext(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full border border-amber rounded-xl px-3 py-2.5 bg-white/80 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </label>
                ))}
              </div>

              <label className="flex items-center space-x-3 mt-5 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={financialContext.selfEmployed}
                  onChange={e => setFinancialContext(prev => ({ ...prev, selfEmployed: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-secondary font-semibold">I am self-employed / freelancer</span>
              </label>

              {/* Live DTI Preview */}
              {financialContext.annualIncome && financialContext.monthlyDebt && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-white/70 border border-amber/50"
                >
                  <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Live DTI Preview</div>
                  {(() => {
                    const monthly = parseFloat(financialContext.annualIncome) / 12;
                    const debt = parseFloat(financialContext.monthlyDebt);
                    const dti = monthly > 0 && !isNaN(debt) ? Math.round((debt / monthly) * 100) : 0;
                    const barColor = dti < 28 ? 'bg-primary' : dti < 43 ? 'bg-amber' : 'bg-red-400';
                    const statusLabel = dti < 28 ? 'Excellent' : dti < 36 ? 'Good' : dti < 43 ? 'Manageable' : 'High Risk';
                    const textColor = dti < 28 ? 'text-primary' : dti < 36 ? 'text-amber' : dti < 43 ? 'text-darkwood' : 'text-red-600';
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-darkwood font-medium">Debt-to-Income Ratio</span>
                          <span className={`text-sm font-bold ${textColor}`}>{dti}% — {statusLabel}</span>
                        </div>
                        <div className="w-full bg-accent/20 rounded-full h-3">
                          <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${Math.min(dti, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-darkwood mt-1.5">
                          <span>Ideal: &lt;28%</span><span>Lender max: 43%</span>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStage(2)} className="text-sm text-darkwood hover:text-secondary">
                ← Back to Credit Access
              </button>
              <button
                onClick={runAiAnalysis}
                disabled={llmLoading}
                className="flex items-center space-x-2 bg-primary hover:bg-amber disabled:opacity-50 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg text-sm"
              >
                {llmLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Running Analysis…</span>
                  </>
                ) : (
                  <>
                    <FaBolt />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
            {llmError && <div className="text-sm text-red-600 text-center">{llmError}</div>}
          </motion.div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* STAGE 4 — Dashboard                                                  */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {stage === 4 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* ── Save confirmation banner ── */}
            <AnimatePresence>
              {analysisSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-xl px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-primary text-lg flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-secondary">Analysis saved to your profile</p>
                      <p className="text-xs text-darkwood">Stored in Firebase under your account · +100 XP awarded</p>
                    </div>
                  </div>
                  <button onClick={() => setAnalysisSaved(false)} className="text-darkwood/50 hover:text-secondary">
                    <FaTimes className="text-sm" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">{modeLabel}</span>
                <span className="text-xs text-darkwood hidden md:block">
                  Goal: {GOALS.find(g => g.type === goalType)?.label ?? 'General'} ·
                  Deadline: {deadlineMonths === 'flexible' ? 'Flexible' : `${deadlineMonths} months`} ·
                  Target: {targetScore}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-darkwood hover:text-secondary flex items-center space-x-1"
              >
                <FaTimes className="text-xs" /><span>Start Over</span>
              </button>
            </div>

            {/* ── Section 1: Score Header ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 shadow-2xl bg-gradient-to-br from-secondary via-primary to-amber text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Current score */}
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Current Score</div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                    className={`text-8xl font-black tabular-nums ${getScoreColor(displayScore)}`}
                  >
                    {displayScore}
                  </motion.div>
                  <div className="text-white/90 font-semibold mt-1">{scoreBand}</div>
                  <div className="text-white/50 text-xs mt-0.5">Range: 300 – 850</div>
                </div>
                {/* Projected */}
                {projectedScore && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center min-w-[160px]">
                    <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Projected Score</div>
                    <div className="text-5xl font-black text-white">{projectedScore}</div>
                    <div className="text-white/70 text-sm mt-1">
                      in {aiResult?.credit_summary?.projection_timeline_months ?? 6} months
                    </div>
                    <div className="text-accent font-bold mt-1">
                      +{projectedScore - displayScore} pts potential
                    </div>
                  </div>
                )}
                {/* Goal card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 min-w-[150px]">
                  <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Strategy Target</div>
                  <div className="font-bold text-white text-sm">
                    {GOALS.find(g => g.type === goalType)?.label ?? 'Score Improvement'}
                  </div>
                  <div className="text-white/60 text-xs mt-1.5">Target score: <span className="text-white font-semibold">{targetScore}</span></div>
                  <div className="text-white/60 text-xs mt-0.5">
                    Deadline: <span className="text-white font-semibold">
                      {deadlineMonths === 'flexible' ? 'Flexible' : `${deadlineMonths} months`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Section 2: Credit Factor Breakdown ── */}
            <div className="frosted-glass rounded-2xl p-7 shadow-xl">
              <h3 className="text-xl font-bold text-secondary font-serif mb-5">Credit Factor Analysis</h3>
              <div className="space-y-4">
                {(
                  aiResult?.factor_analysis
                    ? Object.entries(aiResult.factor_analysis)
                    : ([
                        ['payment_history', { current: 85, ideal: 100, impact_level: 'High', estimated_score_gain: '0 points', recommendation: 'Keep paying on time every month.' }],
                        ['utilization', { current: 55, ideal: 30, impact_level: 'High', estimated_score_gain: '20-40 points', recommendation: 'Reduce total balances below 30% of your credit limits.' }],
                        ['credit_age', { current: 60, ideal: 80, impact_level: 'Medium', estimated_score_gain: '5-10 points', recommendation: 'Keep your oldest accounts open and active.' }],
                        ['credit_mix', { current: 70, ideal: 70, impact_level: 'Low', estimated_score_gain: '0 points', recommendation: 'Your credit mix looks diverse — maintain it.' }],
                        ['new_credit', { current: 80, ideal: 80, impact_level: 'Low', estimated_score_gain: '0 points', recommendation: 'Limit new credit applications to avoid inquiry stacking.' }],
                      ] as [string, FactorData][])
                ).map(([key, data]: [string, FactorData], idx: number) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="p-4 bg-white/70 rounded-xl border border-amber/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-secondary text-sm">{FACTOR_LABELS[key] ?? key}</span>
                        <span className="text-[10px] text-darkwood/60">({FACTOR_WEIGHTS[key] ?? 0}% of score)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {data.estimated_score_gain && !data.estimated_score_gain.startsWith('0') && (
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                            +{data.estimated_score_gain}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getImpactColor(data.impact_level)}`}>
                          {data.impact_level} Impact
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1 bg-accent/20 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.current}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.07 }}
                          className={`h-2.5 rounded-full ${getFactorBarColor(data.current, data.ideal)}`}
                        />
                      </div>
                      <span className="text-xs text-secondary font-bold w-10 text-right">{data.current}%</span>
                      <span className="text-[10px] text-darkwood w-14">ideal: {data.ideal}%</span>
                    </div>
                    <p className="text-xs text-darkwood">
                      <span className="font-semibold text-secondary">AI Insight:</span> {data.recommendation}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Section 3: Goal Readiness + DTI ── */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Goal Readiness */}
              <div className="frosted-glass rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-secondary font-serif mb-4">Goal Readiness</h3>
                {readinessPct !== null ? (
                  <>
                    <div className="relative w-40 h-40 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
                        <motion.circle
                          cx="18" cy="18" r="15.5" fill="none"
                          stroke={readinessPct >= 70 ? '#C85C0E' : readinessPct >= 45 ? '#FFAC4A' : '#ef4444'}
                          strokeWidth="3.5"
                          strokeDasharray={`${readinessPct} 100`}
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 100' }}
                          animate={{ strokeDasharray: `${readinessPct} 100` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-secondary">{readinessPct}%</span>
                        <span className="text-xs text-darkwood font-medium mt-0.5">Ready</span>
                      </div>
                    </div>
                    <p className="text-sm text-darkwood text-center">
                      {aiResult?.goal_alignment?.notes ?? 'Follow the action plan below to improve your readiness score.'}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-center">
                      {[['<45%', 'Build First', 'bg-secondary/10 text-secondary'], ['45–70%', 'Almost Ready', 'bg-amber/20 text-darkwood'], ['>70%', 'Ready', 'bg-primary/10 text-primary']].map(([range, label, cls]) => (
                        <div key={range} className={`rounded-lg p-1.5 ${cls}`}>
                          <div className="font-bold">{range}</div>
                          <div>{label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-darkwood py-4 text-center">Readiness score computed from AI analysis.</div>
                )}
              </div>

              {/* DTI Indicator */}
              <div className="frosted-glass rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-secondary font-serif mb-4">DTI Indicator</h3>
                {dtiPct !== null ? (
                  <>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-xs text-darkwood mb-1">Debt-to-Income Ratio</div>
                        <span
                          className={`text-4xl font-black ${
                            dtiPct >= 43 ? 'text-red-500' : dtiPct >= 36 ? 'text-amber' : 'text-primary'
                          }`}
                        >
                          {dtiPct}%
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          dtiPct >= 43 ? 'bg-red-100 text-red-700' : dtiPct >= 36 ? 'bg-amber/20 text-darkwood' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {dtiPct < 28 ? 'Excellent' : dtiPct < 36 ? 'Good' : dtiPct < 43 ? 'Manageable' : 'High Risk'}
                      </span>
                    </div>
                    <div className="w-full bg-accent/20 rounded-full h-3 mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(dtiPct, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-3 rounded-full ${dtiPct >= 43 ? 'bg-red-400' : dtiPct >= 36 ? 'bg-amber' : 'bg-primary'}`}
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-darkwood">
                      <div className="flex justify-between"><span>Ideal (best rates)</span><span className="font-semibold text-primary">&lt; 28%</span></div>
                      <div className="flex justify-between"><span>Lender maximum</span><span className="font-semibold text-amber">43%</span></div>
                      <div className="flex justify-between"><span>Your ratio</span><span className={`font-bold ${dtiPct >= 43 ? 'text-red-600' : dtiPct >= 36 ? 'text-amber' : 'text-primary'}`}>{dtiPct}%</span></div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-darkwood py-4 text-center">
                    Enter income and monthly debt in Stage 3 to compute your DTI.
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 4: AI Action Timeline ── */}
            {aiResult?.action_plan && aiResult.action_plan.length > 0 && (
              <div className="frosted-glass rounded-2xl p-7 shadow-xl">
                <h3 className="text-xl font-bold text-secondary font-serif mb-2">AI Action Timeline</h3>
                <p className="text-xs text-darkwood mb-5">
                  Phased strategy personalised to your goal. Expand each phase to see steps.
                </p>
                <div className="space-y-3">
                  {aiResult.action_plan.map(({ phase, steps }, idx) => (
                    <div
                      key={phase}
                      className={`rounded-xl border overflow-hidden ${
                        idx === 0 ? 'border-primary/40' : idx === 1 ? 'border-amber/50' : 'border-accent/40'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedPhase(expandedPhase === phase ? null : phase)}
                        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${
                          expandedPhase === phase ? 'bg-primary/5' : 'bg-white/60 hover:bg-white/90'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              idx === 0 ? 'bg-primary text-white' : idx === 1 ? 'bg-amber text-white' : 'bg-accent/30 text-darkwood'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className="font-bold text-secondary">{phase}</span>
                          <span className="text-xs text-darkwood hidden sm:block">· {steps.length} action{steps.length !== 1 ? 's' : ''}</span>
                        </div>
                        {expandedPhase === phase
                          ? <FaChevronUp className="text-primary text-xs flex-shrink-0" />
                          : <FaChevronDown className="text-darkwood text-xs flex-shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {expandedPhase === phase && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                          >
                            <div className="px-5 pb-5 pt-3 bg-white/40 border-t border-amber/20">
                              <ol className="space-y-2.5">
                                {steps.map((step, si) => (
                                  <li key={si} className="flex items-start space-x-3 text-sm text-darkwood">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                                      {si + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Section 5: Risk Alerts ── */}
            {aiResult?.risk_alerts && aiResult.risk_alerts.length > 0 && (
              <div className="frosted-glass rounded-2xl p-6 shadow-xl border-l-4 border-red-400">
                <div className="flex items-center space-x-2 mb-4">
                  <FaExclamationTriangle className="text-red-500" />
                  <h3 className="text-xl font-bold text-secondary font-serif">Risk Alerts</h3>
                </div>
                <div className="space-y-2.5">
                  {aiResult.risk_alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      <FaExclamationTriangle className="text-red-500 text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-700">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Edge Case: Rebuild Mode ── */}
            {displayScore < 580 && (
              <div className="rounded-2xl p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-md">
                <h3 className="text-lg font-bold text-red-700 font-serif mb-2">🔨 Rebuild Mode — Foundation First</h3>
                <p className="text-sm text-red-600 mb-4">
                  Your score is in the rebuilding range. These tools are designed specifically to build from the ground up:
                </p>
                <ul className="space-y-2 text-sm text-red-700">
                  {[
                    'Open a secured credit card (deposit-backed, reports to all 3 bureaus)',
                    'Apply for a credit-builder loan from a local credit union',
                    'Enroll in rent/utility reporting (Experian Boost, RentReporters)',
                    'Dispute all errors on your credit report via AnnualCreditReport.com',
                    'Keep any existing accounts open — age matters even for thin files',
                  ].map(item => (
                    <li key={item} className="flex items-start space-x-2">
                      <FaCheck className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Edge Case: Optimization Mode ── */}
            {displayScore > 760 && (
              <div className="rounded-2xl p-6 bg-gradient-to-r from-amber/10 to-accent/20 border border-amber shadow-md">
                <h3 className="text-lg font-bold text-secondary font-serif mb-2">✨ Optimization Mode — Maximize Your Score</h3>
                <p className="text-sm text-darkwood mb-4">
                  Your score is excellent. Shift focus to protecting and capitalizing on your credit strength:
                </p>
                <ul className="space-y-2 text-sm text-secondary">
                  {[
                    'Apply for premium rewards cards (travel, cash-back, business perks)',
                    'Request credit limit increases on existing cards every 6 months',
                    'Keep utilization below 10% for maximum VantageScore and FICO impact',
                    'Monitor credit monthly with Experian CreditLock or Equifax alerts',
                    'Use credit for regular purchases and pay in full every cycle',
                  ].map(item => (
                    <li key={item} className="flex items-start space-x-2">
                      <FaCheck className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Full AI Advice (markdown) ── */}
            {llmAdvice && (
              <div className="frosted-glass rounded-2xl p-7 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-secondary font-serif">Full AI Analysis</h3>
                  <button
                    onClick={runAiAnalysis}
                    disabled={llmLoading}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    {llmLoading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-darkwood markdown-output">
                  <ReactMarkdown>{llmAdvice}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* ── Disclaimer ── */}
            <div className="rounded-xl bg-white/50 border border-amber/30 px-5 py-3 text-xs text-darkwood/60 text-center">
              <FaShieldAlt className="inline mr-1 text-primary/40" />
              AI-generated strategy for educational purposes only. Not financial, legal, or credit repair advice. Results and score projections may vary.
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
