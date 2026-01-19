'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTrophy, FaFire, FaSmile, FaMeh, FaSadTear } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getChatHistory, saveMessage } from '@/lib/chatService';
import { getUserStats, addPoints, updateStreak } from '@/lib/gamificationService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function NavigatorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Wealth Navigator 🍂. I'm here to guide you on your financial journey. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [streak, setStreak] = useState(7);
  const [points, setPoints] = useState(450);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('happy');
  const [loading, setLoading] = useState(true);

  const achievements = [
    { id: 1, name: '7-Day Streak', icon: FaFire, unlocked: true, color: 'text-orange-500' },
    { id: 2, name: 'First Investment', icon: FaTrophy, unlocked: true, color: 'text-amber' },
    { id: 3, name: 'Credit Builder', icon: FaTrophy, unlocked: false, color: 'text-gray-400' },
  ];

  // Load chat history and user stats from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load chat history
        const chatResult = await getChatHistory(user.uid);
        if (chatResult.success && chatResult.data?.messages) {
          setMessages(chatResult.data.messages);
        }

        // Load user stats
        const statsResult = await getUserStats(user.uid);
        if (statsResult.success && statsResult.data) {
          setPoints(statsResult.data.points || 0);
          setStreak(statsResult.data.streak || 0);
          
          // Set mood based on streak
          if (statsResult.data.streak >= 7) {
            setMood('happy');
          } else if (statsResult.data.streak >= 3) {
            setMood('neutral');
          } else {
            setMood('sad');
          }
        }

        // Update streak for daily login
        await updateStreak(user.uid);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const quickResponses = [
    'How can I improve my credit score?',
    'What should I invest in?',
    'How do I start building wealth?',
    'Tell me about budgeting',
  ];

  const motivationalQuotes = [
    "Every step forward is a step toward financial freedom! 🌟",
    "You're making great progress on your wealth journey! 🍂",
    "Keep up the amazing work - your future self will thank you! 💪",
    "Small steps today lead to big achievements tomorrow! 🎯",
  ];

  const botResponses: { [key: string]: string } = {
    credit: "Great question! To improve your credit score: \n\n1. Pay bills on time (35% of score)\n2. Keep credit utilization below 30%\n3. Don't close old credit cards\n4. Monitor your credit report regularly\n\nWant to check your credit dashboard? 📊",
    invest: "Smart thinking! Here's my advice for new investors:\n\n1. Start with index funds (low risk, diversified)\n2. Only invest what you can afford to lose\n3. Think long-term (5+ years)\n4. Diversify your portfolio\n\nWant to try our Investment Simulator? 💰",
    wealth: "Building wealth takes time, but you can do it! Here's a plan:\n\n1. Create an emergency fund (3-6 months expenses)\n2. Pay off high-interest debt\n3. Start investing early\n4. Increase income streams\n\nI'm here to guide you every step! 🌱",
    budget: "Budgeting is key to financial success! Try the 50/30/20 rule:\n\n50% - Needs (rent, food, utilities)\n30% - Wants (entertainment, dining)\n20% - Savings & debt payment\n\nLet's build your first budget together! 📝",
    default: "That's an interesting question! While I'm learning to help you better, you can explore our Education Hub to learn more about financial topics. Is there something specific about credit, investing, or budgeting I can help with? 🤔",
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    // Save user message to Firebase
    try {
      await saveMessage(user.uid, { text: inputMessage, sender: 'user' });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Determine bot response
    setTimeout(async () => {
      let responseText = botResponses.default;
      const lowerInput = inputMessage.toLowerCase();

      if (lowerInput.includes('credit') || lowerInput.includes('score')) {
        responseText = botResponses.credit;
      } else if (lowerInput.includes('invest')) {
        responseText = botResponses.invest;
      } else if (lowerInput.includes('wealth') || lowerInput.includes('start')) {
        responseText = botResponses.wealth;
      } else if (lowerInput.includes('budget')) {
        responseText = botResponses.budget;
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Save bot message to Firebase and award points
      try {
        await saveMessage(user.uid, { text: responseText, sender: 'bot' });
        await addPoints(user.uid, 10);
        setPoints((prev) => prev + 10);
      } catch (error) {
        console.error('Error saving bot message:', error);
      }
    }, 1000);

    setInputMessage('');
  };

  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
  };

  const getMoodIcon = () => {
    if (mood === 'happy') return FaSmile;
    if (mood === 'neutral') return FaMeh;
    return FaSadTear;
  };

  const MoodIcon = getMoodIcon();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
            Wealth Navigator
          </h1>
          <p className="text-xl text-darkwood">
            Your AI-powered financial companion
          </p>
        </motion.div>

        {/* Show login message if not authenticated */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 frosted-glass rounded-xl p-6 text-center"
          >
            <FaRobot className="text-6xl text-primary mx-auto mb-4" />
            <p className="text-darkwood mb-4">
              Please log in to chat with your Wealth Navigator and save your conversation history!
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
            <p className="mt-4 text-darkwood">Loading your conversation...</p>
          </div>
        )}

        {!loading && user && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="frosted-glass rounded-2xl p-6 shadow-xl text-center"
            >
              <div className="bg-gradient-to-br from-primary to-secondary w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MoodIcon className="text-5xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2 font-serif">
                Navigator
              </h3>
              <p className="text-sm text-darkwood">
                {mood === 'happy' && "I'm so proud of your progress!"}
                {mood === 'neutral' && "Let's keep moving forward!"}
                {mood === 'sad' && "Every journey has challenges. Keep going!"}
              </p>
            </motion.div>

            {/* Streak & Points */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="frosted-glass rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FaFire className="text-3xl text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-secondary">{streak}</div>
                    <div className="text-xs text-darkwood">Day Streak</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-3xl text-amber" />
                  <div>
                    <div className="text-2xl font-bold text-secondary">{points}</div>
                    <div className="text-xs text-darkwood">Points</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-amber h-2 rounded-full"
                  style={{ width: `${(points % 500) / 5}%` }}
                />
              </div>
              <p className="text-xs text-center text-darkwood mt-2">
                {500 - (points % 500)} points to next level
              </p>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="frosted-glass rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-secondary mb-4 font-serif">
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        achievement.unlocked ? 'bg-amber bg-opacity-20' : 'bg-gray-100'
                      }`}
                    >
                      <Icon className={`text-2xl ${achievement.color}`} />
                      <span className={`text-sm font-medium ${achievement.unlocked ? 'text-secondary' : 'text-gray-400'}`}>
                        {achievement.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-primary to-amber rounded-2xl p-6 shadow-xl text-white text-center"
            >
              <p className="text-sm italic">
                &quot;{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}&quot;
              </p>
            </motion.div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="frosted-glass rounded-2xl shadow-xl flex flex-col h-[700px]"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-secondary to-darkwood p-6 rounded-t-2xl flex items-center space-x-3">
                <FaRobot className="text-3xl text-accent" />
                <div>
                  <h3 className="text-xl font-bold text-white font-serif">Wealth Navigator</h3>
                  <p className="text-sm text-accent">Always here to help</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white text-secondary shadow-md'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-accent' : 'text-darkwood'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Responses */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {quickResponses.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickResponse(response)}
                      className="text-sm bg-white hover:bg-amber hover:text-white text-secondary p-3 rounded-lg transition-all border-2 border-amber"
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about finances..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-amber text-white p-3 rounded-full transition-all transform hover:scale-110"
                  >
                    <FaPaperPlane className="text-xl" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
