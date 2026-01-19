import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Save lesson completion
export const saveEducationProgress = async (
  userId: string,
  moduleId: string,
  moduleName: string,
  lessons: LessonProgress[]
) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${moduleId}`);
    const completionRate = (lessons.filter(l => l.completed).length / lessons.length) * 100;

    await setDoc(progressRef, {
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
    return { success: false, error };
  }
};

// Get user's education progress
export const getEducationProgress = async (userId: string, moduleId: string) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${moduleId}`);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      return { success: true, data: progressDoc.data() };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting progress:', error);
    return { success: false, error };
  }
};

// Save quiz score
export const saveQuizScore = async (
  userId: string,
  moduleId: string,
  score: number
) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${moduleId}`);
    
    await updateDoc(progressRef, {
      quizScores: arrayUnion(score),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving quiz score:', error);
    return { success: false, error };
  }
};

// Get all user progress
export const getAllUserProgress = async (userId: string) => {
  try {
    const progressRef = collection(db, 'progress');
    // In a real app, you'd use a query here
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting all progress:', error);
    return { success: false, error };
  }
};
