'use client';

import { useDeviceTier } from '@shared/hooks';
import { cn } from '@shared/utils';
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';

export default function ParallaxText({
  children,
  className,
}: ParallaxTextProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();

  // Render the static (immediately visible) text on the server and during the
  // initial client render. The heavy parallax variant only mounts once the
  // device tier is resolved AND heavy motion is allowed. This keeps the large
  // hero headline (the LCP element) painted at first paint instead of leaving
  // it invisible behind a motion entrance until hydration completes.
  if (!isInitialized || !allowHeavyMotion) {
    return (
      <StaticParallaxText className={className}>{children}</StaticParallaxText>
    );
  }

  return (
    <HeavyParallaxText className={className}>{children}</HeavyParallaxText>
  );
}

interface ParallaxTextProps {
  children: string;
  className?: string;
}

function HeavyParallaxText({ children, className }: ParallaxTextProps) {
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
      <m.p
        className='text-6xl font-black tracking-tighter text-white uppercase md:text-8xl lg:text-9xl'
        style={{
          skewX: skew,
          y: y,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
        // initial={false}: this variant only mounts after hydration, by which
        // point the static text is already visible. Skip the opacity/scale
        // entrance so the swap is seamless (no flash) and never delays LCP.
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
      >
        {children}
      </m.p>
    </div>
  );
}

function StaticParallaxText({ children, className }: ParallaxTextProps) {
  return (
    <div className={cn('relative z-20 overflow-visible py-8', className)}>
      <p className='text-6xl font-black tracking-tighter text-white uppercase md:text-8xl lg:text-9xl'>
        {children}
      </p>
    </div>
  );
}
