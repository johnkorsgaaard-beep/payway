"use client";

import Link from "next/link";
import Image from "next/image";
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
  SplitSquareHorizontal,
} from "lucide-react";

function IPhoneMockup({
  screenshot,
  alt,
  className = "",
}: {
  screenshot: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[260px] rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 p-1.5 shadow-2xl dark:border-gray-700">
        <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-900 dark:bg-gray-700" />
        <div className="relative overflow-hidden rounded-[2.25rem] bg-white">
          <Image
            src={screenshot}
            alt={alt}
            width={520}
            height={1126}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}

function IPhoneMockupCSS({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[260px] rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 p-1.5 shadow-2xl dark:border-gray-700">
        <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-900 dark:bg-gray-700" />
        <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[2.25rem] bg-[#f9fafb]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
              PayWay
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Funktioner
            </a>
            <a href="#groups" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Grupper
            </a>
            <a href="#how" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Sådan virker det
            </a>
            <Link href="/login/business" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              PayWay Business
            </Link>
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2f5b]/[0.02] to-transparent" />
          <div className="absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-[#2ec964]/[0.05] blur-3xl" />
          <div className="absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/3 rounded-full bg-[#0a2f5b]/[0.04] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 md:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Smartphone className="h-3.5 w-3.5" />
                Tilgængelig på Færøerne
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-6xl dark:text-white">
                Den smarteste
                <br />
                måde at
                <br />
                <span className="bg-gradient-to-r from-[#0a2f5b] to-[#2ec964] bg-clip-text text-transparent">
                  betale på
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                Send penge til venner, betal i butikker med QR-scan, del
                udgifter i grupper – alt sammen fra én app. Hurtigt, sikkert
                og helt gratis.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-60">Download på</div>
                    <div className="text-base font-semibold leading-tight">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.627L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.991l-2.302 2.302-8.634-8.635z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-60">Hent den på</div>
                    <div className="text-base font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Hero Phone Mockups */}
            <div className="relative flex justify-center">
              <IPhoneMockupCSS className="relative z-10">
                <div className="flex h-14 items-center justify-between px-5 pt-8">
                  <div className="flex items-center gap-1.5">
                    <Image src="/payway-icon.png" alt="" width={22} height={22} className="rounded-md" />
                    <span className="text-sm font-bold text-[#0a2f5b]">PayWay</span>
                  </div>
                </div>
                <div className="mx-4 mt-3 rounded-2xl bg-[#0a2f5b] p-5">
                  <p className="text-[11px] text-white/50">Din saldo</p>
                  <p className="mt-1 text-3xl font-bold text-white">4.250,00 <span className="text-base font-medium text-white/50">DKK</span></p>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      { label: "Fyld op", icon: "+" },
                      { label: "Send", icon: "→" },
                      { label: "Scan QR", icon: "⊞" },
                      { label: "Betal", icon: "₭" },
                    ].map((a) => (
                      <div key={a.label} className="rounded-xl bg-white/10 py-2 text-center">
                        <div className="text-xs text-white/80">{a.icon}</div>
                        <p className="mt-0.5 text-[9px] text-white/60">{a.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 px-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">Seneste aktivitet</p>
                    <p className="text-xs text-gray-400">Se alle</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {[
                      { name: "Anna Hansen", amount: "-75,00 kr.", type: "send", emoji: "→" },
                      { name: "Café Nólsoy", amount: "-42,50 kr.", type: "shop", emoji: "☕" },
                      { name: "Magnus Petersen", amount: "+150,00 kr.", type: "receive", emoji: "←" },
                    ].map((tx) => (
                      <div key={tx.name} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm">
                          {tx.emoji}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-900">{tx.name}</p>
                          <p className="text-[10px] text-gray-400">I dag</p>
                        </div>
                        <p className={`text-xs font-bold ${tx.type === "receive" ? "text-[#2ec964]" : "text-gray-900"}`}>
                          {tx.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </IPhoneMockupCSS>

              <IPhoneMockup
                screenshot="/screenshots/send.png"
                alt="Send penge"
                className="absolute -right-4 top-12 z-0 hidden scale-[0.85] opacity-60 blur-[1px] lg:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted */}
      <section className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-14 md:grid-cols-4">
          {[
            { value: "0 kr.", label: "Gratis P2P-overførsler" },
            { value: "<1 sek.", label: "Instant betalinger" },
            { value: "PCI DSS", label: "Sikkerhedsstandard" },
            { value: "24/7", label: "AI Support" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-[#0a2f5b] md:text-3xl dark:text-white">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Alt i én app
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              PayWay samler alle dine betalinger ét sted – hurtigt, sikkert og nemt.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Send,
                title: "Send penge instant",
                desc: "Overfør penge til venner og familie med PayWay-Tag eller telefonnummer. Pengene lander med det samme.",
              },
              {
                icon: QrCode,
                title: "Scan & betal",
                desc: "Betal i butikker ved at scanne en QR-kode. Hurtigere end kort, sikrere end kontanter.",
              },
              {
                icon: Users,
                title: "Del udgifter",
                desc: "Opret grupper og del regningen. Vælg mellem lige fordeling eller procent – PayWay holder styr på det hele.",
              },
              {
                icon: Shield,
                title: "Bank-niveau sikkerhed",
                desc: "Godkend betalinger med Face ID eller PIN. Dine data er krypterede og beskyttede med PCI DSS Level 1.",
              },
              {
                icon: Zap,
                title: "PayWay-Tag",
                desc: "Dit unikke brugernavn gør det nemt at modtage penge. Del dit @tag i stedet for telefonnummer.",
              },
              {
                icon: PiggyBank,
                title: "Fuld kontrol",
                desc: "Se din saldo, transaktionshistorik og administrer dine kort – alt sammen fra din lomme.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a2f5b]/10 text-[#0a2f5b] transition-colors group-hover:bg-[#0a2f5b] group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <section id="groups" className="border-y border-gray-100 bg-gray-50/50 py-24 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 flex justify-center lg:order-1">
              <IPhoneMockupCSS>
                <div className="flex h-12 items-center justify-between border-b border-gray-200 px-5 pt-7">
                  <p className="text-xs text-gray-400">‹ Main</p>
                  <p className="text-sm font-bold text-gray-900">Gruppe</p>
                  <div className="w-8" />
                </div>
                <div className="p-4">
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#0a2f5b] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">🍕</div>
                    <div>
                      <p className="text-sm font-bold text-white">Fredag pizza</p>
                      <p className="text-[10px] text-white/50">4 medlemmer · Lige deling</p>
                    </div>
                  </div>

                  <p className="mb-2 text-xs font-bold text-gray-900">Medlemmer</p>
                  {[
                    { name: "Dig", paid: "350,00", share: "195,00", balance: "+155,00", color: "text-[#2ec964]" },
                    { name: "Magnus Hansen", paid: "250,00", share: "195,00", balance: "+55,00", color: "text-[#2ec964]" },
                    { name: "Sara Petersen", paid: "175,00", share: "195,00", balance: "-20,00", color: "text-red-500" },
                    { name: "Anna Olsen", paid: "0,00", share: "195,00", balance: "-195,00", color: "text-red-500" },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center gap-2 border-b border-gray-100 py-2.5 last:border-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2f5b] text-[10px] font-bold text-white">
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-gray-900">{m.name}</p>
                        <p className="text-[9px] text-gray-400">Betalt: {m.paid} kr.</p>
                      </div>
                      <p className={`text-[11px] font-bold ${m.color}`}>{m.balance} kr.</p>
                    </div>
                  ))}

                  <p className="mb-2 mt-4 text-xs font-bold text-gray-900">Udgifter</p>
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a2f5b]/10 text-xs">🧾</div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-gray-900">Første runde</p>
                      <p className="text-[9px] text-gray-400">Betalt af Magnus · 1. apr</p>
                    </div>
                    <p className="text-[11px] font-bold text-gray-900">250,00 kr.</p>
                  </div>
                </div>
              </IPhoneMockupCSS>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2ec964]/30 bg-[#2ec964]/5 px-4 py-1.5 text-sm font-medium text-[#2ec964]">
                <SplitSquareHorizontal className="h-3.5 w-3.5" />
                Gruppeløsninger
              </div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                Del regningen
                <br />
                <span className="text-[#2ec964]">uden bøvl</span>
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-500">
                Opret grupper til ferie, middage eller faste udgifter. PayWay
                holder automatisk styr på hvem der skylder hvad.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Lige deling eller brugerdefineret procent",
                  "Tilføj udgifter med kvittering-foto",
                  "Se live balance for alle medlemmer",
                  "Tilføj medlemmer via PayWay-Tag",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2ec964]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Sådan virker det
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Kom i gang med PayWay på under 2 minutter
            </p>
          </div>

          <div className="mt-16 grid items-start gap-12 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Download appen",
                desc: "Hent PayWay gratis fra App Store eller Google Play. Opret din konto med dit telefonnummer.",
                screenshot: "/screenshots/scan.png",
              },
              {
                step: "02",
                title: "Fyld op & send",
                desc: "Tilknyt dit betalingskort og fyld op. Send penge til venner med deres @PayWay-Tag.",
                screenshot: "/screenshots/send.png",
              },
              {
                step: "03",
                title: "Betal overalt",
                desc: "Scan QR-koder i butikker, del udgifter i grupper og hold styr på din økonomi.",
                screenshot: "/screenshots/profile.png",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <IPhoneMockup
                  screenshot={s.screenshot}
                  alt={s.title}
                  className="mx-auto mb-8 scale-90"
                />
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0a2f5b] text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a2f5b] px-8 py-20 md:px-16">
            <div className="absolute inset-0">
              <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#2ec964]/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-72 w-72 translate-y-1/2 -translate-x-1/3 rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white md:text-5xl">
                  Klar til at prøve?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-white/60 lg:mx-0">
                  Download PayWay i dag og oplev fremtidens betalinger på
                  Færøerne. Det er gratis og tager 2 minutter.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2ec964] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#2ec964]/20 transition-all hover:bg-[#25a854]"
                  >
                    Download gratis
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <Link
                    href="/login/business"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                  >
                    PayWay Business
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="hidden justify-center lg:flex">
                <Image
                  src="/payway-logo.png"
                  alt="PayWay"
                  width={200}
                  height={200}
                  className="rounded-[2.5rem] opacity-90 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/payway-icon.png" alt="" width={28} height={28} className="rounded-lg" />
                <span className="text-base font-bold text-gray-900 dark:text-white">PayWay</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Færøernes førende mobile betalingsplatform. Hurtigt, sikkert og enkelt.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Produkt</p>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-gray-600">Funktioner</a></li>
                <li><a href="#groups" className="text-sm text-gray-400 hover:text-gray-600">Grupper</a></li>
                <li><Link href="/login/business" className="text-sm text-gray-400 hover:text-gray-600">PayWay Business</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Juridisk</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-gray-600">Vilkår & Betingelser</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-gray-600">Privatlivspolitik</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-gray-600">Cookiepolitik</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Kontakt</p>
              <ul className="space-y-2">
                <li><a href="mailto:support@payway.fo" className="text-sm text-gray-400 hover:text-gray-600">support@payway.fo</a></li>
                <li><a href="mailto:business@payway.fo" className="text-sm text-gray-400 hover:text-gray-600">business@payway.fo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center dark:border-gray-800">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Payway ApS. Alle rettigheder forbeholdes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
