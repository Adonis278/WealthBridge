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
import { describeFirestoreError } from '@/lib/firestoreErrors';
import { USER_SCHEMA_VERSION } from '@/lib/schema';

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

/** firestore.rules requires uid + schemaVersion + updatedAt on every user write. */
const userMeta = (userId: string) => ({
  uid: userId,
  schemaVersion: USER_SCHEMA_VERSION,
  updatedAt: serverTimestamp(),
});

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserProfile };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, data: null, message: describeFirestoreError(error) };
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      ...userMeta(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Upload profile photo
export const uploadProfilePhoto = async (
  userId: string,
  file: File
) => {
  try {
    // Mirrors the constraints in storage.rules so the user gets a clear message
    // instead of an opaque permission error.
    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'Please choose an image file.' };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { success: false, message: 'Image must be smaller than 5 MB.' };
    }

    const storageRef = ref(storage, `profile-photos/${userId}`);
    await uploadBytes(storageRef, file, { contentType: file.type });

    const photoURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, 'users', userId), {
      ...userMeta(userId),
      photoURL,
    });

    return { success: true, photoURL };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};

// Update user preferences
export const updatePreferences = async (
  userId: string,
  preferences: UserProfile['preferences']
) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userMeta(userId),
      preferences,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, message: describeFirestoreError(error) };
  }
};
