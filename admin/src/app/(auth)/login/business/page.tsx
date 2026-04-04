"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Users,
  Store,
  CreditCard,
  ChevronRight,
  Globe,
  ArrowLeftRight,
  Settings,
  DollarSign,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Få overblik over transaktioner, omsætning og kundeadfærd med live dashboards og detaljerede rapporter.",
  },
  {
    icon: Shield,
    title: "Sikker betaling",
    description:
      "PCI DSS Level 1 via Stripe. Alle transaktioner er krypterede og beskyttede med den højeste sikkerhedsstandard.",
  },
  {
    icon: Zap,
    title: "Instant overførsler",
    description:
      "Penge lander med det samme. Ingen ventetid, ingen forsinkelser – hurtig og problemfri betalingsoplevelse.",
  },
  {
    icon: Users,
    title: "Brugeradministration",
    description:
      "Administrer brugere, KYC-verifikation og konti fra ét centralt dashboard med fuld kontrol.",
  },
  {
    icon: Store,
    title: "Butikstilslutning",
    description:
      "Onboard butikker på minutter med QR-betalinger og lave gebyrer. Perfekt til det færøske marked.",
  },
  {
    icon: CreditCard,
    title: "Fleksible gebyrer",
    description:
      "Konfigurér gebyrstrukturer pr. transaktionstype. Transparent prissætning for alle parter.",
  },
];

const STATS = [
  { value: "2.800+", label: "Transaktioner" },
  { value: "127", label: "Aktive brugere" },
  { value: "14", label: "Tilsluttede butikker" },
  { value: "99,9%", label: "Oppetid" },
];

