import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreditScoreHistory {
  score: number;
  date: Date;
  change: number;
}

export interface CreditTask {
  id: number;
  title: string;
  completed: boolean;
  points: number;
  completedAt?: Date;
}

export interface CreditData {
  userId: string;
  currentScore: number;
  previousScore: number;
  history: CreditScoreHistory[];
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditAge: number;
    creditMix: number;
    newCredit: number;
  };
  tasks: CreditTask[];
  lastUpdated: Date;
}

// Save credit score data
export const saveCreditScore = async (
  userId: string,
  scoreData: Partial<CreditData>
) => {
  try {
    const creditRef = doc(db, 'creditScores', userId);
    
    await setDoc(creditRef, {
      userId,
      ...scoreData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving credit score:', error);
    return { success: false, error };
  }
};

// Get user's credit score data
export const getCreditScore = async (userId: string) => {
  try {
    const creditRef = doc(db, 'creditScores', userId);
    const creditDoc = await getDoc(creditRef);

    if (creditDoc.exists()) {
      return { success: true, data: creditDoc.data() as CreditData };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting credit score:', error);
    return { success: false, error };
  }
};

// Update credit score
export const updateCreditScore = async (
  userId: string,
  newScore: number
) => {
  try {
    const creditRef = doc(db, 'creditScores', userId);
    const creditDoc = await getDoc(creditRef);
    
    let previousScore = 650; // default
    if (creditDoc.exists()) {
      previousScore = creditDoc.data().currentScore || 650;
    }

    const scoreChange = newScore - previousScore;
    const historyEntry = {
      score: newScore,
      date: new Date(),
      change: scoreChange,
    };

    await setDoc(creditRef, {
      userId,
      currentScore: newScore,
      previousScore,
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error updating credit score:', error);
    return { success: false, error };
  }
};

// Complete a task
export const completeTask = async (
  userId: string,
  taskId: number
) => {
  try {
    const creditRef = doc(db, 'creditScores', userId);
    const creditDoc = await getDoc(creditRef);
    
    if (creditDoc.exists()) {
      const tasks = creditDoc.data().tasks || [];
      const updatedTasks = tasks.map((task: CreditTask) => 
        task.id === taskId 
          ? { ...task, completed: true, completedAt: new Date() }
          : task
      );

      await updateDoc(creditRef, {
        tasks: updatedTasks,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    }
    return { success: false, error: 'Credit data not found' };
  } catch (error) {
    console.error('Error completing task:', error);
    return { success: false, error };
  }
};
