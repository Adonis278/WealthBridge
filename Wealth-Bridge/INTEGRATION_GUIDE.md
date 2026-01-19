# Backend Integration Guide

## Overview
This guide explains how to integrate the Firebase backend services with the existing WealthBridge frontend pages.

## Services Created

### 1. Education Service (`lib/educationService.ts`)
**Purpose**: Track lesson progress and quiz scores

**Functions**:
- `saveEducationProgress(userId, moduleId, lessonId, progress)`
- `getEducationProgress(userId, moduleId)`
- `saveQuizScore(userId, moduleId, quizId, score)`
- `getAllUserProgress(userId)`

**Integration with `app/education/page.tsx`**:
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { saveEducationProgress, saveQuizScore } from '@/lib/educationService';

// In component
const { user } = useAuth();

// When completing a lesson
const completeLesson = async (moduleId: string, lessonId: string) => {
  if (user) {
    await saveEducationProgress(user.uid, moduleId, lessonId, 100);
  }
};

// When submitting quiz
const submitQuiz = async (score: number) => {
  if (user) {
    await saveQuizScore(user.uid, 'credit-repair', 'quiz-1', score);
  }
};
```

---

### 2. Credit Service (`lib/creditService.ts`)
**Purpose**: Track credit scores and task completion

**Functions**:
- `saveCreditScore(userId, score, factors)`
- `getCreditScore(userId)`
- `updateCreditScore(userId, newScore, factors)`
- `completeTask(userId, taskId)`

**Integration with `app/credit-builder/page.tsx`**:
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getCreditScore, updateCreditScore, completeTask } from '@/lib/creditService';
import { useEffect, useState } from 'react';

// Load score on mount
useEffect(() => {
  const loadScore = async () => {
    if (user) {
      const result = await getCreditScore(user.uid);
      if (result.success && result.data) {
        setCreditScore(result.data.score);
        setFactors(result.data.factors);
      }
    }
  };
  loadScore();
}, [user]);

// Complete task
const handleCompleteTask = async (taskId: string) => {
  if (user) {
    const result = await completeTask(user.uid, taskId);
    if (result.success) {
      // Refresh score
      const scoreResult = await getCreditScore(user.uid);
      // Update UI
    }
  }
};
```

---

### 3. Portfolio Service (`lib/portfolioService.ts`)
**Purpose**: Manage investment portfolios

**Functions**:
- `initializePortfolio(userId, initialBalance)`
- `getPortfolio(userId)`
- `buyStock(userId, symbol, shares, price)`
- `sellStock(userId, symbol, shares, price)`
- `recordTransaction(userId, transaction)`

**Integration with `app/investing/page.tsx`**:
```typescript
import { getPortfolio, buyStock, sellStock } from '@/lib/portfolioService';

// Load portfolio on mount
useEffect(() => {
  const loadPortfolio = async () => {
    if (user) {
      const result = await getPortfolio(user.uid);
      if (result.success && result.data) {
        setPortfolio(result.data.holdings);
        setBalance(result.data.balance);
      } else {
        // Initialize new portfolio
        await initializePortfolio(user.uid, 10000);
      }
    }
  };
  loadPortfolio();
}, [user]);

// Buy stock
const handleBuy = async (symbol: string, shares: number, price: number) => {
  if (user) {
    const result = await buyStock(user.uid, symbol, shares, price);
    if (result.success) {
      // Refresh portfolio
      const portfolioResult = await getPortfolio(user.uid);
      // Update UI
    }
  }
};
```

---

### 4. Gamification Service (`lib/gamificationService.ts`)
**Purpose**: Track points, achievements, and leaderboard

**Functions**:
- `getUserStats(userId)`
- `addPoints(userId, points, reason)`
- `unlockAchievement(userId, achievementId)`
- `updateStreak(userId)`
- `getLeaderboard(limit)`

**Integration with `app/achievements/page.tsx`**:
```typescript
import { getUserStats, getLeaderboard, unlockAchievement } from '@/lib/gamificationService';

// Load stats on mount
useEffect(() => {
  const loadData = async () => {
    if (user) {
      // Get user stats
      const statsResult = await getUserStats(user.uid);
      if (statsResult.success && statsResult.data) {
        setUserStats(statsResult.data);
      }
      
      // Get leaderboard
      const leaderboardResult = await getLeaderboard(10);
      if (leaderboardResult.success && leaderboardResult.data) {
        setLeaderboard(leaderboardResult.data);
      }
    }
  };
  loadData();
}, [user]);

// Award achievement
const awardAchievement = async (achievementId: string) => {
  if (user) {
    await unlockAchievement(user.uid, achievementId);
    // Refresh stats
  }
};
```

