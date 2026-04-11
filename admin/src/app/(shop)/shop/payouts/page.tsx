"use client";

import { Wallet, Loader2, ArrowDownRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useMerchant } from "@/lib/use-merchant";
import { formatDKK } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  in_transit: { icon: ArrowDownRight, color: "text-blue-600", bg: "bg-blue-50" },
  paid: { icon: CheckCircle2, color: "text-[#1a8a45]", bg: "bg-[#2ec964]/10" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

export default function ShopPayoutsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.payouts;
  const { payouts, loading } = useMerchant();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2ec964]" />
      </div>
    );
  }

  const pendingPayout = payouts?.find((p) => p.status === "pending" || p.status === "in_transit");
  const totalPaid = payouts?.filter((p) => p.status === "paid").reduce((s, p) => s + p.net_amount, 0) || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
        <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-5">
          <p className="text-[12px] font-medium text-[#0a2f5b]/30">Næste udbetaling</p>
          <p className="mt-1 text-[22px] font-extrabold text-[#0a2f5b]">{pendingPayout ? formatDKK(pendingPayout.net_amount) : "—"}</p>
          {pendingPayout && <p className="mt-0.5 text-[11px] text-[#0a2f5b]/25">{pendingPayout.status}</p>}
        </div>
        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-5">
          <p className="text-[12px] font-medium text-[#0a2f5b]/30">Totalt udbetalt</p>
          <p className="mt-1 text-[22px] font-extrabold text-[#2ec964]">{formatDKK(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-5">
          <p className="text-[12px] font-medium text-[#0a2f5b]/30">Antal udbetalinger</p>
          <p className="mt-1 text-[22px] font-extrabold text-[#0a2f5b]">{payouts?.length || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white">
        {!payouts || payouts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-[#0a2f5b]/25">
            <Wallet className="mb-3 h-8 w-8" />
            <p className="text-[14px] font-medium">Ingen udbetalinger endnu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.05]">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Periode</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Brutto</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Gebyr</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.03]">
                {payouts.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-[#0a2f5b]/[0.01]">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-3 w-3" />{p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#0a2f5b]/50">
                        {new Date(p.period_start).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                        {" – "}
                        {new Date(p.period_end).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#0a2f5b]/50">{formatDKK(p.amount)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-red-400">-{formatDKK(p.fee_deducted)}</td>
                      <td className="px-5 py-3.5 text-right text-[14px] font-bold text-[#0a2f5b]">{formatDKK(p.net_amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
