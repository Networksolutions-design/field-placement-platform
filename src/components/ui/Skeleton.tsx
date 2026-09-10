import { motion } from "motion/react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded-lg ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}