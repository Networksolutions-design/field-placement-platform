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
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${hover ? "transition-all duration-200 hover:shadow-md hover:border-gray-200 cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
