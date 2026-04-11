"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import t, { type Locale, localeLabels, localeFlags } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useAuth } from "@/lib/auth-context";
import { useMerchant } from "@/lib/use-merchant";

const navKeys = [
  { href: "/shop", key: "overview" as const, icon: LayoutDashboard },
  { href: "/shop/transactions", key: "transactions" as const, icon: ArrowLeftRight },
  { href: "/shop/payouts", key: "payouts" as const, icon: Wallet },
  { href: "/shop/settings", key: "settings" as const, icon: Settings },
];

export function ShopSidebar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const { signOut } = useAuth();
  const { merchant } = useMerchant();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#0a2f5b]/[0.06] bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-[#0a2f5b]/[0.06] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2ec964] to-[#1a8a45] text-sm font-bold text-white shadow-sm shadow-[#2ec964]/20">
          <Store className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[15px] font-bold text-[#0a2f5b]">Shop Admin</span>
          <p className="text-[10px] font-medium text-[#0a2f5b]/30">{merchant?.name || "..."}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navKeys.map((item) => {
          const isActive = item.href === "/shop"
            ? pathname === "/shop"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-[#2ec964]/10 text-[#1a8a45] shadow-sm"
                  : "text-[#0a2f5b]/40 hover:bg-[#0a2f5b]/[0.03] hover:text-[#0a2f5b]/70"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {t.shop.sidebar[item.key][locale]}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#0a2f5b]/[0.06] p-4 space-y-2">
        {/* Language switcher */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#0a2f5b]/40 transition-colors hover:bg-[#0a2f5b]/[0.03] hover:text-[#0a2f5b]/70"
          >
            <span className="text-base">{localeFlags[locale]}</span>
            <span className="flex-1 text-left">{localeLabels[locale]}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-1 shadow-lg shadow-[#0a2f5b]/[0.08]">
              {(["fo", "da", "en"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setLangOpen(false); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors ${
                    locale === l
                      ? "bg-[#0a2f5b]/[0.04] font-semibold text-[#0a2f5b]"
                      : "text-[#0a2f5b]/60 hover:bg-[#0a2f5b]/[0.02] hover:text-[#0a2f5b]"
                  }`}
                >
                  <span className="text-sm">{localeFlags[l]}</span>
                  {localeLabels[l]}
                  {locale === l && <Check className="ml-auto h-3.5 w-3.5 text-[#2ec964]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => { signOut(); window.location.href = "/portal"; }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#0a2f5b]/40 transition-colors hover:bg-[#0a2f5b]/[0.03] hover:text-[#0a2f5b]/70"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {t.shop.sidebar.logout[locale]}
        </button>
      </div>
    </aside>
  );
}
