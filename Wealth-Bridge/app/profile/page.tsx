'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCamera, FaSave, FaBell, FaMoon, FaBolt, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile, uploadProfilePhoto, updatePreferences } from '@/lib/userService';
import { getUserStats } from '@/lib/gamificationService';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  // User stats
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState(0);
  
  // Preferences
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Credit analyses history
  interface AnalysisRecord {
    id: string;
    score: number | null;
    projectedScore: number | null;
    scoreBand: string | null;
    goalType: string | null;
    riskAlerts: string[];
    createdAt: { seconds: number } | null;
  }
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        // Load profile
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success && profileResult.data) {
          setDisplayName(profileResult.data.displayName || '');
          setEmail(profileResult.data.email || '');
          setBio(profileResult.data.bio || '');
          setLocation(profileResult.data.location || '');
          setPhotoURL(profileResult.data.photoURL || '');
          
          if (profileResult.data.preferences) {
            setNotifications(profileResult.data.preferences.notifications ?? true);
            setEmailUpdates(profileResult.data.preferences.emailUpdates ?? true);
            setDarkMode(profileResult.data.preferences.darkMode ?? false);
          }
        }

        // Load stats
        const statsResult = await getUserStats(user.uid);
        if (statsResult.success && statsResult.data) {
          setPoints(statsResult.data.points || 0);
          setLevel(statsResult.data.level || 1);
          setAchievements(statsResult.data.achievements?.length || 0);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadAnalyses = async () => {
      setAnalysesLoading(true);
      try {
        const q = query(
          collection(db, 'creditAnalysisResults'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        const rows: AnalysisRecord[] = snap.docs.map((d) => ({
          id: d.id,
          score: d.data().score ?? null,
          projectedScore: d.data().projectedScore ?? null,
          scoreBand: d.data().scoreBand ?? null,
          goalType: d.data().goalType ?? null,
          riskAlerts: d.data().riskAlerts ?? [],
          createdAt: d.data().createdAt ?? null,
        }));
        setAnalyses(rows);
      } catch (e) {
        console.error('Failed to load analyses:', e);
      } finally {
        setAnalysesLoading(false);
      }
    };

    loadProfile();
    loadAnalyses();
  }, [user, router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates = {
        displayName,
        bio,
        location
      };

      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {
        alert('Profile updated successfully! ✅');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProfilePhoto(user.uid, file);
      if (result.success && result.photoURL) {
        setPhotoURL(result.photoURL);
        alert('Profile photo updated! 📸');
      } else {
        alert('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      const prefs = {
        notifications,
        emailUpdates,
        darkMode
      };

      const result = await updatePreferences(user.uid, prefs);
      if (result.success) {
        alert('Preferences saved! ⚙️');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-darkwood">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
            My Profile
          </h1>
          <p className="text-xl text-darkwood">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="frosted-glass rounded-xl p-6 text-center shadow-lg"
          >
            <div className="text-4xl font-bold text-primary mb-2">{points}</div>
            <div className="text-sm text-darkwood">Total Points</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="frosted-glass rounded-xl p-6 text-center shadow-lg"
          >
            <div className="text-4xl font-bold text-amber mb-2">Level {level}</div>
            <div className="text-sm text-darkwood">Current Level</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="frosted-glass rounded-xl p-6 text-center shadow-lg"
          >
            <div className="text-4xl font-bold text-secondary mb-2">{achievements}</div>
            <div className="text-sm text-darkwood">Achievements</div>
          </motion.div>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="frosted-glass rounded-2xl p-8 shadow-xl mb-8"
        >
          <h2 className="text-2xl font-bold text-secondary mb-6 font-serif">
            Profile Information
          </h2>

          {/* Profile Photo */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  <Image src={photoURL} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-4xl text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-amber text-white p-2 rounded-full cursor-pointer transition-all">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary">{displayName || 'Set your name'}</h3>
              <p className="text-darkwood">{email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Display Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-darkwood mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Location
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </motion.div>

        {/* Credit Analyses History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="frosted-glass rounded-2xl p-8 shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary font-serif flex items-center gap-2">
              <FaChartLine className="text-primary" /> Credit Analysis History
            </h2>
            <Link href="/credit-builder"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:text-secondary transition-colors">
              New Analysis <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {analysesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-accent/60 rounded-xl">
              <FaChartLine className="text-4xl text-accent mx-auto mb-3" />
              <p className="text-secondary font-semibold">No analyses yet</p>
              <p className="text-sm text-darkwood mt-1 mb-4">Upload a credit report to get your first AI-powered analysis.</p>
              <Link href="/credit-builder"
                className="inline-block bg-primary hover:bg-secondary text-white text-sm font-bold px-5 py-2 rounded-lg transition-all">
                Start Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((a) => {
                const date = a.createdAt?.seconds
                  ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently';
                const scoreColor =
                  (a.score ?? 0) >= 740 ? 'text-primary' :
                  (a.score ?? 0) >= 670 ? 'text-amber' : 'text-secondary';
                const goalLabel: Record<string, string> = {
                  buy_home: 'Buy a Home', finance_car: 'Finance a Car', premium_card: 'Premium Card',
                  rent_apartment: 'Rent Apartment', business_funding: 'Business Funding', improve_score: 'Improve Score',
                };
                return (
                  <div key={a.id} className="bg-white/70 border border-accent/40 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-4xl font-black tabular-nums ${scoreColor}`}>
                            {a.score ?? '—'}
                          </div>
                          <div className="text-xs text-darkwood/60 font-medium">{a.scoreBand ?? 'Score'}</div>
                        </div>
                        {a.projectedScore && (
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-2xl font-bold text-primary/70">
                              <FaBolt className="text-sm" />{a.projectedScore}
                            </div>
                            <div className="text-xs text-darkwood/60 font-medium">6-mo target</div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                          {a.goalType ? (goalLabel[a.goalType] ?? a.goalType) : 'General'}
                        </div>
                        <div className="text-xs text-darkwood/60 block">{date}</div>
                      </div>
                    </div>
                    {a.riskAlerts.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {a.riskAlerts.slice(0, 2).map((alert, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-secondary bg-accent/20 rounded-lg px-3 py-1.5">
                            <FaExclamationTriangle className="text-primary flex-shrink-0 mt-0.5" />
                            {alert}
                          </div>
                        ))}
                        {a.riskAlerts.length > 2 && (
                          <p className="text-xs text-darkwood/50 pl-1">+{a.riskAlerts.length - 2} more alerts in full report</p>
                        )}
                      </div>
                    )}
                    {a.riskAlerts.length === 0 && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-1.5">
                        <FaCheckCircle className="flex-shrink-0" /> No risk alerts detected
                      </div>
                    )}
                  </div>
                );
              })}
              {analyses.length === 5 && (
                <p className="text-center text-xs text-darkwood/50 pt-1">Showing 5 most recent analyses</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="frosted-glass rounded-2xl p-8 shadow-xl mb-8"
        >
          <h2 className="text-2xl font-bold text-secondary mb-6 font-serif">
            Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <FaBell className="text-2xl text-primary" />
                <div>
                  <div className="font-medium text-secondary">Push Notifications</div>
                  <div className="text-sm text-darkwood">Receive notifications about your progress</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-2xl text-primary" />
                <div>
                  <div className="font-medium text-secondary">Email Updates</div>
                  <div className="text-sm text-darkwood">Get weekly progress reports via email</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <FaMoon className="text-2xl text-primary" />
                <div>
                  <div className="font-medium text-secondary">Dark Mode</div>
                  <div className="text-sm text-darkwood">Switch to dark theme (coming soon)</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full bg-secondary hover:bg-darkwood text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Save Preferences
            </button>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Logout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
