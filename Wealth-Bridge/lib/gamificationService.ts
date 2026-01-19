import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Achievement {
  id: number;
  name: string;
  unlockedAt: Date;
  points: number;
}

export interface UserStats {
  userId: string;
  displayName: string;
  level: number;
  points: number;
  streak: number;
  achievements: Achievement[];
  treeGrowth: number;
  lastLoginDate: Date;
}

// Get user stats
export const getUserStats = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserStats };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { success: false, error };
  }
};

// Add points to user
export const addPoints = async (userId: string, pointsToAdd: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentPoints = userDoc.data().points || 0;
      const newPoints = currentPoints + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await updateDoc(userRef, {
        points: newPoints,
        level: newLevel,
        updatedAt: serverTimestamp(),
      });

      return { success: true, newPoints, newLevel };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, error };
  }
};

// Unlock achievement
export const unlockAchievement = async (
  userId: string,
  achievementId: number,
  achievementName: string,
  points: number
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const achievements = userDoc.data().achievements || [];
      const alreadyUnlocked = achievements.some((a: Achievement) => a.id === achievementId);
      
      if (alreadyUnlocked) {
        return { success: false, error: 'Achievement already unlocked' };
      }

      const newAchievement = {
        id: achievementId,
        name: achievementName,
        unlockedAt: new Date(),
        points,
      };

      await updateDoc(userRef, {
        achievements: arrayUnion(newAchievement),
        updatedAt: serverTimestamp(),
      });

      // Also add points
      await addPoints(userId, points);

      return { success: true };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return { success: false, error };
  }
};

// Update streak
export const updateStreak = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const lastLogin = userDoc.data().lastLoginDate?.toDate();
      const today = new Date();
      const currentStreak = userDoc.data().streak || 0;
      
      let newStreak = currentStreak;
      
      if (lastLogin) {
        const daysSinceLastLogin = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastLogin === 1) {
          // Consecutive day
          newStreak = currentStreak + 1;
        } else if (daysSinceLastLogin > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If same day, keep current streak
      } else {
        newStreak = 1;
      }

      await updateDoc(userRef, {
        streak: newStreak,
        lastLoginDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, streak: newStreak };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, error };
  }
};

// Update tree growth
export const updateTreeGrowth = async (userId: string, growth: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      treeGrowth: growth,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating tree growth:', error);
    return { success: false, error };
  }
};

// Get leaderboard
export const getLeaderboard = async (limitCount: number = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('points', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = querySnapshot.docs.map((doc, index) => ({
      rank: index + 1,
      userId: doc.id,
      name: doc.data().displayName || 'Anonymous',
      points: doc.data().points || 0,
      achievements: doc.data().achievements?.length || 0,
    }));

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { success: false, error };
  }
};
