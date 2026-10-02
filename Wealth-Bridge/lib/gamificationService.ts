import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firestore';
import { describeFirestoreError } from '@/lib/firestoreErrors';
import { USER_SCHEMA_VERSION } from '@/lib/schema';

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

/**
 * Every write to `users/{uid}` must carry uid + schemaVersion + updatedAt or
 * firestore.rules rejects it. Centralised here so no call site can forget.
 */
const userMeta = (userId: string) => ({
  uid: userId,
  schemaVersion: USER_SCHEMA_VERSION,
  updatedAt: serverTimestamp(),
});

// Get user stats
export const getUserStats = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserStats };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { success: false, data: null, message: describeFirestoreError(error) };
  }
};

// Add points to user
export const addPoints = async (userId: string, pointsToAdd: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, message: 'Profile not ready yet. Try again in a moment.' };
    }

    const currentPoints = userDoc.data().points || 0;
    const newPoints = currentPoints + pointsToAdd;
    const newLevel = Math.floor(newPoints / 100) + 1;

    await updateDoc(userRef, {
      ...userMeta(userId),
      points: newPoints,
      level: newLevel,
    });

    return { success: true, newPoints, newLevel };
  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, message: describeFirestoreError(error) };
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

    if (!userDoc.exists()) {
      return { success: false, message: 'Profile not ready yet. Try again in a moment.' };
    }

    const achievements = userDoc.data().achievements || [];
    const alreadyUnlocked = achievements.some((a: Achievement) => a.id === achievementId);

    if (alreadyUnlocked) {
      return { success: false, message: 'Achievement already unlocked' };
    }

    const newAchievement = {
      id: achievementId,
      name: achievementName,
      unlockedAt: new Date(),
      points,
    };

    await updateDoc(userRef, {
      ...userMeta(userId),
      achievements: arrayUnion(newAchievement),
    });

    // Also award the points
    await addPoints(userId, points);

    return { success: true };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Update streak
export const updateStreak = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, message: 'Profile not ready yet. Try again in a moment.' };
    }

    // Tracked separately from `lastLoginDate`, which AuthContext stamps on every
    // sign-in — reusing that field would make every check look like "same day"
    // and the streak would never advance.
    const lastStreakAt = userDoc.data().lastStreakDate?.toDate?.();
    const today = new Date();
    const currentStreak = userDoc.data().streak || 0;

    // Compare calendar days, not elapsed hours, so an evening-then-morning
    // visit counts as two consecutive days.
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    let newStreak: number;
    if (!lastStreakAt) {
      newStreak = 1;
    } else {
      const daysSince = Math.round(
        (startOfDay(today) - startOfDay(lastStreakAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysSince === 0) {
        // Already counted today — nothing to write.
        return { success: true, streak: currentStreak };
      }
      newStreak = daysSince === 1 ? currentStreak + 1 : 1;
    }

    await updateDoc(userRef, {
      ...userMeta(userId),
      streak: newStreak,
      lastStreakDate: serverTimestamp(),
    });

    return { success: true, streak: newStreak };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Update tree growth
export const updateTreeGrowth = async (userId: string, growth: number) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userMeta(userId),
      treeGrowth: growth,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating tree growth:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};
