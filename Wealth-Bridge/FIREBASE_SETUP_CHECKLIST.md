# Firebase Setup Checklist

## ✅ Authentication Setup Verification

Your WealthBridge app is configured and ready! To ensure authentication works properly, please verify the following in your Firebase Console:

### 1. Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wealth-bridge-d3efd**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### 2. Enable Google Sign-In (Optional)
1. In **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Set a support email address
4. Click **Save**

### 3. Verify Firestore Database
1. Navigate to **Firestore Database**
2. Ensure the database is created (in production or test mode)
3. The app will automatically create a `users` collection when users sign up

### 4. Verify Storage
1. Navigate to **Storage**
2. Ensure Storage is enabled for profile photo uploads
3. Set appropriate security rules if needed

## 🧪 Testing Authentication

### Test Signup Flow:
1. Open http://localhost:3001/signup
2. Enter a name, email, and password (min 6 characters)
3. Click **Sign Up**
4. You should be redirected to `/navigator` after successful signup
5. Check Firestore → `users` collection to see your new user document

### Test Login Flow:
1. Open http://localhost:3001/login
2. Enter your email and password
3. Click **Sign In**
4. You should be redirected to `/navigator`

### Test Google OAuth:
1. Click **Sign in with Google** on login or signup page
2. Select your Google account
3. You should be redirected to `/navigator`

## ⚠️ Common Issues & Solutions

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution:** Enable Email/Password authentication in Firebase Console (see step 1 above)

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Verify your `.env.local` file has the correct Firebase credentials

### Issue: "Firebase: Error (auth/network-request-failed)"
**Solution:** Check your internet connection and Firebase project status

### Issue: Google Sign-In doesn't work
**Solution:** 
1. Enable Google provider in Firebase Console
2. Add authorized domains in Firebase Console → Authentication → Settings → Authorized domains
3. Add `localhost` for local testing

## 📊 What Gets Created on Signup

When a user signs up, the app automatically creates:
- **Firebase Auth User** with email/password or Google OAuth
- **Firestore User Document** at `users/{userId}` with:
  ```javascript
  {
    email: "user@example.com",
    displayName: "User Name",
    level: 1,
    points: 0,
    streak: 0,
    achievements: [],
    createdAt: Timestamp
  }
  ```

## 🎯 Current Status

✅ Frontend: All 8 pages complete
✅ Backend: 7 Firebase service modules
✅ Authentication: Email/Password + Google OAuth
✅ Dev Server: Running on http://localhost:3001

## 🚀 Next Steps

1. Verify Firebase Authentication is enabled (steps above)
2. Test signup with a new account
3. Test login with your account
4. Test Google OAuth (optional)
5. Check Firestore to see user documents created

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages (F12)
2. Check the terminal running `npm run dev` for server errors
3. Verify all environment variables are set correctly in `.env.local`
4. Ensure your Firebase project billing is set up (required for some features)
