import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { slideUpVariants } from './variants';

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : 'hidden'}
      animate={reduce ? undefined : 'visible'}
      variants={slideUpVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}