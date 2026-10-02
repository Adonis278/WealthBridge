import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { describeFirestoreError } from '@/lib/firestoreErrors';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatHistory {
  userId: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

// Owned by the user via the document path — see firestore.rules.
const chatRef = (userId: string) => doc(db, 'users', userId, 'chat', 'history');

// Get chat history
export const getChatHistory = async (userId: string) => {
  try {
    const chatDoc = await getDoc(chatRef(userId));

    if (chatDoc.exists()) {
      return { success: true, data: chatDoc.data() as ChatHistory };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, data: null, message: describeFirestoreError(error) };
  }
};

// Save message
export const saveMessage = async (
  userId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  try {
    const ref = chatRef(userId);
    const chatDoc = await getDoc(ref);

    const newMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date(),
    };

    if (chatDoc.exists()) {
      await updateDoc(ref, {
        messages: arrayUnion(newMessage),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        userId,
        messages: [newMessage],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Clear chat history
export const clearChatHistory = async (userId: string) => {
  try {
    await setDoc(chatRef(userId), {
      userId,
      messages: [],
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};
