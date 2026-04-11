"use client";

import {
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  Users,
  QrCode,
  ArrowRight,
  Store,
  Loader2,
} from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useMerchant } from "@/lib/use-merchant";
import { formatDKK } from "@/lib/utils";
import Link from "next/link";

export default function ShopDashboardPage() {
  const { locale: l } = useLocale();
  const { merchant, transactions, payouts, loading } = useMerchant();
  const s = t.shop.dashboard;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2ec964]" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-[#0a2f5b]/30">
        <Store className="mb-3 h-12 w-12" />
        <p className="text-lg font-medium">Ingen butik fundet</p>
        <p className="text-[13px]">Din konto er ikke knyttet til en butik endnu</p>
      </div>
    );
  }

  const todayTransactions = transactions?.filter((tx) => {
    const d = new Date(tx.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString() && tx.status === "completed";
  }) || [];

  const todayRevenue = todayTransactions.reduce((s, tx) => s + tx.amount, 0);
  const uniqueCustomers = new Set(todayTransactions.map((tx) => tx.sender_id)).size;
  const nextPayout = payouts?.find((p) => p.status === "pending");
  const recentTx = transactions?.slice(0, 8) || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
          <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{merchant.name}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#2ec964]/10 px-4 py-2">
          <div className={`h-2 w-2 rounded-full ${merchant.is_open ? "bg-[#2ec964] animate-pulse" : "bg-[#0a2f5b]/20"}`} />
          <span className="text-[13px] font-semibold text-[#1a8a45]">
            {merchant.is_open ? s.storeOpen[l] : "Lukket"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: s.salesToday, value: formatDKK(todayRevenue), trend: `${todayTransactions.length} salg`, icon: ArrowLeftRight, color: "from-[#0a2f5b] to-[#1a6fb5]" },
          { label: s.txCount, value: String(transactions?.length || 0), trend: "total", icon: QrCode, color: "from-[#2ec964] to-[#1a8a45]" },
          { label: s.nextPayout, value: nextPayout ? formatDKK(nextPayout.net_amount) : "—", trend: nextPayout ? nextPayout.status : "ingen", icon: Wallet, color: "from-[#f59e0b] to-[#d97706]" },
          { label: s.uniqueCustomers, value: String(uniqueCustomers), trend: s.today, icon: Users, color: "from-[#0a2f5b] to-[#1a6fb5]" },
        ].map((stat) => (
          <div key={typeof stat.label === "string" ? stat.label : stat.label[l]} className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-5 transition-all hover:shadow-md hover:shadow-[#0a2f5b]/[0.03]">
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#2ec964]">
                <TrendingUp className="h-3 w-3" />
                {typeof stat.trend === "string" ? stat.trend : stat.trend[l]}
              </span>
            </div>
            <p className="mt-3 text-[22px] font-extrabold tracking-tight text-[#0a2f5b]">{stat.value}</p>
            <p className="mt-0.5 text-[12px] font-medium text-[#0a2f5b]/30">
              {typeof stat.label === "string" ? stat.label : stat.label[l]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#0a2f5b]">{s.recentSales[l]}</h2>
            <Link href="/shop/transactions" className="text-[13px] font-medium text-[#2ec964] hover:underline">{s.seeAll[l]}</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[13px] text-[#0a2f5b]/25">
              Ingen transaktioner endnu
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#0a2f5b]/[0.05]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">ID</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Dato</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Beløb</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a2f5b]/[0.03]">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-[#0a2f5b]/[0.01]">
                      <td className="px-4 py-3 text-[13px] font-mono text-[#0a2f5b]/40">{tx.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#2ec964]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1a8a45]">
                          <QrCode className="h-3 w-3" />{tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#0a2f5b]/40">{tx.status}</td>
                      <td className="px-4 py-3 text-[13px] text-[#0a2f5b]/40">
                        {new Date(tx.created_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-[#0a2f5b]">{formatDKK(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[#0a2f5b]">{s.quickActions[l]}</h2>
          <div className="space-y-3">
            {[
              { icon: QrCode, label: s.showQR, desc: s.qrDesc, color: "bg-[#2ec964]/10 text-[#1a8a45]", href: "/shop/settings" },
              { icon: Wallet, label: s.seePayout, desc: s.nextTomorrow, color: "bg-[#f59e0b]/10 text-[#d97706]", href: "/shop/payouts" },
              { icon: Store, label: s.storeSettings, desc: s.storeSettingsDesc, color: "bg-[#0a2f5b]/[0.06] text-[#0a2f5b]", href: "/shop/settings" },
            ].map((a) => (
              <Link
                key={typeof a.label === "string" ? a.label : a.label[l]}
                href={a.href}
                className="flex w-full items-center gap-3 rounded-xl border border-[#0a2f5b]/[0.04] p-3.5 text-left transition-all hover:border-[#0a2f5b]/[0.1] hover:shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.color}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0a2f5b]">{typeof a.label === "string" ? a.label : a.label[l]}</p>
                  <p className="text-[11px] text-[#0a2f5b]/30">{typeof a.desc === "string" ? a.desc : a.desc[l]}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#0a2f5b]/20" />
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#0a2f5b]/[0.04] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">Butik info</p>
            <div className="mt-2 space-y-1.5 text-[13px]">
              <p className="text-[#0a2f5b]/60"><span className="text-[#0a2f5b]/30">Plan:</span> {merchant.plan}</p>
              <p className="text-[#0a2f5b]/60"><span className="text-[#0a2f5b]/30">Gebyr:</span> {(merchant.fee_rate / 100).toFixed(1)}%</p>
              <p className="text-[#0a2f5b]/60"><span className="text-[#0a2f5b]/30">Status:</span> {merchant.onboarding_status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
