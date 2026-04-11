"use client";

import { useState } from "react";
import { ArrowLeftRight, Search, Loader2, QrCode } from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useMerchant } from "@/lib/use-merchant";
import { formatDKK } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-[#2ec964]/10 text-[#1a8a45]",
  pending: "bg-amber-50 text-amber-600",
  failed: "bg-red-50 text-red-500",
  refunded: "bg-blue-50 text-blue-500",
};

export default function ShopTransactionsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.transactions;
  const { transactions, loading } = useMerchant();
  const [search, setSearch] = useState("");

  const filtered = (transactions || []).filter((tx) =>
    !search || tx.id.includes(search) || tx.type.includes(search.toLowerCase()) || tx.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2ec964]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
        <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/20" />
          <input
            type="text"
            placeholder="Søg..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#0a2f5b]/[0.08] py-2.5 pl-10 pr-4 text-[14px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/40"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-[#0a2f5b]/25">
            <ArrowLeftRight className="mb-3 h-8 w-8" />
            <p className="text-[14px] font-medium">Ingen transaktioner</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.05]">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">ID</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Type</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Dato</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Gebyr</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Beløb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.03]">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-[#0a2f5b]/[0.01]">
                    <td className="px-5 py-3.5 text-[13px] font-mono text-[#0a2f5b]/40">{tx.id.slice(0, 8)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2ec964]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#1a8a45]">
                        <QrCode className="h-3 w-3" />{tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[tx.status] || "bg-gray-50 text-gray-500"}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#0a2f5b]/40">
                      {new Date(tx.created_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#0a2f5b]/30">{formatDKK(tx.fee_amount)}</td>
                    <td className="px-5 py-3.5 text-right text-[14px] font-bold text-[#0a2f5b]">{formatDKK(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
