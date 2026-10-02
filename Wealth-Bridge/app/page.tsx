'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight, FaChartLine, FaCloudUploadAlt, FaShieldAlt } from 'react-icons/fa';
import { useSeasonalArt } from '@/components/SeasonalArt';

export default function Home() {
  const art = useSeasonalArt();

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
      description: 'Your report is encrypted, stored privately to your account, and never shared.',
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
      <section className="relative overflow-hidden -mt-[88px] pt-[88px] min-h-[620px] lg:min-h-[760px] flex items-center">
        {/* Seasonal artwork, dissolving into the page background toward the copy */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-y-0 right-0 w-full lg:w-[62%]"
        >
          <div className="hero-art relative h-full w-full">
            <Image
              key={art.src}
              src={art.src}
              alt=""
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 62vw"
              className="object-cover object-center"
            />
          </div>
          {/* Soften the bottom edge into the next section */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-secondary leading-tight font-serif">
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
                  <div className="text-2xl font-semibold text-secondary">Private</div>
                  <div>Visible only to you</div>
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
