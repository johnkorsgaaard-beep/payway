"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants: Record<string, string> = {
  primary:
    "bg-[#2ec964] text-white hover:bg-[#25a854] shadow-sm shadow-[#2ec964]/20 focus:ring-[#2ec964]",
  secondary:
    "bg-[#0a2f5b]/[0.05] text-[#0a2f5b]/70 hover:bg-[#0a2f5b]/[0.08] hover:text-[#0a2f5b]",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  ghost:
    "text-[#0a2f5b]/50 hover:bg-[#0a2f5b]/[0.04] hover:text-[#0a2f5b]",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
