# 🔥 Firebase Backend Setup Guide

## Overview

WealthBridge now uses Firebase for backend services including Authentication, Firestore Database, and Cloud Storage.

## 📋 Prerequisites

- Firebase account (free tier available)
- Node.js 18+ installed
- Git configured

## 🚀 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a project"
3. Enter project name: `wealthbridge` (or your preferred name)
4. Enable/Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** from the left sidebar
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method (optional but recommended)
5. Click "Save"

### Step 3: Create Firestore Database

1. Go to **Firestore Database** from the sidebar
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click "Enable"

### Step 4: Enable Cloud Storage

1. Go to **Storage** from the sidebar
2. Click "Get Started"
3. Start in **test mode**
4. Select same location as Firestore
5. Click "Done"

### Step 5: Get Web App Configuration

1. Go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`) to add a web app
4. Register app nickname: "WealthBridge Web"
5. **Copy the Firebase configuration object**

## 🔑 Configure Environment Variables

### Step 6: Set Up .env.local

1. In your project root, copy the example file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and paste your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Save the file

## 📊 Firestore Database Structure

The app uses the following collections:

### Users Collection (`users`)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  lastLoginDate: timestamp,
  level: number,
  points: number,
  streak: number,
  achievements: array
}
```

### Progress Collection (`progress`)
```javascript
{
  userId: string,
  moduleId: string,
  lessons: array,
  quizScores: array,
  completionRate: number,
  updatedAt: timestamp
}
```

### Portfolios Collection (`portfolios`)
```javascript
{
  userId: string,
  balance: number,
  holdings: array,
  transactions: array,
  totalValue: number,
  gainLoss: number,
  updatedAt: timestamp
}
```

### Credit Scores Collection (`creditScores`)
```javascript
{
  userId: string,
  score: number,
  history: array,
  factors: object,
  tasks: array,
  updatedAt: timestamp
}
```

### Chat Messages Collection (`chatMessages`)
```javascript
{
  userId: string,
  messages: array,
  createdAt: timestamp
}
```

### Achievements Collection (`achievements`)
```javascript
{
  userId: string,
  unlocked: array,
  treeGrowth: number,
  updatedAt: timestamp
}
```

### Mentorship Sessions Collection (`mentorshipSessions`)
```javascript
{
  userId: string,
  mentorId: string,
  scheduledDate: timestamp,
  status: string,
  notes: string
}
```

## 🔒 Security Rules Setup

### Step 7: Configure Firestore Rules

1. Go to **Firestore Database** > **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Progress collection
    match /progress/{progressId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Portfolios collection
    match /portfolios/{portfolioId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Credit scores collection
    match /creditScores/{scoreId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Chat messages collection
    match /chatMessages/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Mentorship sessions
    match /mentorshipSessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **Publish**

### Step 8: Configure Storage Rules

1. Go to **Storage** > **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

## ✅ Testing Your Setup

### Step 9: Run the App

1. Start the development server:
```bash
npm run dev
```

2. Navigate to http://localhost:3000

3. Click "Sign Up" and create a test account

4. Check Firebase Console:
   - **Authentication** > Users tab (should show your new user)
   - **Firestore** > users collection (should have a new document)

## 🎯 Features Now Available

With Firebase configured, you can now:

- ✅ **User Authentication**: Sign up, login, and logout
- ✅ **Persistent Data**: User progress saved across sessions
- ✅ **Real-time Sync**: Changes sync instantly across devices
- ✅ **Secure Access**: Only authenticated users can access their data
- ✅ **Profile Management**: Users can update their information
- ✅ **Cloud Storage**: Upload and store user avatars

## 🚀 Next Steps

After basic setup, you can:

1. **Add sample data** to Firestore for testing
2. **Configure Google OAuth** for social login
3. **Set up Cloud Functions** for server-side logic
4. **Enable Firebase Analytics** for user insights
5. **Deploy to Firebase Hosting**

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guides](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Next.js with Firebase](https://firebase.google.com/docs/web/setup)

## 🛟 Troubleshooting

### Issue: "Firebase not initialized"
- Check that `.env.local` file exists and has correct values
- Restart the development server after adding environment variables

### Issue: "Permission denied" errors
- Verify Firestore and Storage security rules are published
- Check that user is authenticated before accessing data

### Issue: "Module not found: firebase"
- Run `npm install` to ensure Firebase SDK is installed
- Clear `.next` folder and restart: `rm -rf .next && npm run dev`

---

**Your Firebase backend is now ready!** 🎉
