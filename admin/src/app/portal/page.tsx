"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Store,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Users,
  Settings,
  QrCode,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0faf4] via-white to-[#eef4fb] px-6">
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#2ec964]/[0.05] blur-[120px]" />
      <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0a2f5b]/[0.03] blur-[80px]" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-xl border border-[#0a2f5b]/[0.08] bg-white/80 px-4 py-2.5 text-[14px] font-medium text-[#0a2f5b]/60 backdrop-blur-sm transition-all hover:border-[#0a2f5b]/20 hover:bg-white hover:text-[#0a2f5b] hover:shadow-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        Til forsiden
      </Link>

      <div className="relative w-full max-w-3xl">
        <div className="mb-10 text-center">
          <img src="/payway-icon.png" alt="PayWay" className="mx-auto mb-5 h-14 w-14 rounded-2xl shadow-lg shadow-[#0a2f5b]/20" />
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2f5b]">
            Velkommen til PayWay
          </h1>
          <p className="mt-2 text-[16px] text-[#0a2f5b]/40">
            Vælg hvilken platform du vil tilgå
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <button
            onClick={() => router.push("/overview")}
            className="group relative overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-8 text-left transition-all duration-300 hover:border-[#0a2f5b]/20 hover:shadow-2xl hover:shadow-[#0a2f5b]/[0.06] hover:-translate-y-1"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0a2f5b]/[0.03] transition-all group-hover:scale-150" />

            <div className="relative">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a2f5b] to-[#1a6fb5] text-white shadow-lg shadow-[#0a2f5b]/20">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-[#0a2f5b]">PayWay Admin</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#0a2f5b]/40">
                Fuld platform-administration. Brugere, transaktioner, butikker, analytics og gebyrer.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { icon: Users, label: "Brugere" },
                  { icon: ArrowLeftRight, label: "Transaktioner" },
                  { icon: BarChart3, label: "Analytics" },
                  { icon: Settings, label: "Gebyrer" },
                ].map((tag) => (
                  <span key={tag.label} className="inline-flex items-center gap-1 rounded-full bg-[#0a2f5b]/[0.04] px-2.5 py-1 text-[11px] font-medium text-[#0a2f5b]/50">
                    <tag.icon className="h-3 w-3" />
                    {tag.label}
                  </span>
                ))}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0a2f5b] transition-colors group-hover:text-[#2ec964]">
                Åbn Admin Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/shop")}
            className="group relative overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-8 text-left transition-all duration-300 hover:border-[#2ec964]/30 hover:shadow-2xl hover:shadow-[#2ec964]/[0.06] hover:-translate-y-1"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2ec964]/[0.05] transition-all group-hover:scale-150" />

            <div className="relative">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2ec964] to-[#1a8a45] text-white shadow-lg shadow-[#2ec964]/20">
                <Store className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-[#0a2f5b]">Shop Admin</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#0a2f5b]/40">
                Butiks-dashboard. Se salg, transaktioner, QR-koder og udbetalinger for din butik.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { icon: QrCode, label: "QR-koder" },
                  { icon: Wallet, label: "Udbetalinger" },
                  { icon: ArrowLeftRight, label: "Salg" },
                  { icon: BarChart3, label: "Overblik" },
                ].map((tag) => (
                  <span key={tag.label} className="inline-flex items-center gap-1 rounded-full bg-[#2ec964]/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#1a8a45]/60">
                    <tag.icon className="h-3 w-3" />
                    {tag.label}
                  </span>
                ))}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0a2f5b] transition-colors group-hover:text-[#2ec964]">
                Åbn Shop Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-[13px] text-[#0a2f5b]/25">
          &copy; {new Date().getFullYear()} PayWay ApS
        </p>
      </div>
    </div>
  );
}
