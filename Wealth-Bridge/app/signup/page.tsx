'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { executeRecaptcha } from '@/lib/recaptcha';
import { FaLeaf, FaGoogle, FaEnvelope, FaLock, FaUser, FaPhone, FaShieldAlt } from 'react-icons/fa';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, setupRecaptcha, verifyOTP } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Execute reCAPTCHA Enterprise
      const recaptchaToken = await executeRecaptcha('signup');
      console.log('reCAPTCHA token obtained for signup:', recaptchaToken ? 'success' : 'failed');

      await signUp(email, password, displayName);
      router.push('/navigator');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!showOtpInput) {
        // Execute reCAPTCHA Enterprise for phone signup
        const recaptchaToken = await executeRecaptcha('phone_signup');
        console.log('reCAPTCHA token obtained for phone signup:', recaptchaToken ? 'success' : 'failed');

        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
        await setupRecaptcha(formattedPhone);
        setShowOtpInput(true);
      } else {
        await verifyOTP(otp);
        router.push('/navigator');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with phone');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Execute reCAPTCHA Enterprise for Google sign-in
      const recaptchaToken = await executeRecaptcha('google_signup');
      console.log('reCAPTCHA token obtained for Google signup:', recaptchaToken ? 'success' : 'failed');

      await signInWithGoogle();
      router.push('/navigator');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isRecaptchaConfigured = recaptchaSiteKey && !recaptchaSiteKey.includes('your-');

  return (
    <>
      {isRecaptchaConfigured && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
        />
      )}
      <div className="min-h-screen bg-gradient-sunset flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <FaLeaf className="text-6xl text-accent mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">
              Join WealthBridge
            </h1>
            <p className="text-accent">Start your journey to financial freedom</p>
          </div>

          <div className="frosted-glass rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Auth Method Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setShowOtpInput(false); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${authMethod === 'email'
                    ? 'bg-white text-primary shadow'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <FaEnvelope className="inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${authMethod === 'phone'
                    ? 'bg-white text-primary shadow'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <FaPhone className="inline mr-2" />
                Phone
              </button>
            </div>

            {authMethod === 'email' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    <FaUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    <FaLock className="inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                {!showOtpInput ? (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      <FaLock className="inline mr-2" />
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your phone</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : showOtpInput ? 'Verify Code' : 'Send Code'}
                </button>

                {showOtpInput && (
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="w-full text-primary hover:text-amber text-sm"
                  >
                    ← Change phone number
                  </button>
                )}
              </form>
            )}

            <div id="recaptcha-container"></div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-darkwood">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-4 w-full bg-white hover:bg-gray-50 text-secondary font-bold py-3 px-6 rounded-lg border-2 border-gray-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FaGoogle className="text-red-500" />
                <span>Sign up with Google</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-darkwood">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-amber font-bold">
                Sign In
              </Link>
            </p>

            {/* reCAPTCHA Enterprise Badge */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <FaShieldAlt className="mr-1 text-green-600" />
              <span>Protected by reCAPTCHA Enterprise</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
