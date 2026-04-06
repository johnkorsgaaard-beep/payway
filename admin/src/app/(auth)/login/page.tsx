"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  QrCode,
  Smartphone,
  ChevronRight,
  Send,
  PiggyBank,
  Check,
  Star,
  ArrowUpRight,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import t, { type Locale, localeLabels, localeFlags } from "@/lib/i18n";
import { PhoneSimulator } from "@/components/phone-simulator";

function useLocale() {
  const [locale, setLocale] = useState<Locale>("fo");

  useEffect(() => {
    const saved = localStorage.getItem("payway-lang") as Locale | null;
    if (saved && (saved === "fo" || saved === "da" || saved === "en")) {
      setLocale(saved);
    }
  }, []);

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("payway-lang", l);
  }, []);

  return [locale, changeLocale] as const;
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

function PhoneMockup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[272px] rounded-[3rem] border-[6px] border-[#1a1a2e] bg-[#1a1a2e] p-1 shadow-[0_25px_60px_-12px_rgba(10,47,91,0.25)]">
        <div className="absolute left-1/2 top-1.5 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1a1a2e]" />
        <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[2.3rem] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useLocale();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const l = locale;

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
            <span className="text-lg font-bold tracking-tight text-[#0a2f5b]">PayWay</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={l} onChange={setLocale} />
            <Link
              href="/login/business"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#0a2f5b]/10 px-4 py-2 text-sm font-medium text-[#0a2f5b]/70 transition-all hover:border-[#0a2f5b]/25 hover:text-[#0a2f5b]"
            >
              <T k={t.nav.business} locale={l} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0a2f5b] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#0a2f5b]/15 transition-all hover:shadow-lg hover:shadow-[#0a2f5b]/25"
            >
              <T k={t.nav.login} locale={l} />
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden pt-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-white/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#2ec964]/10 px-4 py-1.5 text-[13px] font-semibold text-[#1a8a45]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2ec964] animate-pulse" />
                <T k={t.hero.badge} locale={l} />
              </div>

              <h1 className="text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-[#0a2f5b] md:text-[3.75rem]">
                <T k={t.hero.titleLine1} locale={l} />
                <br />
                <T k={t.hero.titleLine2} locale={l} />{" "}
                <span className="relative">
                  <span className="relative z-10"><T k={t.hero.titleHighlight} locale={l} /></span>
                  <svg className="absolute -bottom-2 left-0 right-0 z-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M2 8.5C20 3 45 2 65 4.5C85 7 105 9.5 130 6C155 2.5 175 5 198 7" stroke="#2ec964" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.55" />
                  </svg>
                </span>{" "}
                <T k={t.hero.titleEnd} locale={l} />
              </h1>

              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#0a2f5b]/50">
                <T k={t.hero.subtitle} locale={l} />
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#0a2f5b] px-7 py-4 text-white shadow-lg shadow-[#0a2f5b]/20 transition-all hover:shadow-xl hover:shadow-[#0a2f5b]/30"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-60"><T k={t.hero.downloadOn} locale={l} /></div>
                    <div className="text-[15px] font-semibold leading-tight">App Store</div>
                  </div>
                  <ArrowUpRight className="ml-1 h-4 w-4 opacity-0 transition-all group-hover:opacity-60" />
                </a>

                <a
                  href="#"
                  className="group inline-flex items-center gap-3 rounded-2xl border-2 border-[#0a2f5b]/10 bg-white px-7 py-4 text-[#0a2f5b] transition-all hover:border-[#0a2f5b]/20 hover:shadow-md"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.627L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.991l-2.302 2.302-8.634-8.635z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-50"><T k={t.hero.getItOn} locale={l} /></div>
                    <div className="text-[15px] font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {["bg-[#0a2f5b]", "bg-[#2ec964]", "bg-[#1a6fb5]", "bg-[#f59e0b]"].map((bg, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} border-2 border-white text-[10px] font-bold text-white`}
                    >
                      {["AH", "MO", "JP", "SD"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="text-xs text-[#0a2f5b]/40">
                    <T k={t.hero.lovedBy} locale={l} />{" "}
                    <span className="font-semibold text-[#0a2f5b]/70">2.400+</span>{" "}
                    <T k={t.hero.users} locale={l} />
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Phone Simulator */}
            <div className="relative flex flex-col items-center lg:items-end">
              <div className="absolute -right-8 top-8 h-72 w-72 rounded-full bg-[#2ec964]/10 blur-[60px]" />

              {/* "Prøv mig" handwritten label + curving arrow */}
              <div className="absolute left-4 top-4 z-20 lg:left-2 lg:top-8 select-none pointer-events-none">
                <div style={{ transform: "rotate(-6deg)" }}>
                  <span className="block text-[38px] font-bold text-[#0a2f5b]/60" style={{ fontFamily: "var(--font-caveat), cursive" }}>
                    {l === "fo" ? "Royn meg!" : l === "da" ? "Prøv mig!" : "Try me!"}
                  </span>
                </div>
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none" className="ml-16 -mt-1">
                  <path
                    d="M6 4C18 10 36 22 56 34C72 44 84 50 92 54"
                    stroke="#0a2f5b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.45"
                  />
                  <path
                    d="M84 48L92 54L82 56"
                    stroke="#0a2f5b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.45"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <PhoneSimulator locale={l} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-[#0a2f5b]/[0.06] bg-gradient-to-r from-[#fafcff] to-[#f5faf7] p-8 md:grid-cols-4 md:gap-8 md:p-10">
            {[
              { value: "0 kr.", label: t.stats.freeTransfers },
              { value: "<1 sek.", label: t.stats.instantPayments },
              { value: "PCI DSS", label: t.stats.securityStandard },
              { value: "24/7", label: t.stats.aiSupport },
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
      <section id="funktioner" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2ec964]">
              <T k={t.features.label} locale={l} />
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0a2f5b] md:text-[2.5rem]">
              <T k={t.features.title} locale={l} />
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#0a2f5b]/40">
              <T k={t.features.subtitle} locale={l} />
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Send, title: t.features.sendTitle, desc: t.features.sendDesc, accent: "from-[#2ec964] to-[#1a8a45]" },
              { icon: QrCode, title: t.features.scanTitle, desc: t.features.scanDesc, accent: "from-[#0a2f5b] to-[#1a6fb5]" },
              { icon: Users, title: t.features.splitTitle, desc: t.features.splitDesc, accent: "from-[#f59e0b] to-[#d97706]" },
              { icon: Shield, title: t.features.securityTitle, desc: t.features.securityDesc, accent: "from-[#0a2f5b] to-[#1a6fb5]" },
              { icon: Zap, title: t.features.tagTitle, desc: t.features.tagDesc, accent: "from-[#2ec964] to-[#1a8a45]" },
              { icon: PiggyBank, title: t.features.controlTitle, desc: t.features.controlDesc, accent: "from-[#f59e0b] to-[#d97706]" },
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

      {/* ─── Groups ─── */}
      <section id="grupper" className="relative overflow-hidden py-28" style={{ background: "linear-gradient(135deg, #0a2f5b 0%, #0d3d73 50%, #0a2f5b 100%)" }}>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#2ec964]/10 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#2ec964]/[0.08] blur-[60px]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 flex justify-center lg:order-1 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[500px] w-[500px] rounded-full bg-[#2ec964]/25 blur-[100px]" />
              </div>
              <PhoneMockup>
                <div className="flex items-center gap-2 border-b border-gray-100 px-5 pt-10 pb-3">
                  <span className="text-[11px] text-[#0a2f5b]/30">←</span>
                  <p className="flex-1 text-center text-[13px] font-bold text-[#0a2f5b]">
                    <T k={t.groups.phoneTitle} locale={l} />
                  </p>
                  <span className="text-[11px] text-[#0a2f5b]/30">⋯</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#0a2f5b] to-[#0d3d73] p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">🍕</div>
                    <div>
                      <p className="text-[14px] font-bold text-white">780,00 kr.</p>
                      <p className="text-[10px] text-white/40"><T k={t.groups.membersCount} locale={l} /></p>
                    </div>
                  </div>

                  <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/30">
                    <T k={t.groups.members} locale={l} />
                  </p>
                  {[
                    { name: t.groups.you, paid: "350,00", balance: "+155,00", positive: true },
                    { name: { fo: "Magnus Hansen", da: "Magnus Hansen", en: "Magnus Hansen" }, paid: "250,00", balance: "+55,00", positive: true },
                    { name: { fo: "Sara Petersen", da: "Sara Petersen", en: "Sara Petersen" }, paid: "175,00", balance: "-20,00", positive: false },
                    { name: { fo: "Anna Olsen", da: "Anna Olsen", en: "Anna Olsen" }, paid: "0,00", balance: "-195,00", positive: false },
                  ].map((m) => (
                    <div key={m.name[l]} className="flex items-center gap-3 border-b border-[#0a2f5b]/[0.04] py-3 last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a2f5b]/[0.06] text-[10px] font-bold text-[#0a2f5b]">
                        {m.name[l].charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#0a2f5b]">{m.name[l]}</p>
                        <p className="text-[9px] text-[#0a2f5b]/25"><T k={t.groups.paid} locale={l} />: {m.paid} kr.</p>
                      </div>
                      <span className={`text-[12px] font-bold ${m.positive ? "text-[#2ec964]" : "text-red-400"}`}>
                        {m.balance} kr.
                      </span>
                    </div>
                  ))}

                  <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#0a2f5b]/30">
                    <T k={t.groups.latestExpense} locale={l} />
                  </p>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a2f5b]/[0.02] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a2f5b]/[0.06] text-xs">🧾</div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-[#0a2f5b]"><T k={t.groups.firstRound} locale={l} /></p>
                      <p className="text-[9px] text-[#0a2f5b]/25">Magnus · 1. apr</p>
                    </div>
                    <p className="text-[12px] font-bold text-[#0a2f5b]">250,00 kr.</p>
                  </div>
                </div>
              </PhoneMockup>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2ec964]">
                <T k={t.groups.label} locale={l} />
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-[2.5rem]">
                <T k={t.groups.titleLine1} locale={l} />
                <br />
                <span className="text-[#2ec964]"><T k={t.groups.titleLine2} locale={l} /></span>
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/50">
                <T k={t.groups.subtitle} locale={l} />
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { fo: "Líka deiling ella brúkaraskilgreind prosent", da: "Lige deling eller brugerdefineret procent", en: "Equal split or custom percentage" },
                  { fo: "Sí beinleiðis balance fyri øll limir", da: "Se realtids-balance for alle medlemmer", en: "See real-time balance for all members" },
                  { fo: "Legg útgjaldir afturat við kvittanarmynd", da: "Tilføj udgifter med kvitteringsbillede", en: "Add expenses with receipt photo" },
                  { fo: "Legg limir afturat við PayWay-Tag", da: "Tilføj medlemmer med PayWay-Tag", en: "Add members with PayWay-Tag" },
                  { fo: "Bólka atkvøður", da: "Gruppeafstemninger", en: "Group polls" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-full bg-white py-2.5 pl-3 pr-6 shadow-sm" style={{ width: "fit-content" }}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2ec964]">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-[14px] font-medium text-[#0a2f5b]">{item[l]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="saadan" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2ec964]">
              <T k={t.howItWorks.label} locale={l} />
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0a2f5b] md:text-[2.5rem]">
              <T k={t.howItWorks.title} locale={l} />
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#0a2f5b]/40">
              <T k={t.howItWorks.subtitle} locale={l} />
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              { step: "1", title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: Smartphone, color: "from-[#0a2f5b] to-[#1a6fb5]" },
              { step: "2", title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: Send, color: "from-[#2ec964] to-[#1a8a45]" },
              { step: "3", title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: QrCode, color: "from-[#f59e0b] to-[#d97706]" },
            ].map((s) => (
              <div key={s.step} className="group relative">
                <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#0a2f5b]/[0.04] hover:-translate-y-0.5">
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[40px] font-extrabold text-[#0a2f5b]/[0.06]">{s.step}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#0a2f5b]">{s.title[l]}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#0a2f5b]/40">{s.desc[l]}</p>
                </div>
              </div>
            ))}
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
              <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-white/5 blur-[40px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-white md:text-5xl">
                <T k={t.cta.title} locale={l} />
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/50">
                <T k={t.cta.subtitle} locale={l} />
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2ec964] px-8 py-4 text-[15px] font-bold text-white shadow-xl shadow-[#2ec964]/25 transition-all hover:bg-[#25a854] hover:shadow-2xl hover:shadow-[#2ec964]/30"
                >
                  <T k={t.cta.downloadFree} locale={l} />
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/login/business"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-[15px] font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
                >
                  PayWay Business
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#0a2f5b]/[0.05]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <img src="/payway-icon.png" alt="PayWay" className="h-8 w-8 rounded-lg" />
                <span className="text-[15px] font-bold text-[#0a2f5b]">PayWay</span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-[#0a2f5b]/35">
                <T k={t.footer.description} locale={l} />
              </p>
            </div>
            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                <T k={t.footer.product} locale={l} />
              </p>
              <ul className="space-y-2.5">
                <li><a href="#funktioner" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]"><T k={t.nav.features} locale={l} /></a></li>
                <li><a href="#grupper" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]"><T k={t.nav.groups} locale={l} /></a></li>
                <li><Link href="/login/business" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]">PayWay Business</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                <T k={t.footer.legal} locale={l} />
              </p>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]"><T k={t.footer.terms} locale={l} /></a></li>
                <li><a href="#" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]"><T k={t.footer.privacy} locale={l} /></a></li>
                <li><a href="#" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]"><T k={t.footer.cookies} locale={l} /></a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                <T k={t.footer.contact} locale={l} />
              </p>
              <ul className="space-y-2.5">
                <li><a href="mailto:support@payway.fo" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]">support@payway.fo</a></li>
                <li><a href="mailto:business@payway.fo" className="text-[14px] text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]">business@payway.fo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#0a2f5b]/[0.05] pt-8 md:flex-row">
            <p className="text-[13px] text-[#0a2f5b]/30">
              &copy; {new Date().getFullYear()} PayWay ApS. <T k={t.footer.copyright} locale={l} />
            </p>
            <div className="flex items-center gap-1 text-[13px] text-[#0a2f5b]/30">
              <T k={t.footer.madeWith} locale={l} /> <span className="text-[#2ec964]">♥</span> <T k={t.footer.inFaroeIslands} locale={l} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
