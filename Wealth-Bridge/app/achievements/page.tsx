'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaCrown, FaLeaf, FaFire, FaStar, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats } from '@/lib/gamificationService';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  points: number;
  category: string;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [treeGrowth, setTreeGrowth] = useState(0); // Percentage of tree growth
  const [loading, setLoading] = useState(true);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  // Catalog of achievements. `unlocked` is derived from the user's own record
  // below — never hardcoded.
  const achievementCatalog: Omit<Achievement, 'unlocked'>[] = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first financial education module',
      icon: FaStar,
      points: 50,
      category: 'Education',
    },
    {
      id: 2,
      name: '7-Day Streak',
      description: 'Log in for 7 consecutive days',
      icon: FaFire,
      points: 100,
      category: 'Engagement',
    },
    {
      id: 3,
      name: 'Credit Master',
      description: 'Improve your credit score by 50 points',
      icon: FaMedal,
      points: 150,
      category: 'Credit',
    },
    {
      id: 4,
      name: 'First Investment',
      description: 'Make your first investment in the simulator',
      icon: FaChartLine,
      points: 100,
      category: 'Investing',
    },
    {
      id: 5,
      name: 'Portfolio Builder',
      description: 'Build a portfolio with 5+ different investments',
      icon: FaTrophy,
      points: 200,
      category: 'Investing',
    },
    {
      id: 6,
      name: 'Mentor Connection',
      description: 'Schedule your first mentorship session',
      icon: FaMedal,
      points: 150,
      category: 'Mentorship',
    },
    {
      id: 7,
      name: 'Knowledge Seeker',
      description: 'Complete all education modules',
      icon: FaCrown,
      points: 300,
      category: 'Education',
    },
    {
      id: 8,
      name: '30-Day Streak',
      description: 'Log in for 30 consecutive days',
      icon: FaFire,
      points: 250,
      category: 'Engagement',
    },
  ];

  // Load user stats and leaderboard from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load user stats
        const statsResult = await getUserStats(user.uid);
        if (statsResult.success && statsResult.data) {
          setUserPoints(statsResult.data.points || 0);
          setUserLevel(statsResult.data.level || 1);
          setTreeGrowth(statsResult.data.treeGrowth || 0);
          setUnlockedIds(
            (statsResult.data.achievements ?? []).map((item) => item.id)
          );
        }
      } catch (error) {
        console.error('Error loading achievements data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const achievements: Achievement[] = achievementCatalog.map((item) => ({
    ...item,
    unlocked: unlockedIds.includes(item.id),
  }));

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);
  const pointsFromAchievements = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getLevelProgress = () => {
    const pointsForNextLevel = userLevel * 100;
    const currentProgress = (userPoints % 100);
    return (currentProgress / pointsForNextLevel) * 100;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4 font-serif">
            Achievements & Progress
          </h1>
          <p className="text-xl text-darkwood">
            Track your milestones and celebrate your financial journey
          </p>
        </motion.div>

        {/* Show login message if not authenticated */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 frosted-glass rounded-xl p-6 text-center"
          >
            <FaTrophy className="text-6xl text-amber mx-auto mb-4" />
            <p className="text-darkwood mb-4">
              Log in to track your achievements and watch your progress grow.
            </p>
            <a
              href="/login"
              className="inline-block bg-primary hover:bg-amber text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Log In
            </a>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && user && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-darkwood">Loading your achievements...</p>
          </div>
        )}

        {!loading && user && (
        <>
        {/* User Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="frosted-glass rounded-2xl p-8 shadow-xl text-center"
          >
            <FaTrophy className="text-6xl text-amber mx-auto mb-4" />
            <div className="text-4xl font-bold text-secondary mb-2">{userPoints}</div>
            <div className="text-darkwood">Total Points</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="frosted-glass rounded-2xl p-8 shadow-xl text-center"
          >
            <FaCrown className="text-6xl text-primary mx-auto mb-4" />
            <div className="text-4xl font-bold text-secondary mb-2">Level {userLevel}</div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getLevelProgress()}%` }}
                className="bg-gradient-to-r from-primary to-amber h-3 rounded-full"
              />
            </div>
            <div className="text-sm text-darkwood mt-2">
              {100 - (userPoints % 100)} points to Level {userLevel + 1}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="frosted-glass rounded-2xl p-8 shadow-xl text-center"
          >
            <FaMedal className="text-6xl text-accent mx-auto mb-4" />
            <div className="text-4xl font-bold text-secondary mb-2">
              {unlockedAchievements.length}/{achievements.length}
            </div>
            <div className="text-darkwood">Achievements Unlocked</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Achievements Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Unlocked Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-secondary mb-6 font-serif flex items-center space-x-3">
                <FaTrophy className="text-amber" />
                <span>Unlocked Achievements</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-amber to-primary p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Icon className="text-5xl text-white mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2 font-serif">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-accent mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">+{achievement.points} pts</span>
                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white">
                          {achievement.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Locked Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-secondary mb-6 font-serif flex items-center space-x-3">
                <FaMedal className="text-gray-400" />
                <span>Locked Achievements</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lockedAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-100 p-6 rounded-xl shadow-md border-2 border-dashed border-gray-300"
                    >
                      <Icon className="text-5xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2 font-serif">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-bold">+{achievement.points} pts</span>
                        <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                          {achievement.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Autumn Tree */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl text-center"
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
                Your Growth Tree
              </h3>
              <div className="relative h-64 mb-6">
                {/* Tree Trunk */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 bg-darkwood rounded-t-lg" style={{ height: '40%' }} />
                
                {/* Tree Foliage */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-primary to-amber rounded-full flex items-center justify-center opacity-90">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🍂</div>
                    <div className="text-white font-bold text-2xl">{treeGrowth}%</div>
                  </div>
                </div>

                {/* Floating Leaves */}
                {[...Array(Math.floor(treeGrowth / 10))].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: [0, 10, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute text-2xl"
                    style={{
                      left: `${20 + (i * 10) % 60}%`,
                      top: `${10 + (i * 15) % 50}%`,
                    }}
                  >
                    <FaLeaf className="text-primary" />
                  </motion.div>
                ))}
              </div>
              <p className="text-darkwood text-sm">
                Your tree grows as you complete tasks and unlock achievements!
              </p>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 font-serif flex items-center space-x-2">
                <FaCrown className="text-amber" />
                <span>Your Standing</span>
              </h3>

              <div className="bg-gradient-to-r from-primary to-amber text-white rounded-xl p-5 shadow-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/80 font-semibold">Level</div>
                    <div className="text-4xl font-black leading-none mt-1">{userLevel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-white/80 font-semibold">Total points</div>
                    <div className="text-4xl font-black leading-none mt-1 tabular-nums">{userPoints}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/70 border border-accent/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-primary tabular-nums">
                    {unlockedAchievements.length}
                  </div>
                  <div className="text-xs text-darkwood mt-0.5">Unlocked</div>
                </div>
                <div className="bg-white/70 border border-accent/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-secondary tabular-nums">
                    {pointsFromAchievements}
                  </div>
                  <div className="text-xs text-darkwood mt-0.5">Badge points</div>
                </div>
              </div>

              <p className="text-xs text-darkwood/80 mt-4 leading-relaxed">
                Community rankings are coming once more members join. Your points and
                badges are already being tracked.
              </p>
            </motion.div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
