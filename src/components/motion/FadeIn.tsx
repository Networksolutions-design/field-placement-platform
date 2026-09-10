import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { fadeInVariants } from './variants';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : 'hidden'}
      animate={reduce ? undefined : 'visible'}
      variants={fadeInVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}