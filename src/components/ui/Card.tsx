import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
        hover
          ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}