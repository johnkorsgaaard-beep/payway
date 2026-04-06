"use client";

import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet,
  Users,
  QrCode,
  ArrowRight,
  Store,
} from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

const MOCK_TRANSACTIONS = [
  { id: "TXN-001", customer: "Anna Hansen", amount: 245.0, time: "14:32", method: "QR" },
  { id: "TXN-002", customer: "Jóhan Petersen", amount: 89.5, time: "13:47", method: "QR" },
  { id: "TXN-003", customer: "Súsanna Dam", amount: 156.0, time: "12:22", method: "QR" },
  { id: "TXN-004", customer: "Bárður Joensen", amount: 42.0, time: "11:58", method: "QR" },
  { id: "TXN-005", customer: "Elin Jacobsen", amount: 312.5, time: "10:15", method: "QR" },
];

const HOURLY_DATA = [12, 28, 45, 38, 62, 55, 78, 92, 85, 70, 48, 30];
const HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

export default function ShopDashboardPage() {
  const { locale: l } = useLocale();
  const maxBar = Math.max(...HOURLY_DATA);
  const s = t.shop.dashboard;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
          <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#2ec964]/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-[#2ec964] animate-pulse" />
          <span className="text-[13px] font-semibold text-[#1a8a45]">{s.storeOpen[l]}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: s.salesToday, value: "3.245,00 kr.", trend: "+18%", up: true, icon: ArrowLeftRight, color: "from-[#0a2f5b] to-[#1a6fb5]" },
          { label: s.txCount, value: "27", trend: "+5", up: true, icon: QrCode, color: "from-[#2ec964] to-[#1a8a45]" },
          { label: s.nextPayout, value: "12.840 kr.", trend: s.tomorrow, up: true, icon: Wallet, color: "from-[#f59e0b] to-[#d97706]" },
          { label: s.uniqueCustomers, value: "19", trend: "+3", up: true, icon: Users, color: "from-[#0a2f5b] to-[#1a6fb5]" },
        ].map((stat) => (
          <div key={stat.label[l]} className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-5 transition-all hover:shadow-md hover:shadow-[#0a2f5b]/[0.03]">
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${stat.up ? "text-[#2ec964]" : "text-red-400"}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {typeof stat.trend === "string" ? stat.trend : stat.trend[l]}
              </span>
            </div>
            <p className="mt-3 text-[22px] font-extrabold tracking-tight text-[#0a2f5b]">{stat.value}</p>
            <p className="mt-0.5 text-[12px] font-medium text-[#0a2f5b]/30">{stat.label[l]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0a2f5b]">{s.salesPerHour[l]}</h2>
              <p className="text-[12px] text-[#0a2f5b]/30">{s.todayDKK[l]}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#0a2f5b]" />
              <span className="text-[11px] text-[#0a2f5b]/35">{s.today[l]}</span>
            </div>
          </div>
          <div className="flex items-end gap-2" style={{ height: 180 }}>
            {HOURLY_DATA.map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-[#0a2f5b] to-[#1a6fb5] transition-all hover:opacity-80"
                  style={{ height: `${(val / maxBar) * 150}px`, opacity: 0.2 + (val / maxBar) * 0.8 }}
                />
                <span className="text-[9px] font-medium text-[#0a2f5b]/25">{HOURS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[#0a2f5b]">{s.quickActions[l]}</h2>
          <div className="space-y-3">
            {[
              { icon: QrCode, label: s.showQR, desc: s.qrDesc, color: "bg-[#2ec964]/10 text-[#1a8a45]" },
              { icon: Wallet, label: s.seePayout, desc: s.nextTomorrow, color: "bg-[#f59e0b]/10 text-[#d97706]" },
              { icon: Store, label: s.storeSettings, desc: s.storeSettingsDesc, color: "bg-[#0a2f5b]/[0.06] text-[#0a2f5b]" },
            ].map((a) => (
              <button
                key={a.label[l]}
                onClick={() => {}}
                className="flex w-full items-center gap-3 rounded-xl border border-[#0a2f5b]/[0.04] p-3.5 text-left transition-all hover:border-[#0a2f5b]/[0.1] hover:shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.color}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0a2f5b]">{a.label[l]}</p>
                  <p className="text-[11px] text-[#0a2f5b]/30">{a.desc[l]}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#0a2f5b]/20" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#0a2f5b]">{s.recentSales[l]}</h2>
          <a href="/shop/transactions" className="text-[13px] font-medium text-[#2ec964] hover:underline">{s.seeAll[l]}</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0a2f5b]/[0.05]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thId[l]}</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thCustomer[l]}</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thMethod[l]}</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thTime[l]}</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.thAmount[l]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a2f5b]/[0.03]">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-[#0a2f5b]/[0.01]">
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#0a2f5b]/50">{tx.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2f5b]/[0.05] text-[9px] font-bold text-[#0a2f5b]/50">
                        {tx.customer.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-[13px] font-semibold text-[#0a2f5b]">{tx.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2ec964]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1a8a45]">
                      <QrCode className="h-3 w-3" />{tx.method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#0a2f5b]/40">{tx.time}</td>
                  <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#0a2f5b]">
                    {tx.amount.toLocaleString("da-DK", { minimumFractionDigits: 2 })} kr.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
