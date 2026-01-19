import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Get chat history
export const getChatHistory = async (userId: string) => {
  try {
    const chatRef = doc(db, 'chatMessages', userId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      return { success: true, data: chatDoc.data() as ChatHistory };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, error };
  }
};

// Save message
export const saveMessage = async (
  userId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  try {
    const chatRef = doc(db, 'chatMessages', userId);
    const chatDoc = await getDoc(chatRef);
    
    const newMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date(),
    };

    if (chatDoc.exists()) {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(chatRef, {
        userId,
        messages: [newMessage],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error };
  }
};

// Clear chat history
export const clearChatHistory = async (userId: string) => {
  try {
    const chatRef = doc(db, 'chatMessages', userId);
    
    await setDoc(chatRef, {
      userId,
      messages: [],
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return { success: false, error };
  }
};
