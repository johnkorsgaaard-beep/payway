"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const variants: Record<string, string> = {
  default: "bg-[#0a2f5b]/[0.06] text-[#0a2f5b]/70",
  success: "bg-[#2ec964]/10 text-[#1a8a45]",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  info: "bg-[#0a2f5b]/[0.06] text-[#0a2f5b]",
  secondary: "bg-[#0a2f5b]/[0.04] text-[#0a2f5b]/50",
};

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
