"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Users,
  Store,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ArrowLeftRight,
  Settings,
  DollarSign,
  Check,
  TrendingUp,
  Globe,
  QrCode,
  Wallet,
  LineChart,
  SmartphoneNfc,
  BadgePercent,
  Wrench,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import t, { type Locale, localeLabels, localeFlags } from "@/lib/i18n";

function useLocale() {
  const [locale, setLocale] = useState<Locale>("fo");
  useEffect(() => {
    const saved = localStorage.getItem("payway-lang") as Locale | null;
    if (saved && (saved === "fo" || saved === "da" || saved === "en")) setLocale(saved);
  }, []);
  const change = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("payway-lang", l);
  }, []);
  return [locale, change] as const;
}

function T({ k, locale }: { k: { fo: string; da: string; en: string }; locale: Locale }) {
  return <>{k[locale]}</>;
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-[#0a2f5b]/[0.08] bg-white px-3 py-1.5 text-[13px] font-medium text-[#0a2f5b]/70 transition-all hover:border-[#0a2f5b]/20 hover:text-[#0a2f5b]"
      >
        <span className="text-sm">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-1 shadow-lg shadow-[#0a2f5b]/[0.08]">
          {(["fo", "da", "en"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => { onChange(l); setOpen(false); }}
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
  );
}

const DASHBOARD_NAV_KEYS = [
  { icon: BarChart3, key: "title" as const, active: true },
  { icon: Users, key: "users" as const, active: false },
  { icon: ArrowLeftRight, key: "transactions" as const, active: false },
  { icon: Store, key: "stores" as const, active: false },
  { icon: DollarSign, key: "analytics" as const, active: false },
  { icon: Settings, key: "fees" as const, active: false },
];

export default function BusinessPage() {
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useLocale();
  const l = locale;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/payway-icon.png" alt="PayWay" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-bold tracking-tight text-[#0a2f5b]">
              PayWay <span className="font-normal text-[#0a2f5b]/40">Business</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-[#0a2f5b]/60 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.nav.app} locale={l} />
            </Link>
            <a href="#features" className="text-sm font-medium text-[#0a2f5b]/60 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.nav.features} locale={l} />
            </a>
            <a href="#dashboard" className="text-sm font-medium text-[#0a2f5b]/60 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.nav.dashboard} locale={l} />
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#0a2f5b]/60 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.nav.pricing} locale={l} />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={l} onChange={setLocale} />
            <Link
              href="/portal"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#0a2f5b]/10 px-4 py-2 text-sm font-medium text-[#0a2f5b]/70 transition-all hover:border-[#0a2f5b]/25 hover:text-[#0a2f5b]"
            >
              <T k={t.biz.nav.login} locale={l} />
            </Link>
            <Link
              href="/business/opret"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2ec964] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#2ec964]/20 transition-all hover:bg-[#25a854] hover:shadow-lg hover:shadow-[#2ec964]/30"
            >
              <T k={t.biz.nav.startFree} locale={l} />
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden pt-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/business-hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-white/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#0a2f5b]/[0.06] px-4 py-1.5 text-[13px] font-semibold text-[#0a2f5b]/70">
              <Globe className="h-3.5 w-3.5" />
              <T k={t.biz.hero.badge} locale={l} />
            </div>

            <h1 className="text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-[#0a2f5b] md:text-[4rem]">
              <T k={t.biz.hero.titleLine1} locale={l} />
              <br />
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-[#0a2f5b] to-[#2ec964] bg-clip-text text-transparent">
                  <T k={t.biz.hero.titleHighlight} locale={l} />
                </span>
              </span>
              <br />
              <T k={t.biz.hero.titleLine2} locale={l} />
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#0a2f5b]/45">
              <T k={t.biz.hero.subtitle} locale={l} />
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/business/opret"
                className="group inline-flex items-center gap-2 rounded-2xl bg-[#2ec964] px-8 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#2ec964]/25 transition-all hover:bg-[#25a854] hover:shadow-xl hover:shadow-[#2ec964]/30"
              >
                <T k={t.biz.hero.openDashboard} locale={l} />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#0a2f5b]/10 bg-white px-8 py-4 text-[15px] font-semibold text-[#0a2f5b] transition-all hover:border-[#0a2f5b]/20 hover:shadow-md"
              >
                <T k={t.biz.hero.seeFeatures} locale={l} />
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* USP Bubble */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#2ec964]/20 bg-[#2ec964]/[0.07] px-5 py-2.5 shadow-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2ec964]">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-[14px] font-semibold text-[#0a2f5b]">
                  <T k={t.biz.hero.uspBubble} locale={l} />
                </span>
              </div>
            </div>
          </div>

          {/* ─── Dashboard Preview ─── */}
          <div id="dashboard" className="relative mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.08] bg-white shadow-2xl shadow-[#0a2f5b]/[0.06]">
              <div className="flex items-center gap-2 border-b border-[#0a2f5b]/[0.05] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-[#ff6058]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 text-[11px] font-medium text-[#0a2f5b]/25">admin.payway.fo</span>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <div className="hidden w-52 shrink-0 border-r border-[#0a2f5b]/[0.05] bg-[#fafcff] p-4 md:block">
                  <div className="mb-5 flex items-center gap-2 px-2">
                    <img src="/payway-icon.png" alt="PayWay" className="h-7 w-7 rounded-md" />
                    <span className="text-[12px] font-bold text-[#0a2f5b]">PayWay Admin</span>
                  </div>
                  {DASHBOARD_NAV_KEYS.map((item) => (
                    <div
                      key={item.key}
                      className={`mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors ${
                        item.active
                          ? "bg-[#0a2f5b] text-white shadow-sm shadow-[#0a2f5b]/20"
                          : "text-[#0a2f5b]/40 hover:text-[#0a2f5b]/60"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {t.biz.dashboard[item.key][l]}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="mb-1 flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-[#0a2f5b]">
                        <T k={t.biz.dashboard.title} locale={l} />
                      </p>
                      <p className="text-[11px] text-[#0a2f5b]/30">
                        <T k={t.biz.dashboard.subtitle} locale={l} />
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {[
                      { value: "2.800+", label: t.biz.stats.transactions, icon: ArrowLeftRight, trend: "+12%" },
                      { value: "127", label: t.biz.stats.activeUsers, icon: Users, trend: "+8%" },
                      { value: "14", label: t.biz.stats.merchants, icon: Store, trend: "+3" },
                      { value: "99,9%", label: t.biz.stats.uptime, icon: Shield, trend: "" },
                    ].map((stat) => (
                      <div key={stat.label[l]} className="rounded-xl border border-[#0a2f5b]/[0.05] bg-[#fafcff] p-3">
                        <div className="flex items-center justify-between">
                          <stat.icon className="h-3.5 w-3.5 text-[#0a2f5b]/25" />
                          {stat.trend && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#2ec964]">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {stat.trend}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[18px] font-extrabold text-[#0a2f5b]">{stat.value}</p>
                        <p className="text-[9px] font-medium text-[#0a2f5b]/30">{stat.label[l]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#0a2f5b]/[0.05] bg-[#fafcff] p-4">
                      <p className="text-[11px] font-bold text-[#0a2f5b]/50">
                        <T k={t.biz.dashboard.volumeByType} locale={l} />
                      </p>
                      <div className="mt-4 flex items-end gap-3 px-2">
                        {[64, 48, 80, 32, 56, 72, 40].map((h, i) => (
                          <div key={i} className="flex-1">
                            <div
                              className={`rounded-md ${i % 2 === 0 ? "bg-[#0a2f5b]" : "bg-[#2ec964]"}`}
                              style={{ height: `${h}px`, opacity: 0.15 + (h / 100) * 0.85 }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#0a2f5b]/[0.05] bg-[#fafcff] p-4">
                      <p className="text-[11px] font-bold text-[#0a2f5b]/50">
                        <T k={t.biz.dashboard.txByType} locale={l} />
                      </p>
                      <div className="mt-2 flex items-center justify-center py-2">
                        <div className="relative h-[72px] w-[72px]">
                          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#0a2f5b" strokeOpacity="0.06" strokeWidth="4" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#0a2f5b" strokeWidth="4" strokeDasharray="38 88" strokeLinecap="round" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#2ec964" strokeWidth="4" strokeDasharray="28 88" strokeDashoffset="-38" strokeLinecap="round" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="18 88" strokeDashoffset="-66" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="ml-4 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[#0a2f5b]" />
                            <span className="text-[9px] text-[#0a2f5b]/40">P2P (43%)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[#2ec964]" />
                            <span className="text-[9px] text-[#0a2f5b]/40">Top-up (32%)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                            <span className="text-[9px] text-[#0a2f5b]/40">Store (25%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-b from-[#0a2f5b]/[0.03] to-transparent blur-2xl" />
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-[#0a2f5b]/[0.06] bg-gradient-to-r from-[#fafcff] to-[#f5faf7] p-8 md:grid-cols-4 md:gap-8 md:p-10">
            {[
              { value: "2.800+", label: t.biz.stats.transactions },
              { value: "127", label: t.biz.stats.activeUsers },
              { value: "14", label: t.biz.stats.merchants },
              { value: "99,9%", label: t.biz.stats.uptime },
            ].map((s) => (
              <div key={s.label[l]} className="text-center">
                <p className="text-2xl font-extrabold text-[#0a2f5b] md:text-3xl">{s.value}</p>
                <p className="mt-1 text-[13px] text-[#0a2f5b]/40">{s.label[l]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2ec964]">
              <T k={t.biz.features.label} locale={l} />
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0a2f5b] md:text-[2.5rem]">
              <T k={t.biz.features.title} locale={l} />
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#0a2f5b]/40">
              <T k={t.biz.features.subtitle} locale={l} />
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: QrCode, title: t.biz.features.qrTitle, desc: t.biz.features.qrDesc, accent: "from-[#0a2f5b] to-[#1a6fb5]" },
              { icon: Wallet, title: t.biz.features.payoutsTitle, desc: t.biz.features.payoutsDesc, accent: "from-[#2ec964] to-[#1a8a45]" },
              { icon: LineChart, title: t.biz.features.salesTitle, desc: t.biz.features.salesDesc, accent: "from-[#f59e0b] to-[#d97706]" },
              { icon: SmartphoneNfc, title: t.biz.features.noTerminalTitle, desc: t.biz.features.noTerminalDesc, accent: "from-[#0a2f5b] to-[#1a6fb5]" },
              { icon: BadgePercent, title: t.biz.features.lowFeesTitle, desc: t.biz.features.lowFeesDesc, accent: "from-[#2ec964] to-[#1a8a45]" },
              { icon: Wrench, title: t.biz.features.settingsTitle, desc: t.biz.features.settingsDesc, accent: "from-[#f59e0b] to-[#d97706]" },
            ].map((f) => (
              <div
                key={f.title[l]}
                className="group rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-7 transition-all duration-300 hover:border-[#0a2f5b]/[0.1] hover:shadow-xl hover:shadow-[#0a2f5b]/[0.04] hover:-translate-y-0.5"
              >
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} text-white shadow-md`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[16px] font-bold text-[#0a2f5b]">{f.title[l]}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#0a2f5b]/40">{f.desc[l]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f5faf7] via-[#fafcff] to-white" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2ec964]">
              <T k={t.biz.pricing.label} locale={l} />
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0a2f5b] md:text-[2.5rem]">
              <T k={t.biz.pricing.title} locale={l} />
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#0a2f5b]/40">
              <T k={t.biz.pricing.subtitle} locale={l} />
            </p>
          </div>

          <div className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-0 md:flex-row md:items-stretch">
            {/* Store plan */}
            <div className="w-full rounded-2xl border border-[#0a2f5b]/[0.06] bg-white p-8 transition-all hover:shadow-lg hover:shadow-[#0a2f5b]/[0.04] md:rounded-r-none md:border-r-0">
              <p className="text-[40px] font-extrabold tracking-tight text-[#0a2f5b]">1–2%</p>
              <p className="text-[14px] text-[#0a2f5b]/35">
                <T k={t.biz.pricing.perTx} locale={l} />
              </p>
              <div className="my-6 h-px bg-[#0a2f5b]/[0.05]" />
              <ul className="space-y-3">
                {[t.biz.pricing.storeCheck1, t.biz.pricing.storeCheck2, t.biz.pricing.storeCheck3, t.biz.pricing.storeCheck4].map((item) => (
                  <li key={item[l]} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#2ec964]/15">
                      <Check className="h-3 w-3 text-[#2ec964]" strokeWidth={3} />
                    </div>
                    <span className="text-[14px] text-[#0a2f5b]/55">{item[l]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plus connector */}
            <div className="z-10 -my-4 flex items-center justify-center md:-mx-5 md:my-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a2f5b]/10 bg-white text-[20px] font-bold text-[#0a2f5b] shadow-lg">
                +
              </div>
            </div>

            {/* Platform plan */}
            <div className="relative w-full rounded-2xl border-2 border-[#0a2f5b] bg-white p-8 shadow-xl shadow-[#0a2f5b]/[0.06] md:rounded-l-none">
              <h3 className="text-[22px] font-extrabold tracking-tight text-[#0a2f5b]">
                <T k={t.biz.pricing.platformTitle} locale={l} />
              </h3>
              <div className="mt-6 h-px bg-[#0a2f5b]/10" />
              <ul className="space-y-3">
                {[
                  t.biz.pricing.platCheck1, t.biz.pricing.platCheck2,
                  t.biz.pricing.platCheck3, t.biz.pricing.platCheck4,
                  t.biz.pricing.platCheck5, t.biz.pricing.platCheck6,
                  t.biz.pricing.platCheck7,
                ].map((item) => (
                  <li key={item[l]} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#0a2f5b]/10">
                      <Check className="h-3 w-3 text-[#0a2f5b]" strokeWidth={3} />
                    </div>
                    <span className="text-[14px] text-[#0a2f5b]/55">{item[l]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a2f5b] via-[#0d3d73] to-[#0a2f5b] px-8 py-20 md:px-16">
            <div className="absolute inset-0">
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#2ec964]/15 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#2ec964]/10 blur-[60px]" />
              <div className="absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-white/5 blur-[40px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-white md:text-5xl">
                <T k={t.biz.cta.title} locale={l} />
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-white/50">
                <T k={t.biz.cta.subtitle} locale={l} />
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/business/opret"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2ec964] px-8 py-4 text-[15px] font-bold text-white shadow-xl shadow-[#2ec964]/25 transition-all hover:bg-[#25a854] hover:shadow-2xl hover:shadow-[#2ec964]/30"
                >
                  <T k={t.biz.cta.loginDashboard} locale={l} />
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:business@payway.fo"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-[15px] font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
                >
                  <T k={t.biz.cta.contactSales} locale={l} />
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#0a2f5b]/[0.05]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/payway-icon.png" alt="PayWay" className="h-7 w-7 rounded-lg" />
            <span className="text-[14px] font-bold text-[#0a2f5b]">
              PayWay <span className="font-normal text-[#0a2f5b]/40">Business</span>
            </span>
          </div>
          <p className="text-[13px] text-[#0a2f5b]/30">
            &copy; {new Date().getFullYear()} PayWay ApS. <T k={t.biz.footer.copyright} locale={l} />
          </p>
          <div className="flex gap-6">
            <Link href="/" className="text-[13px] text-[#0a2f5b]/40 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.footer.app} locale={l} />
            </Link>
            <a href="#" className="text-[13px] text-[#0a2f5b]/40 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.footer.terms} locale={l} />
            </a>
            <a href="mailto:business@payway.fo" className="text-[13px] text-[#0a2f5b]/40 transition-colors hover:text-[#0a2f5b]">
              <T k={t.biz.footer.contact} locale={l} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
