import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { slideUpVariants } from './variants';

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : slideUpVariants}>
      {children}
    </motion.div>
  );
}