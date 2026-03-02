'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaSnowflake } from 'react-icons/fa';
import { useSeasonalTheme } from '@/components/SeasonalThemeProvider';

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

const PARTICLE_COUNT = 10;
const ORB_COUNT = 3;

export default function SeasonalBackdrop() {
  const { theme } = useSeasonalTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [orbs, setOrbs] = useState<Particle[]>([]);

  useEffect(() => {
    const nextParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      nextParticles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: theme === 'winter' ? 10 + Math.random() * 6 : 8 + Math.random() * 4,
        size: theme === 'winter' ? 14 + Math.random() * 18 : 20 + Math.random() * 15,
      });
    }
    setParticles(nextParticles);
  }, [theme]);

  useEffect(() => {
    const nextOrbs: Particle[] = [];
    for (let i = 0; i < ORB_COUNT; i += 1) {
      nextOrbs.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 18 + Math.random() * 10,
        size: 160 + Math.random() * 180,
      });
    }
    setOrbs(nextOrbs);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateHeight = () => setViewportHeight(window.innerHeight || 800);
    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const Icon = useMemo(() => (theme === 'winter' ? FaSnowflake : FaLeaf), [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {theme === 'winter' && (
        <div className="absolute inset-0">
          {orbs.map((orb) => (
            <motion.div
              key={`orb-${orb.id}`}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 0.35, 0.2, 0],
                x: [0, 40, -30, 0],
                y: [0, -20, 30, 0],
              }}
              transition={{
                duration: orb.duration,
                delay: orb.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                left: `${orb.left}%`,
                top: `${10 + orb.id * 12}%`,
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                borderRadius: '999px',
                background: 'radial-gradient(circle, rgba(205, 235, 255, 0.6) 0%, rgba(205, 235, 255, 0) 70%)',
                filter: 'blur(6px)',
              }}
            />
          ))}
        </div>
      )}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -60, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: [0, viewportHeight + 80],
            x:
              theme === 'winter'
                ? [0, Math.sin(particle.id) * 40, Math.sin(particle.id + 1) * -30, 0]
                : [0, Math.sin(particle.id) * 100, Math.sin(particle.id + 1) * -50, 0],
            rotate: theme === 'winter' ? [0, 180, 360] : [0, 360, 720],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            fontSize: `${particle.size}px`,
          }}
        >
          <Icon
            className={
              theme === 'winter'
                ? 'text-accent opacity-70'
                : 'text-primary opacity-60'
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
