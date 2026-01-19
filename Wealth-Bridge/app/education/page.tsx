'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaChartLine, FaCheckCircle, FaTrophy, FaLock } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { saveEducationProgress, getEducationProgress, saveQuizScore } from '@/lib/educationService';
import { addPoints } from '@/lib/gamificationService';

interface Module {
  id: string;
  title: string;
  icon: any;
  description: string;
  lessons: Lesson[];
  color: string;
}

interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  locked: boolean;
}

export default function EducationPage() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([
    {
      id: 'credit',
      title: 'Credit Repair 101',
      icon: FaCreditCard,
      description: 'Master the fundamentals of building and maintaining excellent credit.',
      color: 'from-primary to-amber',
      lessons: [
        { id: 1, title: 'Understanding Credit Scores', completed: true, locked: false },
        { id: 2, title: 'Credit Report Basics', completed: true, locked: false },
        { id: 3, title: 'Disputing Errors', completed: false, locked: false },
        { id: 4, title: 'Building Credit History', completed: false, locked: false },
        { id: 5, title: 'Managing Credit Cards', completed: false, locked: true },
        { id: 6, title: 'Credit Utilization Tips', completed: false, locked: true },
      ],
    },
    {
      id: 'investing',
      title: 'Investing Basics',
      icon: FaChartLine,
      description: 'Learn the principles of smart investing and grow your wealth.',
      color: 'from-secondary to-darkwood',
      lessons: [
        { id: 1, title: 'Introduction to Investing', completed: true, locked: false },
        { id: 2, title: 'Stocks vs Bonds', completed: false, locked: false },
        { id: 3, title: 'Understanding Risk & Reward', completed: false, locked: false },
        { id: 4, title: 'Portfolio Diversification', completed: false, locked: true },
        { id: 5, title: 'Index Funds & ETFs', completed: false, locked: true },
        { id: 6, title: 'Long-term Investment Strategy', completed: false, locked: true },
      ],
    },
  ]);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Load user's progress from Firebase
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load progress for credit module
        const creditProgress = await getEducationProgress(user.uid, 'credit');
        // Load progress for investing module
        const investingProgress = await getEducationProgress(user.uid, 'investing');

        if (creditProgress.success && creditProgress.data) {
          setModules((prev) =>
            prev.map((module) => {
              if (module.id === 'credit') {
                const updatedLessons = module.lessons.map((lesson) => ({
                  ...lesson,
                  completed: creditProgress.data?.completedLessons?.includes(lesson.id.toString()) || false,
                }));
                return { ...module, lessons: updatedLessons };
              }
              return module;
            })
          );
        }

        if (investingProgress.success && investingProgress.data) {
          setModules((prev) =>
            prev.map((module) => {
              if (module.id === 'investing') {
                const updatedLessons = module.lessons.map((lesson) => ({
                  ...lesson,
                  completed: investingProgress.data?.completedLessons?.includes(lesson.id.toString()) || false,
                }));
                return { ...module, lessons: updatedLessons };
              }
              return module;
            })
          );
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const calculateProgress = (lessons: Lesson[]) => {
    const completed = lessons.filter((l) => l.completed).length;
    return (completed / lessons.length) * 100;
  };

  const handleLessonComplete = async (moduleId: string, lessonId: number) => {
    if (!user) return;

    // Update UI optimistically
    setModules((prev) =>
      prev.map((module) => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.map((lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, completed: true };
            }
            return lesson;
          });
          return { ...module, lessons: updatedLessons };
        }
        return module;
      })
    );

    // Save to Firebase
    try {
      // Get current module to save all lessons
      const currentModule = modules.find(m => m.id === moduleId);
      if (currentModule) {
        const lessonsData = currentModule.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          completed: lesson.id === lessonId ? true : lesson.completed,
          completedAt: lesson.id === lessonId ? new Date() : undefined
        }));
        
        await saveEducationProgress(user.uid, moduleId, currentModule.title, lessonsData);
        // Award points for completing a lesson
        await addPoints(user.uid, 50);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleQuizComplete = async () => {
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    setQuizScore(score);
    
    // Save quiz score to Firebase
    if (user && selectedModule) {
      try {
        await saveQuizScore(user.uid, selectedModule, score);
        // Award points based on score
        const pointsEarned = Math.floor(score / 10) * 10; // 70-100 points
        await addPoints(user.uid, pointsEarned);
      } catch (error) {
        console.error('Error saving quiz score:', error);
      }
    }
    
    setTimeout(() => {
      setShowQuiz(false);
      setQuizScore(null);
    }, 3000);
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
            Financial Education Hub
          </h1>
          <p className="text-xl text-darkwood">
            Build your financial knowledge with our interactive learning modules
          </p>
        </motion.div>

        {/* Show login message if not authenticated */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 frosted-glass rounded-xl p-6 text-center"
          >
            <p className="text-darkwood mb-4">
              Please log in to track your progress and earn points!
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
            <p className="mt-4 text-darkwood">Loading your progress...</p>
          </div>
        )}

        {/* Modules Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const progress = calculateProgress(module.lessons);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="frosted-glass rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className={`bg-gradient-to-r ${module.color} p-6 rounded-xl mb-6`}>
                  <Icon className="text-5xl text-white mb-4" />
                  <h2 className="text-3xl font-bold text-white font-serif">{module.title}</h2>
                  <p className="text-accent mt-2">{module.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-secondary">Progress</span>
                    <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`bg-gradient-to-r ${module.color} h-3 rounded-full`}
                    />
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        lesson.locked
                          ? 'bg-gray-100 opacity-60'
                          : lesson.completed
                          ? 'bg-green-50 border-2 border-green-300'
                          : 'bg-white border-2 border-amber hover:border-primary cursor-pointer'
                      }`}
                      onClick={() => !lesson.locked && !lesson.completed && handleLessonComplete(module.id, lesson.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.locked ? (
                          <FaLock className="text-gray-400" />
                        ) : lesson.completed ? (
                          <FaCheckCircle className="text-green-500 text-xl" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-primary rounded-full" />
                        )}
                        <span className={`font-medium ${lesson.locked ? 'text-gray-400' : 'text-secondary'}`}>
                          {lesson.title}
                        </span>
                      </div>
                      {lesson.completed && <FaTrophy className="text-amber" />}
                    </div>
                  ))}
                </div>

                {/* Quiz Button */}
                <button
                  onClick={() => {
                    setSelectedModule(module.id);
                    setShowQuiz(true);
                  }}
                  className="w-full mt-6 bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  Take Module Quiz
                </button>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Quiz Modal */}
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !quizScore && setShowQuiz(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {quizScore === null ? (
                <>
                  <h3 className="text-3xl font-bold text-secondary mb-6 font-serif">
                    Module Quiz
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-lg text-darkwood mb-4">
                        1. What is a good credit score range?
                      </p>
                      <div className="space-y-2">
                        {['300-500', '500-650', '670-850', '850-1000'].map((option) => (
                          <button
                            key={option}
                            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleQuizComplete}
                      className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <FaTrophy className="text-6xl text-amber mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-secondary mb-4 font-serif">
                    Great Job!
                  </h3>
                  <p className="text-2xl text-primary mb-2">Score: {quizScore}%</p>
                  <p className="text-darkwood">Keep up the excellent work!</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