---

### 5. Chat Service (`lib/chatService.ts`)
**Purpose**: Persist AI Navigator chat messages

**Functions**:
- `getChatHistory(userId)`
- `saveMessage(userId, message)`
- `clearChatHistory(userId)`

**Integration with `app/navigator/page.tsx`**:
```typescript
import { getChatHistory, saveMessage } from '@/lib/chatService';

// Load chat history on mount
useEffect(() => {
  const loadHistory = async () => {
    if (user) {
      const result = await getChatHistory(user.uid);
      if (result.success && result.data) {
        setMessages(result.data.messages);
      }
    }
  };
  loadHistory();
}, [user]);

// Send message
const handleSend = async () => {
  if (user && input.trim()) {
    // Save user message
    await saveMessage(user.uid, { text: input, sender: 'user' });
    
    // Generate bot response
    const botResponse = generateResponse(input);
    
    // Save bot message
    await saveMessage(user.uid, { text: botResponse, sender: 'bot' });
    
    // Update UI
    setMessages(prev => [...prev, userMsg, botMsg]);
  }
};
```

---

### 6. Mentorship Service (`lib/mentorshipService.ts`)
**Purpose**: Book and manage mentorship sessions

**Functions**:
- `getMentors()`
- `bookSession(userId, mentorId, mentorName, date, time)`
- `getUserSessions(userId)`
- `cancelSession(sessionId)`
- `completeSession(sessionId)`

**Integration with `app/mentorship/page.tsx`**:
```typescript
import { getMentors, bookSession, getUserSessions } from '@/lib/mentorshipService';

// Load mentors on mount
useEffect(() => {
  const loadMentors = async () => {
    const result = await getMentors();
    if (result.success && result.data) {
      setMentors(result.data);
    }
  };
  loadMentors();
}, []);

// Book session
const handleBook = async (mentorId: string, mentorName: string, date: string, time: string) => {
  if (user) {
    const result = await bookSession(user.uid, mentorId, mentorName, date, time);
    if (result.success) {
      alert('Session booked successfully!');
      // Refresh sessions
    }
  }
};
```

---

### 7. User Service (`lib/userService.ts`)
**Purpose**: Manage user profiles and settings

**Functions**:
- `getUserProfile(userId)`
- `updateUserProfile(userId, updates)`
- `uploadProfilePhoto(userId, file)`
- `updatePreferences(userId, preferences)`

**Create new page `app/profile/page.tsx`**:
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from '@/lib/userService';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const result = await getUserProfile(user.uid);
        if (result.success) setProfile(result.data);
      }
    };
    loadProfile();
  }, [user]);
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user && e.target.files?.[0]) {
      const result = await uploadProfilePhoto(user.uid, e.target.files[0]);
      if (result.success) {
        setProfile(prev => ({ ...prev, photoURL: result.photoURL }));
      }
    }
  };
  
  return (
    // Profile UI
  );
}
```

---

## Common Patterns

### 1. Loading States
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    // Fetch data
    setLoading(false);
  };
  loadData();
}, [user]);

if (loading) return <div>Loading...</div>;
```

### 2. Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

const saveData = async () => {
  const result = await someService(user.uid, data);
  if (!result.success) {
    setError('Failed to save data');
  }
};

{error && <div className="text-red-500">{error}</div>}
```

### 3. Real-time Updates
```typescript
import { onSnapshot, doc } from 'firebase/firestore';

useEffect(() => {
  if (!user) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'users', user.uid),
    (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      }
    }
  );
  
  return () => unsubscribe();
}, [user]);
```

---

## Next Steps

1. **Add Protected Routes**: Wrap pages that require authentication
2. **Add Loading States**: Show spinners while data loads
3. **Add Error Boundaries**: Handle errors gracefully
4. **Implement Real-time Listeners**: For leaderboard, achievements
5. **Set Firebase Security Rules**: Protect user data
6. **Test All Features**: Verify data persistence works
7. **Deploy to Firebase Hosting**: Publish the app

## Firebase Security Rules

Add to Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /progress/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /creditScores/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /portfolios/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /chatMessages/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /mentors/{mentorId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
    match /mentorshipSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Add to Storage:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```
