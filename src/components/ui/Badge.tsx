import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "teal" | "gray" | "green" | "amber" | "red" | "blue";
  className?: string;
}

const variants = {
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  green: "bg-green-50 text-green-700 border-green-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
};

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
