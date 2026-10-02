import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { describeFirestoreError } from '@/lib/firestoreErrors';

export interface LessonProgress {
  id: number;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  lessons: LessonProgress[];
  quizScores: number[];
  completionRate: number;
  lastUpdated: Date;
}

// Owned by the user via the document path — see firestore.rules.
const progressRef = (userId: string, moduleId: string) =>
  doc(db, 'users', userId, 'progress', moduleId);

// Save lesson completion
export const saveEducationProgress = async (
  userId: string,
  moduleId: string,
  moduleName: string,
  lessons: LessonProgress[]
) => {
  try {
    const completionRate = lessons.length
      ? (lessons.filter((l) => l.completed).length / lessons.length) * 100
      : 0;

    await setDoc(progressRef(userId, moduleId), {
      userId,
      moduleId,
      moduleName,
      lessons,
      completionRate,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Get user's education progress
export const getEducationProgress = async (userId: string, moduleId: string) => {
  try {
    const progressDoc = await getDoc(progressRef(userId, moduleId));

    if (progressDoc.exists()) {
      return { success: true, data: progressDoc.data() };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting progress:', error);
    return { success: false, data: null, message: describeFirestoreError(error) };
  }
};

// Save quiz score
export const saveQuizScore = async (
  userId: string,
  moduleId: string,
  score: number
) => {
  try {
    // setDoc+merge rather than updateDoc: the module doc may not exist yet if
    // the user jumps straight to the quiz.
    await setDoc(progressRef(userId, moduleId), {
      userId,
      moduleId,
      quizScores: arrayUnion(score),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving quiz score:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Get all user progress
export const getAllUserProgress = async (userId: string) => {
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'progress'));
    const data = snapshot.docs.map((item) => ({
      moduleId: item.id,
      ...item.data(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Error getting all progress:', error);
    return { success: false, data: [], message: describeFirestoreError(error) };
  }
};
