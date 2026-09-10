import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { staggerContainerVariants } from './variants';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : 'hidden'}
      animate={reduce ? undefined : 'visible'}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}