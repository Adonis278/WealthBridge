'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaCrown, FaLeaf, FaFire, FaStar, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats, getLeaderboard } from '@/lib/gamificationService';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  points: number;
  category: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  achievements: number;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(450);
  const [userLevel, setUserLevel] = useState(5);
  const [treeGrowth, setTreeGrowth] = useState(65); // Percentage of tree growth
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);

  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first financial education module',
      icon: FaStar,
      unlocked: true,
      points: 50,
      category: 'Education',
    },
    {
      id: 2,
      name: '7-Day Streak',
      description: 'Log in for 7 consecutive days',
      icon: FaFire,
      unlocked: true,
      points: 100,
      category: 'Engagement',
    },
    {
      id: 3,
      name: 'Credit Master',
      description: 'Improve your credit score by 50 points',
      icon: FaMedal,
      unlocked: true,
      points: 150,
      category: 'Credit',
    },
    {
      id: 4,
      name: 'First Investment',
      description: 'Make your first investment in the simulator',
      icon: FaChartLine,
      unlocked: true,
      points: 100,
      category: 'Investing',
    },
    {
      id: 5,
      name: 'Portfolio Builder',
      description: 'Build a portfolio with 5+ different investments',
      icon: FaTrophy,
      unlocked: false,
      points: 200,
      category: 'Investing',
    },
    {
      id: 6,
      name: 'Mentor Connection',
      description: 'Schedule your first mentorship session',
      icon: FaMedal,
      unlocked: false,
      points: 150,
      category: 'Mentorship',
    },
    {
      id: 7,
      name: 'Knowledge Seeker',
      description: 'Complete all education modules',
      icon: FaCrown,
      unlocked: false,
      points: 300,
      category: 'Education',
    },
    {
      id: 8,
      name: '30-Day Streak',
      description: 'Log in for 30 consecutive days',
      icon: FaFire,
      unlocked: false,
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
        }

        // Load leaderboard
        const leaderboardResult = await getLeaderboard(10);
        if (leaderboardResult.success && leaderboardResult.data) {
          const formattedLeaderboard: LeaderboardUser[] = leaderboardResult.data.map((entry, index) => ({
            rank: entry.rank,
            name: entry.name,
            points: entry.points,
            avatar: index < 3 ? ['🥇', '🥈', '🥉'][index] : '👤',
            achievements: entry.achievements
          }));
          setLeaderboardData(formattedLeaderboard);
        }
      } catch (error) {
        console.error('Error loading achievements data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const leaderboard: LeaderboardUser[] = leaderboardData.length > 0 ? leaderboardData : [
    { rank: 1, name: 'Alex Rivera', points: 1850, avatar: '🥇', achievements: 12 },
    { rank: 2, name: 'Jordan Kim', points: 1620, avatar: '🥈', achievements: 11 },
    { rank: 3, name: 'Taylor Brooks', points: 1450, avatar: '🥉', achievements: 10 },
    { rank: 4, name: 'Morgan Lee', points: 1200, avatar: '👤', achievements: 9 },
    { rank: 5, name: 'You', points: userPoints, avatar: '😊', achievements: 4 },
    { rank: 6, name: 'Casey Jones', points: 380, avatar: '👤', achievements: 6 },
    { rank: 7, name: 'Jamie Smith', points: 320, avatar: '👤', achievements: 5 },
    { rank: 8, name: 'Riley Chen', points: 280, avatar: '👤', achievements: 4 },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

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
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
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
              Please log in to track your achievements and see the leaderboard!
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
                <span>Leaderboard</span>
              </h3>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      user.name === 'You'
                        ? 'bg-gradient-to-r from-primary to-amber text-white shadow-lg'
                        : index < 3
                        ? 'bg-amber bg-opacity-20'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <div className={`font-bold ${user.name === 'You' ? 'text-white' : 'text-secondary'}`}>
                          {user.name}
                        </div>
                        <div className={`text-xs ${user.name === 'You' ? 'text-accent' : 'text-darkwood'}`}>
                          {user.achievements} achievements
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${user.name === 'You' ? 'text-white' : 'text-primary'}`}>
                        #{user.rank}
                      </div>
                      <div className={`text-sm ${user.name === 'You' ? 'text-accent' : 'text-darkwood'}`}>
                        {user.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
