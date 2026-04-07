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
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a2f5b]">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.08] px-6">
        <img src="/payway-icon.png" alt="PayWay" className="h-8 w-8 rounded-lg" />
        <span className="text-[15px] font-bold text-white">
          PayWay Admin
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-[#2ec964] text-white shadow-lg shadow-[#2ec964]/20"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log ud
        </button>
      </div>
    </aside>
  );
}
