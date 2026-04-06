"use client";

import { useState } from "react";
import { QrCode, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

const ALL_TRANSACTIONS = [
  { id: "TXN-027", customer: "Anna Hansen", amount: 245.0, date: "6. apr 2026", time: "14:32", statusKey: "completed" as const },
  { id: "TXN-026", customer: "Jóhan Petersen", amount: 89.5, date: "6. apr 2026", time: "13:47", statusKey: "completed" as const },
  { id: "TXN-025", customer: "Súsanna Dam", amount: 156.0, date: "6. apr 2026", time: "12:22", statusKey: "completed" as const },
  { id: "TXN-024", customer: "Bárður Joensen", amount: 42.0, date: "6. apr 2026", time: "11:58", statusKey: "completed" as const },
  { id: "TXN-023", customer: "Elin Jacobsen", amount: 312.5, date: "6. apr 2026", time: "10:15", statusKey: "completed" as const },
  { id: "TXN-022", customer: "Hanus Djurhuus", amount: 175.0, date: "5. apr 2026", time: "18:42", statusKey: "completed" as const },
  { id: "TXN-021", customer: "Maria Olsen", amount: 68.0, date: "5. apr 2026", time: "16:30", statusKey: "completed" as const },
  { id: "TXN-020", customer: "Poul Thomsen", amount: 425.0, date: "5. apr 2026", time: "14:15", statusKey: "completed" as const },
  { id: "TXN-019", customer: "Katrin Winther", amount: 92.5, date: "5. apr 2026", time: "12:08", statusKey: "completed" as const },
  { id: "TXN-018", customer: "Rói á Torkilsheyggi", amount: 134.0, date: "5. apr 2026", time: "11:22", statusKey: "refunded" as const },
  { id: "TXN-017", customer: "Guðrið Patursson", amount: 285.0, date: "4. apr 2026", time: "17:55", statusKey: "completed" as const },
  { id: "TXN-016", customer: "Símun Joensen", amount: 56.5, date: "4. apr 2026", time: "15:10", statusKey: "completed" as const },
];

const STATUS_STYLES = {
  completed: "bg-[#2ec964]/10 text-[#1a8a45]",
  refunded: "bg-[#f59e0b]/10 text-[#d97706]",
};

export default function ShopTransactionsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.transactions;
  const d = t.shop.dashboard;
  const [search, setSearch] = useState("");

  const filtered = ALL_TRANSACTIONS.filter(
    (tx) =>
      tx.customer.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
          <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0a2f5b]/60 transition-all hover:border-[#0a2f5b]/20 hover:text-[#0a2f5b]">
          <Download className="h-4 w-4" />
          {s.exportCSV[l]}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/25" />
        <input
          type="text"
          placeholder={s.searchPlaceholder[l]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-3 pl-11 pr-4 text-[14px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.05] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0a2f5b]/[0.05] bg-[#fafcfe]">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{d.thId[l]}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{d.thCustomer[l]}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thDate[l]}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{d.thMethod[l]}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thStatus[l]}</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{d.thAmount[l]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a2f5b]/[0.03]">
              {filtered.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-[#0a2f5b]/[0.01]">
                  <td className="px-5 py-4 text-[13px] font-mono text-[#0a2f5b]/40">{tx.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2f5b]/[0.05] text-[9px] font-bold text-[#0a2f5b]/50">
                        {tx.customer.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-[13px] font-semibold text-[#0a2f5b]">{tx.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#0a2f5b]/40">{tx.date}, {tx.time}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2ec964]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1a8a45]">
                      <QrCode className="h-3 w-3" />QR
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[tx.statusKey]}`}>
                      {s[tx.statusKey][l]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-[13px] font-bold text-[#0a2f5b]">
                    {tx.amount.toLocaleString("da-DK", { minimumFractionDigits: 2 })} kr.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#0a2f5b]/[0.05] px-5 py-3">
          <p className="text-[12px] text-[#0a2f5b]/30">{s.showing[l]} {filtered.length} {s.of[l]} {ALL_TRANSACTIONS.length}</p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-[#0a2f5b]/[0.08] p-1.5 text-[#0a2f5b]/30 transition-colors hover:text-[#0a2f5b]"><ChevronLeft className="h-4 w-4" /></button>
            <span className="rounded-lg bg-[#0a2f5b] px-3 py-1.5 text-[12px] font-bold text-white">1</span>
            <button className="rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-1.5 text-[12px] font-medium text-[#0a2f5b]/40 transition-colors hover:text-[#0a2f5b]">2</button>
            <button className="rounded-lg border border-[#0a2f5b]/[0.08] p-1.5 text-[#0a2f5b]/30 transition-colors hover:text-[#0a2f5b]"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
