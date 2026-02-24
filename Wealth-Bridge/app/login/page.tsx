'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { executeRecaptcha } from '@/lib/recaptcha';
import { FaLeaf, FaGoogle, FaEnvelope, FaLock, FaPhone, FaShieldAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, setupRecaptcha, verifyOTP } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Execute reCAPTCHA Enterprise
      const recaptchaToken = await executeRecaptcha('login');
      console.log('reCAPTCHA token obtained for login:', recaptchaToken ? 'success' : 'failed');
      
      await signIn(email, password);
      router.push('/navigator');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
        // Execute reCAPTCHA Enterprise for phone auth
        const recaptchaToken = await executeRecaptcha('phone_login');
        console.log('reCAPTCHA token obtained for phone login:', recaptchaToken ? 'success' : 'failed');
        
        // Format phone number with country code if not present
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
        await setupRecaptcha(formattedPhone);
        setShowOtpInput(true);
      } else {
        await verifyOTP(otp);
        router.push('/navigator');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with phone');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Execute reCAPTCHA Enterprise for Google sign-in
      const recaptchaToken = await executeRecaptcha('google_login');
      console.log('reCAPTCHA token obtained for Google login:', recaptchaToken ? 'success' : 'failed');
      
      await signInWithGoogle();
      router.push('/navigator');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sunset flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <FaLeaf className="text-6xl text-accent mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-white mb-2 font-serif">
            Welcome Back
          </h1>
          <p className="text-accent">Continue your wealth journey</p>
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
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'email'
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
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'phone'
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
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
              <span>Sign in with Google</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-darkwood">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-amber font-bold">
              Sign Up
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
  );
}
