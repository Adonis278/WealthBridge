'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaStar, FaCalendarAlt, FaFilter, FaLinkedin, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { bookSession, getUserSessions } from '@/lib/mentorshipService';
import { addPoints } from '@/lib/gamificationService';

interface Mentor {
  id: number;
  name: string;
  title: string;
  expertise: string[];
  rating: number;
  sessions: number;
  availability: string;
  bio: string;
  image: string;
}

export default function MentorshipPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userSessions, setUserSessions] = useState<any[]>([]);

  const categories = ['all', 'Credit Building', 'Investing', 'Budgeting', 'Real Estate', 'Entrepreneurship'];

  // Load user's booked sessions
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      try {
        const result = await getUserSessions(user.uid);
        if (result.success && result.data) {
          setUserSessions(result.data);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };

    loadSessions();
  }, [user]);

  const handleBookSession = async () => {
    if (!user || !selectedMentor || !bookingDate || !bookingTime) {
      alert('Please fill in all booking details');
      return;
    }

    setLoading(true);
    try {
      const result = await bookSession(
        user.uid,
        selectedMentor.id.toString(),
        selectedMentor.name,
        bookingDate,
        bookingTime
      );

      if (result.success) {
        // Award points for booking
        await addPoints(user.uid, 100);
        
        alert('Session booked successfully! 🎉');
        setShowBookingModal(false);
        setSelectedMentor(null);
        setBookingDate('');
        setBookingTime('');
        
        // Reload sessions
        const sessionsResult = await getUserSessions(user.uid);
        if (sessionsResult.success && sessionsResult.data) {
          setUserSessions(sessionsResult.data);
        }
      } else {
        alert('Failed to book session. Please try again.');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // PREVIEW DATA — these are example specialisms, not real people. No mentor has
  // been onboarded yet, so nothing here asserts a name, a rating or a client
  // outcome. Replace with records from the `mentors` collection once real
  // mentors are signed up.
  const mentors: Mentor[] = [
    {
      id: 1,
      name: 'Credit Building Specialist',
      title: 'Coming soon',
      expertise: ['Credit Building', 'Debt Management'],
      rating: 0,
      sessions: 0,
      availability: 'Joining soon',
      bio: 'Will cover utilization strategy, collections and dispute basics, and rebuilding after a setback.',
      image: '💳',
    },
    {
      id: 2,
      name: 'Investing Coach',
      title: 'Coming soon',
      expertise: ['Investing', 'Portfolio Management'],
      rating: 0,
      sessions: 0,
      availability: 'Joining soon',
      bio: 'Will cover getting started with index funds, risk tolerance and long-term allocation.',
      image: '📈',
    },
    {
      id: 3,
      name: 'Budgeting Guide',
      title: 'Coming soon',
      expertise: ['Budgeting', 'Savings Strategy'],
      rating: 0,
      sessions: 0,
      availability: 'Joining soon',
      bio: 'Will cover building a first budget, emergency funds and steady saving habits.',
      image: '📝',
    },
    {
      id: 4,
      name: 'Real Estate Mentor',
      title: 'Coming soon',
      expertise: ['Real Estate', 'Investing'],
      rating: 0,
      sessions: 0,
      availability: 'Joining soon',
      bio: 'Will cover mortgage readiness, what lenders look for and first-property planning.',
      image: '🏠',
    },
    {
      id: 5,
      name: 'Small Business Coach',
      title: 'Coming soon',
      expertise: ['Entrepreneurship', 'Business Finance'],
      rating: 0,
      sessions: 0,
      availability: 'Joining soon',
      bio: 'Will cover separating personal and business credit, and funding options for new businesses.',
      image: '💼',
    },
  ];

  const filteredMentors = selectedCategory === 'all'
    ? mentors
    : mentors.filter((mentor) => mentor.expertise.includes(selectedCategory));

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
            Mentorship Hub
          </h1>
          <p className="text-xl text-darkwood">
            One-to-one guidance on credit, investing and budgeting
          </p>

          <div className="mt-6 inline-flex items-start gap-3 text-left bg-amber/15 border border-amber/50 rounded-xl px-5 py-3 max-w-2xl">
            <FaInfoCircle className="text-amber mt-0.5 flex-shrink-0" />
            <p className="text-sm text-darkwood">
              <strong className="text-secondary">Preview.</strong> The profiles below show the
              specialisms we&apos;re onboarding. No mentors are bookable yet &mdash; register your
              interest and we&apos;ll let you know the moment sessions open.
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted-glass rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <FaFilter className="text-2xl text-primary" />
            <h3 className="text-lg font-bold text-secondary">Filter by Expertise</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-secondary hover:bg-amber hover:text-white'
                }`}
              >
                {category === 'all' ? 'All Mentors' : category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="frosted-glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedMentor(mentor)}
            >
              {/* Mentor Avatar */}
              <div className="text-center mb-4">
                <div className="bg-gradient-to-br from-primary to-secondary w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                  {mentor.image}
                </div>
                <h3 className="text-xl font-bold text-secondary font-serif">
                  {mentor.name}
                </h3>
                <p className="text-sm text-darkwood">{mentor.title}</p>
              </div>

              {/* Rating & Sessions — hidden until a mentor has a real history */}
              <div className="flex justify-center items-center space-x-6 mb-4">
                {mentor.sessions > 0 ? (
                  <>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-amber" />
                      <span className="font-bold text-secondary">{mentor.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-darkwood">
                      {mentor.sessions} sessions
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber bg-amber/15 border border-amber/40 rounded-full px-3 py-1">
                    Not yet available
                  </span>
                )}
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertise.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber bg-opacity-20 text-primary text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="text-sm text-darkwood mb-4 line-clamp-2">
                {mentor.bio}
              </p>

              {/* Availability */}
              <div className="flex items-center space-x-2 text-sm text-secondary mb-4">
                <FaCalendarAlt className="text-primary" />
                <span>{mentor.availability}</span>
              </div>

              {/* CTA Button — booking stays disabled until a mentor is live */}
              <button
                disabled={mentor.sessions === 0}
                className="w-full bg-primary hover:bg-amber text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:bg-darkwood/25 disabled:text-darkwood disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-darkwood/25"
              >
                {mentor.sessions === 0 ? 'Booking opens soon' : 'Schedule Session'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mentor Detail Modal */}
        {selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMentor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-primary to-secondary w-20 h-20 rounded-full flex items-center justify-center text-4xl">
                    {selectedMentor.image}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-secondary font-serif">
                      {selectedMentor.name}
                    </h2>
                    <p className="text-lg text-darkwood">{selectedMentor.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-amber bg-opacity-10 rounded-lg">
                  <FaStar className="text-3xl text-amber mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary">
                    {selectedMentor.sessions > 0 ? selectedMentor.rating.toFixed(1) : '—'}
                  </div>
                  <div className="text-sm text-darkwood">Rating</div>
                </div>
                <div className="text-center p-4 bg-primary bg-opacity-10 rounded-lg">
                  <FaUsers className="text-3xl text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary">
                    {selectedMentor.sessions > 0 ? selectedMentor.sessions : '—'}
                  </div>
                  <div className="text-sm text-darkwood">Sessions</div>
                </div>
                <div className="text-center p-4 bg-secondary bg-opacity-10 rounded-lg">
                  <FaCalendarAlt className="text-3xl text-secondary mx-auto mb-2" />
                  <div className="text-sm font-bold text-secondary mt-2">Available</div>
                  <div className="text-xs text-darkwood">{selectedMentor.availability}</div>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-secondary mb-3 font-serif">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-amber text-white font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-secondary mb-3 font-serif">About</h3>
                <p className="text-darkwood leading-relaxed">{selectedMentor.bio}</p>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                {user ? (
                  <>
                    {!showBookingModal ? (
                      <button 
                        onClick={() => setShowBookingModal(true)}
                        className="w-full bg-primary hover:bg-amber text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center space-x-3"
                      >
                        <FaCalendarAlt />
                        <span>Schedule 1-on-1 Session</span>
                      </button>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-bold text-secondary">Book Your Session</h4>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Select Date
                          </label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Select Time
                          </label>
                          <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleBookSession}
                            disabled={loading || !bookingDate || !bookingTime}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Booking...' : 'Confirm Booking'}
                          </button>
                          <button
                            onClick={() => setShowBookingModal(false)}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-secondary font-bold py-3 px-6 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-amber bg-opacity-20 p-4 rounded-lg text-center">
                    <p className="text-darkwood mb-3">Please log in to book a session</p>
                    <a
                      href="/login"
                      className="inline-block bg-primary hover:bg-amber text-white font-bold py-2 px-6 rounded-lg transition-all"
                    >
                      Log In
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <FaLinkedin />
                    <span>LinkedIn</span>
                  </button>
                  <button className="bg-secondary hover:bg-darkwood text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <FaEnvelope />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
