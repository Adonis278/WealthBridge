import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  joinedDate: Date;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
  };
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserProfile };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error };
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (
  userId: string,
  file: File
) => {
  try {
    const storageRef = ref(storage, `profile-photos/${userId}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const photoURL = await getDownloadURL(storageRef);
    
    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL,
      updatedAt: serverTimestamp(),
    });

    return { success: true, photoURL };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { success: false, error };
  }
};

// Update user preferences
export const updatePreferences = async (
  userId: string,
  preferences: UserProfile['preferences']
) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error };
  }
};
