'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaRocket, FaLeaf, FaChartLine, FaGraduationCap, FaUsers } from 'react-icons/fa';

export default function Home() {
  const features = [
    {
      icon: FaGraduationCap,
      title: 'Financial Education',
      description: 'Learn credit building and smart investing through interactive modules.',
    },
    {
      icon: FaChartLine,
      title: 'Investment Simulator',
      description: 'Practice investing with virtual currency in a risk-free environment.',
    },
    {
      icon: FaUsers,
      title: 'Expert Mentorship',
      description: 'Connect with financial mentors who understand your journey.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-sunset min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FaLeaf className="text-6xl md:text-8xl text-accent mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif">
              Welcome to WealthBridge
            </h1>
            <p className="text-xl md:text-2xl text-accent mb-8 max-w-3xl mx-auto">
              Your journey to financial freedom starts here. Build credit, learn investing, and grow with guidance.
            </p>
            <Link
              href="/navigator"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-amber text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform hover:scale-105 transition-all"
            >
              <FaRocket />
              <span>Start Your Wealth Journey</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-secondary mb-16 font-serif"
          >
            Empowering Your Financial Future
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="frosted-glass rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all"
                >
                  <Icon className="text-5xl text-primary mb-4" />
                  <h3 className="text-2xl font-bold text-secondary mb-4 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-darkwood">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
              Our Mission
            </h2>
            <p className="text-xl text-accent leading-relaxed">
              We believe everyone deserves access to quality financial education. WealthBridge is 
              designed to empower individuals in minority communities with the knowledge, tools, 
              and mentorship needed to build wealth and achieve financial independence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 font-serif">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-darkwood mb-8">
              Join thousands of learners on their path to financial freedom.
            </p>
            <Link
              href="/education"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-amber text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl transform hover:scale-105 transition-all"
            >
              <FaGraduationCap />
              <span>Start Learning Now</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
