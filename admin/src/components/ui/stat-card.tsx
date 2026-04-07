"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#0a2f5b]/40">
            {title}
          </p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-[#0a2f5b]">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[13px] text-[#0a2f5b]/35">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                trend.value >= 0
                  ? "text-[#2ec964]"
                  : "text-red-500"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-[#0a2f5b]/[0.04] p-3">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
