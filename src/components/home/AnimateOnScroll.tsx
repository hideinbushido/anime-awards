'use client';
import { useEffect, useRef, useState } from 'react';

export type ScrollAnimation = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'cosmic' | 'portal-in';

const HIDDEN: Record<ScrollAnimation, React.CSSProperties> = {
  'fade-up':    { opacity: 0, transform: 'translateY(55px)' },
  'fade-down':  { opacity: 0, transform: 'translateY(-40px)' },
  'fade-left':  { opacity: 0, transform: 'translateX(-75px)' },
  'fade-right': { opacity: 0, transform: 'translateX(75px)' },
  'scale-in':   { opacity: 0, transform: 'scale(0.72)' },
  'cosmic':     { opacity: 0, transform: 'scale(0.88)', filter: 'blur(10px)' },
  'portal-in':  { opacity: 0, transform: 'rotate(-12deg) scale(0.65)', filter: 'blur(6px)' },
};

type Props = {
  children: React.ReactNode;
  animation?: ScrollAnimation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 750,
  threshold = 0.12,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const hidden = HIDDEN[animation];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(!visible ? hidden : {}),
        // Transition seulement à l'entrée — reset instantané à la sortie
        transition: visible
          ? `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter ${duration}ms ease ${delay}ms`
          : 'none',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
