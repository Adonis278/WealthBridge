'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf } from 'react-icons/fa';

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const FallingLeaves = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const newLeaves: Leaf[] = [];
    for (let i = 0; i < 15; i++) {
      newLeaves.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        size: 20 + Math.random() * 15,
      });
    }
    setLeaves(newLeaves);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: [0, window.innerHeight + 50],
            x: [0, Math.sin(leaf.id) * 100, Math.sin(leaf.id + 1) * -50, 0],
            rotate: [0, 360, 720],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${leaf.left}%`,
            fontSize: `${leaf.size}px`,
          }}
        >
          <FaLeaf className="text-primary opacity-60" />
        </motion.div>
      ))}
    </div>
  );
};

export default FallingLeaves;
