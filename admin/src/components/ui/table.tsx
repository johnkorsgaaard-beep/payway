"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm text-left", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={cn(
        "border-b border-[#0a2f5b]/[0.06] text-xs uppercase text-[#0a2f5b]/35",
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={cn("divide-y divide-[#0a2f5b]/[0.04]", className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "hover:bg-[#0a2f5b]/[0.02] transition-colors",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-[#0a2f5b]/60",
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>
  );
}
