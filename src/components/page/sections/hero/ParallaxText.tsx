'use client';

import { cn } from '@/lib/utils';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';

interface ParallaxTextProps {
  children: string;
  className?: string;
}

export default function ParallaxText({ children, className }: ParallaxTextProps) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  // Skew based on velocity
  // Velocity is pixels per second.
  // We want skew to be subtle, max ~15 degrees.
  const skew = useTransform(smoothVelocity, [-3000, 3000], [-15, 15], {
    clamp: false,
  });

  // Parallax Y offset - moves slower than scroll to create depth
  const y = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <div className={cn('relative z-20 overflow-visible py-8', className)}>
      <motion.p
        className="text-6xl font-black uppercase tracking-tighter text-white md:text-8xl lg:text-9xl"
        style={{
          skewX: skew,
          y: y,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          willChange: 'transform',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.p>
    </div>
  );
}