const DASHBOARD_NAV = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Users, label: "Brugere", active: false },
  { icon: ArrowLeftRight, label: "Transaktioner", active: false },
  { icon: Store, label: "Butikker", active: false },
  { icon: DollarSign, label: "Analytics", active: false },
  { icon: Settings, label: "Gebyrer", active: false },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100/50 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/payway-icon.png"
              alt="PayWay"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              PayWay <span className="font-medium text-gray-400">Business</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/login" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              PayWay App
            </Link>
            <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Funktioner
            </a>
            <a href="#dashboard" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Dashboard
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Priser
            </a>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a2f5b] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#081f3d] hover:shadow-lg hover:shadow-[#0a2f5b]/20"
          >
            Log ind
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2f5b]/[0.03] to-transparent" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[#2ec964]/[0.06] blur-3xl" />
          <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#0a2f5b]/[0.04] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:pb-32 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Globe className="h-3.5 w-3.5" />
              Færøernes førende betalingsplatform
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-7xl dark:text-white">
              Administrer
              <br />
              <span className="bg-gradient-to-r from-[#0a2f5b] to-[#2ec964] bg-clip-text text-transparent">
                betalinger
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              Det komplette admin-dashboard til at styre transaktioner, butikker
              og brugere. Bygget til det færøske marked med fokus på hastighed,
              sikkerhed og simplicitet.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0a2f5b] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#0a2f5b]/20 transition-all hover:bg-[#081f3d] hover:shadow-2xl hover:shadow-[#0a2f5b]/30"
              >
                Åbn Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Se funktioner
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div id="dashboard" className="relative mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400">admin.payway.fo</span>
              </div>
              <div className="flex">
                {/* Sidebar mock */}
                <div className="hidden w-48 shrink-0 border-r border-gray-100 bg-gray-50/50 p-3 md:block dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="mb-4 flex items-center gap-2 px-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0a2f5b] text-[9px] font-bold text-white">PW</div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Payway Admin</span>
                  </div>
                  {DASHBOARD_NAV.map((item) => (
                    <div
                      key={item.label}
                      className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                        item.active
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "text-gray-500"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 p-5">
                  <p className="text-base font-bold text-gray-900 dark:text-white">Dashboard</p>
                  <p className="mb-4 text-[11px] text-gray-400">Oversigt over Payway platformen</p>
                  <div className="grid grid-cols-4 gap-3">
                    {STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                      >
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="mt-0.5 text-[10px] text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-36 rounded-xl bg-gradient-to-br from-[#0a2f5b]/10 to-[#0a2f5b]/5 p-4 dark:from-[#0a2f5b]/20">
                      <p className="text-xs font-semibold text-gray-600">Volumen pr. type</p>
                      <div className="mt-4 flex items-end gap-2">
                        <div className="h-16 w-8 rounded bg-[#0a2f5b]/60" />
                        <div className="h-12 w-8 rounded bg-[#2ec964]/60" />
                        <div className="h-20 w-8 rounded bg-[#0a2f5b]/40" />
                        <div className="h-8 w-8 rounded bg-[#2ec964]/40" />
                        <div className="h-14 w-8 rounded bg-[#0a2f5b]/50" />
                      </div>
                    </div>
                    <div className="h-36 rounded-xl bg-gradient-to-br from-[#2ec964]/10 to-[#2ec964]/5 p-4 dark:from-[#2ec964]/20">
                      <p className="text-xs font-semibold text-gray-600">Transaktioner pr. type</p>
                      <div className="mt-2 flex items-center justify-center">
                        <div className="relative h-20 w-20">
                          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#0a2f5b" strokeWidth="4" strokeDasharray="40 88" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#2ec964" strokeWidth="4" strokeDasharray="28 88" strokeDashoffset="-40" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-[#0a2f5b]/5 to-transparent blur-2xl" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold text-[#0a2f5b] dark:text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Alt hvad du behøver
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Et komplet sæt værktøjer til at drive din betalingsplatform
              effektivt og sikkert.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 transition-all hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-none"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a2f5b]/10 text-[#0a2f5b] transition-colors group-hover:bg-[#0a2f5b] group-hover:text-white dark:bg-[#0a2f5b]/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-gray-100 bg-gray-50/50 py-24 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Transparent prissætning
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Ingen skjulte gebyrer. Du betaler kun for det du bruger.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-[#2ec964]">Butikker</p>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
                1–2%
              </p>
              <p className="mt-1 text-sm text-gray-500">pr. transaktion</p>
              <ul className="mt-6 space-y-3">
                {[
                  "QR-betalinger fra PayWay-brugere",
                  "Real-time dashboard",
                  "Daglige udbetalinger til bankkonto",
                  "Dedikeret support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#2ec964]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-2xl border-2 border-[#0a2f5b] bg-white p-8 dark:bg-gray-900">
              <div className="absolute -top-3 right-6 rounded-full bg-[#0a2f5b] px-3 py-1 text-xs font-bold text-white">
                Anbefalet
              </div>
              <p className="text-sm font-semibold text-[#0a2f5b] dark:text-blue-400">Platform</p>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
                Kontakt os
              </p>
              <p className="mt-1 text-sm text-gray-500">skræddersyet løsning</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Alt fra butikspakken",
                  "Brugeradministration",
                  "KYC/AML compliance",
                  "Avanceret analytics",
                  "White-label muligheder",
                  "API-adgang",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0a2f5b] dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a2f5b] px-8 py-20 text-center md:px-16">
            <div className="absolute inset-0">
              <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#2ec964]/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-72 w-72 translate-y-1/2 -translate-x-1/3 rounded-full bg-white/5 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white md:text-5xl">Klar til at komme i gang?</h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
                Log ind og få adgang til dit PayWay Business dashboard med det
                samme. Ingen opsætning nødvendig.
              </p>
              <Link
                href="/"
                className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-[#2ec964] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#2ec964]/20 transition-all hover:bg-[#25a854] hover:shadow-2xl"
              >
                Log ind til Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/payway-icon.png" alt="" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">PayWay Business</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Payway ApS. Alle rettigheder forbeholdes.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">PayWay App</Link>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Vilkår</a>
            <a href="mailto:business@payway.fo" className="text-sm text-gray-400 hover:text-gray-600">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
