import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs,
  collection,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Get all mentors
export const getMentors = async () => {
  try {
    const mentorsRef = collection(db, 'mentors');
    const mentorsSnapshot = await getDocs(mentorsRef);
    
    const mentors = mentorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MentorData[];

    return { success: true, data: mentors };
  } catch (error) {
    console.error('Error getting mentors:', error);
    return { success: false, error };
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
    const sessionId = `${userId}_${mentorId}_${Date.now()}`;
    const sessionRef = doc(db, 'mentorshipSessions', sessionId);

    const sessionData = {
      id: sessionId,
      userId,
      mentorId,
      mentorName,
      date,
      time,
      status: 'scheduled',
      createdAt: serverTimestamp(),
    };

    await setDoc(sessionRef, sessionData);

    // Update mentor's session count
    const mentorRef = doc(db, 'mentors', mentorId);
    const mentorDoc = await getDoc(mentorRef);
    
    if (mentorDoc.exists()) {
      const currentSessions = mentorDoc.data().sessions || 0;
      await updateDoc(mentorRef, {
        sessions: currentSessions + 1,
      });
    }

    return { success: true, sessionId };
  } catch (error) {
    console.error('Error booking session:', error);
    return { success: false, error };
  }
};

// Get user's mentorship sessions
export const getUserSessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'mentorshipSessions');
    const q = query(sessionsRef, where('userId', '==', userId));
    const sessionsSnapshot = await getDocs(q);

    const sessions = sessionsSnapshot.docs.map(doc => 
      doc.data()
    ) as MentorSession[];

    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error getting sessions:', error);
    return { success: false, error };
  }
};

// Cancel a session
export const cancelSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, 'mentorshipSessions', sessionId);
    
    await updateDoc(sessionRef, {
      status: 'canceled',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling session:', error);
    return { success: false, error };
  }
};

// Mark session as completed
export const completeSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, 'mentorshipSessions', sessionId);
    
    await updateDoc(sessionRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing session:', error);
    return { success: false, error };
  }
};

// Add or update mentor
export const addMentor = async (mentorData: Omit<MentorData, 'id'>) => {
  try {
    const mentorId = mentorData.name.toLowerCase().replace(/\s+/g, '-');
    const mentorRef = doc(db, 'mentors', mentorId);

    await setDoc(mentorRef, {
      ...mentorData,
      id: mentorId,
      createdAt: serverTimestamp(),
    });

    return { success: true, mentorId };
  } catch (error) {
    console.error('Error adding mentor:', error);
    return { success: false, error };
  }
};
