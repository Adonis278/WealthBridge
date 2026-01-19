'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCamera, FaSave, FaBell, FaMoon } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile, uploadProfilePhoto, updatePreferences } from '@/lib/userService';
import { getUserStats } from '@/lib/gamificationService';

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

    loadProfile();
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
