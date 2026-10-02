import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { describeFirestoreError } from '@/lib/firestoreErrors';

export interface MentorSession {
  id: string;
  userId: string;
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  createdAt: Date;
}

export interface MentorData {
  id: string;
  name: string;
  role: string;
  expertise: string;
  bio: string;
  rating: number;
  sessions: number;
  available: boolean;
}

// Bookings live under the booking user — see firestore.rules.
const sessionsCollection = (userId: string) =>
  collection(db, 'users', userId, 'mentorship_sessions');

const sessionRef = (userId: string, sessionId: string) =>
  doc(db, 'users', userId, 'mentorship_sessions', sessionId);

// Get all mentors. `mentors` is public read-only reference data; it is seeded
// from the Firebase console, not written by the app.
export const getMentors = async () => {
  try {
    const mentorsSnapshot = await getDocs(collection(db, 'mentors'));

    const mentors = mentorsSnapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    })) as MentorData[];

    return { success: true, data: mentors };
  } catch (error) {
    console.error('Error getting mentors:', error);
    return { success: false, data: [], message: describeFirestoreError(error) };
  }
};

// Book a mentorship session
export const bookSession = async (
  userId: string,
  mentorId: string,
  mentorName: string,
  date: string,
  time: string
) => {
  try {
    const sessionId = `${mentorId}_${Date.now()}`;

    await setDoc(sessionRef(userId, sessionId), {
      id: sessionId,
      userId,
      mentorId,
      mentorName,
      date,
      time,
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, sessionId };
  } catch (error) {
    console.error('Error booking session:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Get the signed-in user's mentorship sessions
export const getUserSessions = async (userId: string) => {
  try {
    const snapshot = await getDocs(sessionsCollection(userId));
    const sessions = snapshot.docs.map((item) => item.data()) as MentorSession[];

    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error getting sessions:', error);
    return { success: false, data: [], message: describeFirestoreError(error) };
  }
};

// Cancel a session
export const cancelSession = async (userId: string, sessionId: string) => {
  try {
    await updateDoc(sessionRef(userId, sessionId), {
      status: 'canceled',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling session:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Mark session as completed
export const completeSession = async (userId: string, sessionId: string) => {
  try {
    await updateDoc(sessionRef(userId, sessionId), {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing session:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Read a single mentor record.
export const getMentor = async (mentorId: string) => {
  try {
    const snapshot = await getDoc(doc(db, 'mentors', mentorId));
    if (!snapshot.exists()) return { success: true, data: null };
    return { success: true, data: { id: snapshot.id, ...snapshot.data() } as MentorData };
  } catch (error) {
    console.error('Error getting mentor:', error);
    return { success: false, data: null, message: describeFirestoreError(error) };
  }
};
