"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Store,
  BarChart3,
  Settings,
  LogOut,
  KanbanSquare,
} from "lucide-react";

const nav = [
  { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Brugere", icon: Users },
  { href: "/transactions", label: "Transaktioner", icon: ArrowLeftRight },
  { href: "/merchants", label: "Butikker", icon: Store },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/flow", label: "pwFLOW", icon: KanbanSquare },
  { href: "/fees", label: "Gebyrer", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a2f5b] text-white font-bold text-sm">
          PW
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Payway Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/overview" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          Log ud
        </button>
      </div>
    </aside>
  );
}
