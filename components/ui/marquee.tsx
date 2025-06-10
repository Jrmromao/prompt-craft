'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  speed?: number;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  className,
  pauseOnHover = false,
  vertical = false,
  repeat = 1,
  speed = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    let animationFrame: number;
    let startTime: number | null = null;
    let position = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (!isPaused) {
        position = (elapsed * speed) / 1000;
        if (vertical) {
          content.style.transform = `translateY(-${position}px)`;
        } else {
          content.style.transform = `translateX(-${position}px)`;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPaused, speed, vertical]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={contentRef}
        className={cn(
          'flex',
          vertical ? 'flex-col' : 'flex-row',
          'whitespace-nowrap'
        )}
        style={{
          willChange: 'transform',
        }}
      >
        {Array.from({ length: repeat }).map((_, index) => (
          <div key={index} className={vertical ? 'mb-8' : 'mr-8'}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}; 