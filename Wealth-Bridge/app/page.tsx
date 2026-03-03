'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight, FaChartLine, FaCheckCircle, FaCloudUploadAlt, FaShieldAlt, FaSnowflake } from 'react-icons/fa';

export default function Home() {
  const highlights = [
    {
      title: 'Credit Builder Core',
      description: 'Track your score, utilization, and payment health in one clean dashboard.',
      icon: FaChartLine,
    },
    {
      title: 'Report Analysis',
      description: 'Upload your report and get clear, actionable guidance in minutes.',
      icon: FaCloudUploadAlt,
    },
    {
      title: 'Trust-First Design',
      description: 'Your report stays in your browser until you choose to generate advice.',
      icon: FaShieldAlt,
    },
  ];

  const steps = [
    'Upload a report (PDF or TXT).',
    'We surface the key credit signals.',
    'Get AI-backed next steps that fit your score.',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/70 border border-amber text-sm text-secondary">
                <FaSnowflake className="text-primary" />
                <span>Winter release focused on Credit Builder</span>
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-semibold text-secondary leading-tight font-serif">
                Credit clarity, without the heavy lift.
              </h1>
              <p className="mt-5 text-lg md:text-xl text-darkwood max-w-2xl">
                WealthBridge puts credit building front and center. Upload your report, see what matters,
                and get a personalized action plan that keeps momentum moving.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/credit-builder"
                  className="inline-flex items-center space-x-2 bg-primary hover:bg-amber text-white font-semibold px-6 py-3 rounded-full transition-all"
                >
                  <span>Open Credit Builder</span>
                  <FaArrowRight />
                </Link>
                <Link
                  href="/credit-builder"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border border-primary text-secondary hover:bg-white/70 transition-all"
                >
                  <span>Upload a report</span>
                </Link>
              </div>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-darkwood">
                <div className="bg-white/70 rounded-2xl p-4 border border-amber">
                  <div className="text-2xl font-semibold text-secondary">300-850</div>
                  <div>Score range focus</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-4 border border-amber">
                  <div className="text-2xl font-semibold text-secondary">5 areas</div>
                  <div>Key credit factors</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-4 border border-amber">
                  <div className="text-2xl font-semibold text-secondary">Local-first</div>
                  <div>Report stays private</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mb-8 lg:mb-0"
            >
              <div className="rounded-3xl border border-amber bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-darkwood">Credit Builder</p>
                    <h2 className="text-2xl font-semibold text-secondary mt-2">Score Momentum</h2>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/70 border border-amber flex items-center justify-center">
                    <FaChartLine className="text-primary" />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-darkwood">Utilization</span>
                    <span className="text-secondary font-semibold">28%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/70">
                    <div className="h-2 rounded-full bg-primary" style={{ width: '72%' }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-darkwood">Payment history</span>
                    <span className="text-secondary font-semibold">Excellent</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/70">
                    <div className="h-2 rounded-full bg-primary" style={{ width: '90%' }} />
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-primary text-white">
                  <div className="text-sm uppercase tracking-widest">Next best action</div>
                  <div className="mt-2 text-lg font-semibold">Lower utilization under 25%</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/80 border border-amber rounded-2xl p-4 shadow-lg hidden sm:flex">
                <div className="items-center space-x-2 text-sm text-secondary">
                  <FaCheckCircle className="text-primary" />
                  <span>Report analyzed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-amber bg-white/70 p-6 shadow-lg"
                >
                  <Icon className="text-3xl text-primary" />
                  <h3 className="mt-4 text-xl font-semibold text-secondary">{item.title}</h3>
                  <p className="mt-2 text-darkwood">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-semibold text-secondary font-serif">
                Built for fast, clear credit wins.
              </h2>
              <p className="mt-4 text-lg text-darkwood">
                We cut the noise and surface the signals that matter. The credit builder view is the
                center of the experience right now, so every insight and task points back to your score.
              </p>
              <Link
                href="/credit-builder"
                className="mt-8 inline-flex items-center space-x-2 text-primary font-semibold"
              >
                <span>See the Credit Builder</span>
                <FaArrowRight />
              </Link>
            </motion.div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl bg-white/80 border border-amber p-5 flex items-start space-x-4"
                >
                  <div className="h-10 w-10 rounded-full bg-white/70 border border-amber flex items-center justify-center text-primary font-semibold">
                    0{index + 1}
                  </div>
                  <p className="text-darkwood text-base">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-primary text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold font-serif">
                Put credit building in motion today.
              </h2>
              <p className="mt-3 text-white/80 max-w-2xl">
                Upload a report, see the signals, and get a focused action plan to keep your score moving up.
              </p>
            </div>
            <Link
              href="/credit-builder"
              className="inline-flex items-center space-x-2 bg-white text-secondary font-semibold px-6 py-3 rounded-full"
            >
              <span>Start Credit Builder</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
