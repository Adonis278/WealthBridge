import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db } from '@/lib/firestore';
import { storage } from '@/lib/storage';
import { SESSION_SCHEMA_VERSION } from '@/lib/schema';

export type SessionStatus = 'draft' | 'submitted' | 'analyzed' | 'analysis_error';

export interface ProfileStepData {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface OccupationIncomeStepData {
  occupationTitle: string;
  employerType: 'employed' | 'self-employed' | 'student' | 'other' | '';
  monthlyGrossIncome: number | null;
  monthlyNetIncome: number | null;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'other' | '';
  incomeConfidence: 'exact' | 'estimate' | '';
}

export interface GoalStepData {
  primaryGoal: 'buy_home' | 'finance_car' | 'premium_card' | 'rent_apartment' | 'business_funding' | 'other' | '';
  targetScore: number | null;
  targetTimelineDate: string | null;
  targetTimelineMonths: number | null;
  majorApplicationsPlanned: boolean;
  plannedApplicationsWindow: '0-3' | '3-6' | '6-12' | '';
  notes: string;
}

export interface DebtStepData {
  monthlyRentOrMortgage: number | null;
  monthlyAuto: number | null;
  monthlyStudentLoans: number | null;
  monthlyCreditCardMinimums: number | null;
  otherMonthlyDebt: number | null;
  calculatedDTI: number | null;
  inputsUsed: {
    grossMonthlyIncome: number | null;
    totalMonthlyDebt: number | null;
  };
}

export interface CreditReportData {
  storagePath: string;
  fileName: string;
  uploadedAt?: unknown;
  fileHash?: string | null;
  parseStatus: 'uploaded' | 'parsed' | 'failed';
  scoreSnapshot?: number | null;
  reportDate?: string | null;
  extractedMetrics?: Record<string, unknown>;
  textSnippet?: string | null;
}

export interface AnalysisPayload {
  analysisSummary: string;
  factorBreakdown: Record<string, unknown>;
  recommendedActions: Array<Record<string, unknown>>;
  riskWarnings: string[];
  assumptions: Record<string, unknown>;
  generatedAt?: unknown;
  modelVersion: string;
  agentVersion: string;
  rawResult?: Record<string, unknown> | null;
  rawAdvice?: string;
}

export interface CreditBuilderSessionDoc {
  id: string;
  uid?: string;
  status?: SessionStatus;
  schemaVersion?: number;
  consent?: {
    agreementAccepted?: boolean;
    acceptedAt?: string | null;
    termsVersion?: string;
  };
  profile?: ProfileStepData;
  occupationIncome?: OccupationIncomeStepData;
  goals?: GoalStepData;
  dti?: DebtStepData;
  financialContext?: Record<string, unknown>;
  creditReport?: CreditReportData;
  reportAnalysis?: Record<string, unknown>;
  analysis?: AnalysisPayload & Record<string, unknown>;
  createdAt?: { seconds: number; nanoseconds?: number } | null;
  updatedAt?: { seconds: number; nanoseconds?: number } | null;
}

const SCHEMA_VERSION = SESSION_SCHEMA_VERSION;

function sessionRef(uid: string, sessionId: string) {
  return doc(db, 'users', uid, 'credit_builder_sessions', sessionId);
}

function sessionCollectionRef(uid: string) {
  return collection(db, 'users', uid, 'credit_builder_sessions');
}

async function sha256File(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

export async function createSession(uid: string, seed?: Partial<DocumentData>) {
  const created = await addDoc(sessionCollectionRef(uid), {
    uid,
    status: 'draft' as SessionStatus,
    schemaVersion: SCHEMA_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...seed,
  });

  return created.id;
}

export async function getLatestSession(uid: string) {
  const q = query(sessionCollectionRef(uid), orderBy('updatedAt', 'desc'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...(snap.docs[0].data() as DocumentData) } as CreditBuilderSessionDoc;
}

export async function getRecentSessions(uid: string, count = 10) {
  const q = query(sessionCollectionRef(uid), orderBy('updatedAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((item) => ({
    id: item.id,
    ...(item.data() as DocumentData),
  })) as CreditBuilderSessionDoc[];
}

export async function getSessionById(uid: string, sessionId: string) {
  const ref = sessionRef(uid, sessionId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as DocumentData) } as CreditBuilderSessionDoc;
}

export async function saveDraftStep(uid: string, sessionId: string, partialData: Record<string, unknown>) {
  const ref = sessionRef(uid, sessionId);
  await setDoc(
    ref,
    {
      uid,
      status: 'draft' as SessionStatus,
      schemaVersion: SCHEMA_VERSION,
      ...partialData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function uploadCreditReport(uid: string, sessionId: string, file: File) {
  const path = `creditReports/${uid}/${sessionId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
  const downloadUrl = await getDownloadURL(storageRef);
  const hash = await sha256File(file);

  const creditReport: CreditReportData = {
    storagePath: path,
    fileName: file.name,
    fileHash: hash,
    parseStatus: 'uploaded',
    uploadedAt: serverTimestamp(),
  };

  await saveDraftStep(uid, sessionId, { creditReport });

  return { storagePath: path, downloadUrl, fileHash: hash };
}

export async function saveParsedCreditReport(
  uid: string,
  sessionId: string,
  payload: Partial<CreditReportData>
) {
  await saveDraftStep(uid, sessionId, {
    creditReport: {
      ...payload,
      parseStatus: payload.parseStatus ?? 'parsed',
    },
  });
}

export async function submitForAnalysis(uid: string, sessionId: string) {
  const existing = await getSessionById(uid, sessionId);
  if (!existing) throw new Error('Session not found.');

  const required = [
    !!existing.profile,
    !!existing.occupationIncome,
    !!existing.goals,
    !!existing.dti,
    !!existing.creditReport,
  ];

  if (required.includes(false)) {
    throw new Error('Missing required fields. Complete all steps before analysis.');
  }

  if (!existing.consent?.agreementAccepted) {
    throw new Error('Please accept the data use agreement before running analysis.');
  }

  await updateDoc(sessionRef(uid, sessionId), {
    status: 'submitted' as SessionStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function saveAnalysis(uid: string, sessionId: string, analysisPayload: AnalysisPayload) {
  await updateDoc(sessionRef(uid, sessionId), {
    status: 'analyzed' as SessionStatus,
    analysis: {
      ...analysisPayload,
      generatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

export async function saveAnalysisError(uid: string, sessionId: string, message: string) {
  await updateDoc(sessionRef(uid, sessionId), {
    status: 'analysis_error' as SessionStatus,
    analysisError: {
      message,
      at: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

export async function appendAnalysisVersion(uid: string, sessionId: string, analysisPayload: AnalysisPayload) {
  await addDoc(collection(db, 'users', uid, 'credit_builder_sessions', sessionId, 'analysis_versions'), {
    uid,
    schemaVersion: SCHEMA_VERSION,
    ...analysisPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
