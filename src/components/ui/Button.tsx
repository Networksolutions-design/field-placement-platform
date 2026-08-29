import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "brand"
  | "gray"
  | "success"
  | "danger"
  | "warning";

type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "border border-teal-600 text-teal-700 bg-white hover:bg-teal-600 hover:text-white active:bg-teal-700 focus:ring-teal-100",
  secondary:
    "border border-teal-600 text-teal-700 bg-white hover:bg-teal-600 hover:text-white active:bg-teal-700 focus:ring-teal-100",
  outline:
    "border border-teal-600 text-teal-700 bg-white hover:bg-teal-600 hover:text-white active:bg-teal-700 focus:ring-teal-100",
  ghost:
    "border border-teal-600 text-teal-700 bg-white hover:bg-teal-600 hover:text-white active:bg-teal-700 focus:ring-teal-100",

  brand:
    "border border-teal-600 text-teal-700 bg-white hover:bg-teal-600 hover:text-white active:bg-teal-700 focus:ring-teal-100",
  gray:
    "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-200",
  success:
    "border border-green-600 text-green-700 bg-white hover:bg-green-600 hover:text-white focus:ring-green-100",
  danger:
    "border border-red-600 text-red-700 bg-white hover:bg-red-600 hover:text-white focus:ring-red-100",
  warning:
    "border border-amber-600 text-amber-700 bg-white hover:bg-amber-600 hover:text-white focus:ring-amber-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}