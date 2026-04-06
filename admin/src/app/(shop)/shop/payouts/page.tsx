"use client";

import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  Banknote,
} from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

const PAYOUTS = [
  { id: "PAY-012", amount: 12840.0, date: "7. apr 2026", statusKey: "scheduled" as const, account: "••• 4821" },
  { id: "PAY-011", amount: 9625.5, date: "4. apr 2026", statusKey: "paidOut" as const, account: "••• 4821" },
  { id: "PAY-010", amount: 11230.0, date: "3. apr 2026", statusKey: "paidOut" as const, account: "••• 4821" },
  { id: "PAY-009", amount: 8945.0, date: "2. apr 2026", statusKey: "paidOut" as const, account: "••• 4821" },
  { id: "PAY-008", amount: 14280.5, date: "1. apr 2026", statusKey: "paidOut" as const, account: "••• 4821" },
  { id: "PAY-007", amount: 7612.0, date: "31. mar 2026", statusKey: "paidOut" as const, account: "••• 4821" },
  { id: "PAY-006", amount: 10455.0, date: "28. mar 2026", statusKey: "paidOut" as const, account: "••• 4821" },
];

export default function ShopPayoutsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.payouts;
  const totalPaid = PAYOUTS.filter((p) => p.statusKey === "paidOut").reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
        <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-[#f59e0b]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#d97706]">{s.next[l]}</span>
          </div>
          <p className="mt-4 text-[26px] font-extrabold tracking-tight text-[#0a2f5b]">12.840,00 kr.</p>
          <p className="mt-1 text-[12px] text-[#0a2f5b]/30">{s.scheduledFor[l]} 7. apr 2026</p>
        </div>

        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2ec964] to-[#1a8a45] text-white shadow-sm">
              <Banknote className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#2ec964]">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
          </div>
          <p className="mt-4 text-[26px] font-extrabold tracking-tight text-[#0a2f5b]">
            {totalPaid.toLocaleString("da-DK", { minimumFractionDigits: 2 })} kr.
          </p>
          <p className="mt-1 text-[12px] text-[#0a2f5b]/30">{s.totalPaid[l]}</p>
        </div>

        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a2f5b] to-[#1a6fb5] text-white shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-[26px] font-extrabold tracking-tight text-[#0a2f5b]">••• 4821</p>
          <p className="mt-1 text-[12px] text-[#0a2f5b]/30">{s.bankAccount[l]}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.05] bg-white">
        <div className="border-b border-[#0a2f5b]/[0.05] bg-[#fafcfe] px-6 py-4">
          <h2 className="text-[14px] font-bold text-[#0a2f5b]">{s.history[l]}</h2>
        </div>
        <div className="divide-y divide-[#0a2f5b]/[0.03]">
          {PAYOUTS.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#0a2f5b]/[0.01]">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                p.statusKey === "scheduled" ? "bg-[#f59e0b]/10 text-[#d97706]" : "bg-[#2ec964]/10 text-[#1a8a45]"
              }`}>
                {p.statusKey === "scheduled" ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#0a2f5b]">
                    {p.amount.toLocaleString("da-DK", { minimumFractionDigits: 2 })} kr.
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.statusKey === "scheduled" ? "bg-[#f59e0b]/10 text-[#d97706]" : "bg-[#2ec964]/10 text-[#1a8a45]"
                  }`}>
                    {s[p.statusKey][l]}
                  </span>
                </div>
                <p className="text-[12px] text-[#0a2f5b]/30">{p.date} · {s.account[l]} {p.account}</p>
              </div>
              <span className="text-[12px] font-mono text-[#0a2f5b]/20">{p.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
