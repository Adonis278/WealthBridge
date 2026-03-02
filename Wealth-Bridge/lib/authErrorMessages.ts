export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/user-not-found':
      return 'No account found with that email. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please log in.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Allow popups and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network issue detected. Check your connection and retry.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Auth.';
    case 'auth/missing-phone-number':
      return 'Please enter a valid phone number with country code.';
    case 'auth/invalid-phone-number':
      return 'Phone number format is invalid. Example: +15551234567.';
    case 'auth/invalid-verification-code':
      return 'Verification code is invalid. Please re-enter the code.';
    case 'auth/code-expired':
      return 'Verification code expired. Request a new code.';
    default:
      return fallback;
  }
}
