"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Store,
  User,
  Mail,
  Phone,
  Hash,
  ShieldCheck,
  Sparkles,
  Clock,
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

export default function OnboardingPage() {
  const [locale, setLocale] = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const l = locale;
  const ob = t.biz.onboarding;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0faf4] via-white to-[#eef4fb] px-6">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#2ec964]/[0.05] blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0a2f5b]/[0.03] blur-[80px]" />

        <div className="relative w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2ec964]/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2ec964] shadow-lg shadow-[#2ec964]/25">
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2f5b]">
            <T k={ob.successTitle} locale={l} />
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-[#0a2f5b]/45">
            <T k={ob.successSubtitle} locale={l} />
          </p>

          <div className="mx-auto mt-10 max-w-sm">
            <p className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
              <T k={ob.successWhat} locale={l} />
            </p>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: ob.successStep1 },
                { icon: Phone, text: ob.successStep2 },
                { icon: Sparkles, text: ob.successStep3 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#0a2f5b]/[0.06] bg-white p-4 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a2f5b]/[0.04]">
                    <step.icon className="h-5 w-5 text-[#0a2f5b]/40" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#0a2f5b]">
                      <T k={step.text} locale={l} />
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-[#0a2f5b]/15">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/business"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl border-2 border-[#0a2f5b]/10 bg-white px-8 py-4 text-[15px] font-semibold text-[#0a2f5b] transition-all hover:border-[#0a2f5b]/20 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <T k={ob.backToBusiness} locale={l} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf4] via-white to-[#eef4fb]">
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#2ec964]/[0.05] blur-[120px]" />
      <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0a2f5b]/[0.03] blur-[80px]" />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link href="/business" className="flex items-center gap-2 text-[14px] font-medium text-[#0a2f5b]/50 transition-colors hover:text-[#0a2f5b]">
          <ArrowLeft className="h-4 w-4" />
          PayWay Business
        </Link>
        <LanguageSwitcher locale={l} onChange={setLocale} />
      </nav>

      {/* Form */}
      <div className="relative z-10 mx-auto max-w-lg px-6 pb-20 pt-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2ec964] shadow-lg shadow-[#2ec964]/20">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[2rem] font-extrabold tracking-tight text-[#0a2f5b]">
            <T k={ob.title} locale={l} />
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#0a2f5b]/40">
            <T k={ob.subtitle} locale={l} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {/* Store name */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#0a2f5b]/70">
              <Store className="h-3.5 w-3.5 text-[#0a2f5b]/30" />
              <T k={ob.storeName} locale={l} />
            </label>
            <input
              type="text"
              required
              placeholder={ob.storeNamePlaceholder[l]}
              className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3.5 text-[15px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
            />
          </div>

          {/* CVR */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#0a2f5b]/70">
              <Hash className="h-3.5 w-3.5 text-[#0a2f5b]/30" />
              <T k={ob.cvr} locale={l} />
            </label>
            <input
              type="text"
              required
              placeholder={ob.cvrPlaceholder[l]}
              className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3.5 text-[15px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
            />
          </div>

          {/* Contact name */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#0a2f5b]/70">
              <User className="h-3.5 w-3.5 text-[#0a2f5b]/30" />
              <T k={ob.contactName} locale={l} />
            </label>
            <input
              type="text"
              required
              placeholder={ob.contactNamePlaceholder[l]}
              className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3.5 text-[15px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
            />
          </div>

          {/* Email + Phone side by side */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#0a2f5b]/70">
                <Mail className="h-3.5 w-3.5 text-[#0a2f5b]/30" />
                <T k={ob.email} locale={l} />
              </label>
              <input
                type="email"
                required
                placeholder={ob.emailPlaceholder[l]}
                className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3.5 text-[15px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#0a2f5b]/70">
                <Phone className="h-3.5 w-3.5 text-[#0a2f5b]/30" />
                <T k={ob.phone} locale={l} />
              </label>
              <input
                type="tel"
                required
                placeholder={ob.phonePlaceholder[l]}
                className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3.5 text-[15px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#2ec964] px-8 py-4 text-[16px] font-bold text-white shadow-lg shadow-[#2ec964]/25 transition-all hover:bg-[#25a854] hover:shadow-xl hover:shadow-[#2ec964]/30 disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <T k={ob.submit} locale={l} />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          {/* Terms + free note */}
          <div className="space-y-2 text-center">
            <p className="text-[12px] text-[#0a2f5b]/30">
              <T k={ob.terms} locale={l} />{" "}
              <a href="#" className="underline transition-colors hover:text-[#0a2f5b]/60">
                <T k={ob.termsLink} locale={l} />
              </a>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#0a2f5b]/25">
              <Clock className="h-3 w-3" />
              <T k={ob.freeNote} locale={l} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
