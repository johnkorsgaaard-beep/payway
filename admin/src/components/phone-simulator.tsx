"use client";

import { useState } from "react";
import { type Locale } from "@/lib/i18n";

type Screen = "home" | "send" | "send-confirm" | "send-done" | "scan" | "topup" | "topup-done" | "history" | "detail";

const C = {
  primary: "#0a2f5b",
  accent: "#2ec964",
  accentDark: "#25a854",
  success: "#2ec964",
  warning: "#f59e0b",
  danger: "#ef4444",
  bg: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
  textSec: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
};

const RECIPIENTS = [
  { name: "Magnus Hansen", tag: "magnus.h" },
  { name: "Sara Petersen", tag: "sarap" },
  { name: "Jónas Djurhuus", tag: "jonas.d" },
  { name: "Anna Olsen", tag: "anna.o" },
  { name: "Katrin Danielsen", tag: "katrin.d" },
];

const TRANSACTIONS = [
  { id: "1", type: "P2P", typeLabel: "Overførsel", icon: "⇄", direction: "outgoing", name: "Magnus Hansen", desc: "Tak for mad!", amount: 15000, time: "30 min" },
  { id: "2", type: "P2P", typeLabel: "Overførsel", icon: "⇄", direction: "incoming", name: "Sara Petersen", desc: "Biografbilletter", amount: 7500, time: "3 timer" },
  { id: "3", type: "MERCHANT", typeLabel: "Betaling", icon: "🛒", direction: "outgoing", name: "Café Nólsoy", desc: "", amount: 34900, time: "8 timer" },
  { id: "4", type: "TOPUP", typeLabel: "Optankning", icon: "↓", direction: "incoming", name: "Visa •4242", desc: "Wallet top-up", amount: 50000, time: "1 dag" },
  { id: "5", type: "P2P", typeLabel: "Overførsel", icon: "⇄", direction: "outgoing", name: "Jónas Djurhuus", desc: "Kaffe ☕", amount: 2500, time: "1 dag" },
  { id: "6", type: "P2P", typeLabel: "Overførsel", icon: "⇄", direction: "incoming", name: "Anna Olsen", desc: "", amount: 12000, time: "2 dage" },
];

function formatDKK(oere: number) {
  const kr = (oere / 100).toFixed(2).replace(".", ",");
  return `${kr} kr.`;
}

const TYPE_ICON_COLORS: Record<string, { color: string; bg: string }> = {
  P2P: { color: C.primary, bg: "#e8eef5" },
  MERCHANT: { color: "#8b5cf6", bg: "#f3e8ff" },
  TOPUP: { color: C.warning, bg: "#fef3c7" },
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function PhoneSimulator({ locale: l }: { locale: Locale }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("150");
  const [sendDesc, setSendDesc] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedTx, setSelectedTx] = useState(TRANSACTIONS[0]);
  const [animating, setAnimating] = useState(false);
  const [pin, setPin] = useState("");

  const navigate = (s: Screen) => {
    setAnimating(true);
    setTimeout(() => { setScreen(s); setAnimating(false); }, 120);
  };

  const NavHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex items-center gap-2 px-4 pt-12 pb-3 border-b" style={{ borderColor: C.borderLight }}>
      <button onClick={onBack} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: C.textSec }}>
        <span className="text-[16px]">‹</span> Tilbage
      </button>
      <p className="flex-1 text-center text-[14px] font-semibold pr-12" style={{ color: C.text }}>{title}</p>
    </div>
  );

  return (
    <div className="relative">
      <div className="relative mx-auto w-[272px] rounded-[3rem] border-[6px] border-[#1a1a2e] bg-[#1a1a2e] p-1 shadow-[0_25px_60px_-12px_rgba(10,47,91,0.25)]">
        <div className="absolute left-1/2 top-1.5 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1a1a2e]" />
        <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[2.3rem]" style={{ backgroundColor: C.bg }}>
          <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-120 ${animating ? "opacity-0" : "opacity-100"}`}>

            {/* ── HOME ── */}
            {screen === "home" && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Balance Card */}
                <div className="mx-4 mt-12 rounded-3xl p-5 text-center" style={{ backgroundColor: C.primary }}>
                  <p className="text-[12px] font-medium text-white/70">Wallet-saldo</p>
                  <p className="mt-1 text-[32px] font-extrabold tracking-tight text-white">4.250,00</p>
                  <p className="text-[11px] font-medium text-white/60">Til overførsler mellem venner</p>
                  <div className="mt-4 flex justify-center gap-5">
                    <button onClick={() => navigate("topup")} className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 active:scale-95 transition-transform">
                      <span className="text-[18px] text-white/90">⊕</span>
                      <span className="text-[11px] font-semibold text-white/90">Fyld op</span>
                    </button>
                    <button onClick={() => navigate("send")} className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 active:scale-95 transition-transform">
                      <span className="text-[16px] text-white/90">➤</span>
                      <span className="text-[11px] font-semibold text-white/90">Send</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 px-4 mt-3">
                  {[
                    { label: "Send til ven", sub: "Fra wallet", icon: "👤", iconBg: "#e8faf0", action: () => navigate("send") },
                    { label: "Scan QR", sub: "Betal i butik", icon: "🏪", iconBg: "#f0fdf4", action: () => navigate("scan") },
                    { label: "Fyld op", sub: "Wallet", icon: "💳", iconBg: "#fef3c7", action: () => navigate("topup") },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 active:scale-95 transition-transform" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: a.iconBg }}>
                        <span className="text-[14px]">{a.icon}</span>
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: C.text }}>{a.label}</span>
                      <span className="text-[8px] -mt-1" style={{ color: C.textLight }}>{a.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Transactions */}
                <div className="px-4 mt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-bold" style={{ color: C.text }}>Seneste aktivitet</p>
                    <button onClick={() => navigate("history")} className="text-[12px] font-semibold" style={{ color: C.text }}>Se alle</button>
                  </div>
                  <div className="space-y-1.5">
                    {TRANSACTIONS.slice(0, 4).map((tx) => {
                      const tc = TYPE_ICON_COLORS[tx.type] || TYPE_ICON_COLORS.P2P;
                      return (
                        <button key={tx.id} onClick={() => { setSelectedTx(tx); navigate("detail"); }} className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left active:scale-[0.98] transition-transform" style={{ backgroundColor: C.surface, borderColor: C.borderLight }}>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: tc.bg }}>
                            <span className="text-[14px]" style={{ color: tc.color }}>{tx.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold truncate" style={{ color: C.text }}>{tx.typeLabel}</p>
                            <p className="text-[10px] truncate" style={{ color: C.textSec }}>
                              {tx.direction === "incoming" ? `Fra ${tx.name}` : `Til ${tx.name}`}
                            </p>
                          </div>
                          <span className="text-[12px] font-bold" style={{ color: tx.direction === "incoming" ? C.success : C.text }}>
                            {tx.direction === "incoming" ? "+" : "-"}{formatDKK(tx.amount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── SEND ── */}
            {screen === "send" && (
              <>
                <NavHeader title="Send penge" onBack={() => navigate("home")} />
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <p className="text-[12px] font-semibold mb-2" style={{ color: C.textSec }}>Seneste</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {RECIPIENTS.map((r) => (
                      <button key={r.tag} onClick={() => { setSelectedRecipient(r.name); navigate("send-confirm"); }} className="flex flex-col items-center shrink-0 w-12 active:scale-95 transition-transform">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: C.primary, border: selectedRecipient === r.name ? `2.5px solid ${C.accent}` : "none" }}>
                          {r.name.charAt(0)}
                        </div>
                        <span className="text-[9px] mt-1 truncate w-full text-center" style={{ color: C.textSec }}>{r.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[12px] font-semibold mt-3 mb-1" style={{ color: C.textSec }}>Modtager</p>
                  <input className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} placeholder="@payway-tag eller +298..." />

                  <p className="text-[12px] font-semibold mt-3 mb-1" style={{ color: C.textSec }}>Beløb (DKK)</p>
                  <input type="text" value={sendAmount} onChange={(e) => setSendAmount(e.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-xl border px-3 py-4 text-center text-[24px] font-extrabold outline-none" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} placeholder="0,00" />

                  <p className="text-[12px] font-semibold mt-3 mb-1" style={{ color: C.textSec }}>Besked (valgfrit)</p>
                  <input value={sendDesc} onChange={(e) => setSendDesc(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} placeholder="F.eks. aftensmad" />

                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2.5" style={{ borderColor: C.border }}>
                    <span className="text-[13px]">📷</span>
                    <span className="text-[12px] font-semibold" style={{ color: C.primary }}>Tilføj kvittering</span>
                  </button>

                  <button onClick={() => { if (!selectedRecipient) setSelectedRecipient(RECIPIENTS[0].name); navigate("send-confirm"); }} className="mt-4 w-full rounded-xl py-3.5 text-[14px] font-bold text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: C.accent }}>
                    Fortsæt
                  </button>
                </div>
              </>
            )}

            {/* ── SEND CONFIRM ── */}
            {screen === "send-confirm" && (
              <>
                <NavHeader title="Send penge" onBack={() => navigate("send")} />
                <div className="flex-1 flex flex-col items-center px-5 pt-5">
                  <div className="w-full rounded-2xl border p-5 text-center" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#e8faf0" }}>
                      <span className="text-[22px]" style={{ color: C.accent }}>➤</span>
                    </div>
                    <p className="mt-3 text-[15px] font-bold" style={{ color: C.text }}>Bekræft overførsel</p>
                    <p className="mt-1 text-[28px] font-extrabold" style={{ color: C.accent }}>{formatDKK(parseInt(sendAmount || "0") * 100)}</p>
                    <p className="text-[13px]" style={{ color: C.textSec }}>Til: {selectedRecipient || RECIPIENTS[0].name}</p>
                    {sendDesc && <p className="text-[12px] italic mt-1" style={{ color: C.textLight }}>"{sendDesc}"</p>}
                  </div>

                  <p className="text-[12px] font-semibold mt-5 mb-1 self-start" style={{ color: C.textSec }}>Indtast PIN</p>
                  <input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} className="w-full rounded-xl border px-3 py-3.5 text-center text-[24px] font-bold tracking-[12px] outline-none" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} placeholder="----" maxLength={4} />

                  <button onClick={() => { setPin(""); navigate("send-done"); }} className="mt-5 w-full rounded-xl py-3.5 text-[14px] font-bold text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: C.accent }}>
                    Send penge
                  </button>
                  <button onClick={() => { setPin(""); navigate("send"); }} className="mt-2 py-2 text-[13px] font-medium" style={{ color: C.textSec }}>Annuller</button>
                </div>
              </>
            )}

            {/* ── SEND DONE ── */}
            {screen === "send-done" && (
              <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: C.accent, boxShadow: `0 8px 24px ${C.accent}50` }}>
                  <span className="text-[36px] text-white">✓</span>
                </div>
                <p className="mt-5 text-[20px] font-extrabold" style={{ color: C.text }}>Betaling sendt!</p>
                <p className="mt-1 text-[28px] font-extrabold" style={{ color: C.accent }}>{formatDKK(parseInt(sendAmount || "0") * 100)}</p>
                <p className="mt-1 text-[14px]" style={{ color: C.textSec }}>til {selectedRecipient || RECIPIENTS[0].name}</p>
                <button onClick={() => { setSendAmount("150"); setSendDesc(""); setSelectedRecipient(""); navigate("home"); }} className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-bold text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: C.primary }}>
                  Færdig
                </button>
              </div>
            )}

            {/* ── SCAN ── */}
            {screen === "scan" && (
              <div className="flex-1 flex flex-col bg-black relative">
                <button onClick={() => navigate("home")} className="absolute top-12 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-2">
                  <span className="text-white text-[14px]">‹</span>
                  <span className="text-white text-[13px] font-semibold">Tilbage</span>
                </button>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative h-40 w-40 rounded-3xl border-[3px]" style={{ borderColor: C.accent }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-[2px] w-3/4 rounded-full animate-pulse" style={{ backgroundColor: C.accent }} />
                    </div>
                  </div>
                  <p className="mt-5 text-[14px] font-semibold text-white">Scan butikkens QR-kode</p>
                </div>
              </div>
            )}

            {/* ── TOPUP ── */}
            {screen === "topup" && (
              <>
                <NavHeader title="Fyld op" onBack={() => navigate("home")} />
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {/* Banner */}
                  <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: C.primary }}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-2">
                      <span className="text-[22px] text-white">💳</span>
                    </div>
                    <p className="text-[18px] font-extrabold text-white">Fyld op</p>
                    <p className="text-[12px] text-white/70 mt-0.5">Tilføj penge til din PayWay wallet</p>
                  </div>

                  <p className="text-[12px] font-semibold mt-4 mb-1" style={{ color: C.textSec }}>Beløb (DKK)</p>
                  <input type="text" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-xl border px-3 py-4 text-center text-[28px] font-extrabold outline-none" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} placeholder="0" />

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {QUICK_AMOUNTS.map((qa) => (
                      <button key={qa} onClick={() => setTopUpAmount(String(qa))} className="flex-1 min-w-[48px] rounded-lg border py-2 text-center text-[11px] font-semibold active:scale-95 transition-transform" style={{ backgroundColor: topUpAmount === String(qa) ? "#e8faf0" : C.surface, borderColor: topUpAmount === String(qa) ? C.accent : C.border, color: topUpAmount === String(qa) ? C.accent : C.textSec }}>
                        {qa} kr
                      </button>
                    ))}
                  </div>

                  <p className="text-[12px] font-semibold mt-4 mb-1.5" style={{ color: C.textSec }}>Betalingsmetode</p>
                  <button className="flex w-full items-center gap-2 rounded-xl border p-3 mb-1.5" style={{ backgroundColor: "#e8faf0", borderColor: C.accent }}>
                    <span className="text-[16px]"></span>
                    <span className="flex-1 text-[13px] font-semibold text-left" style={{ color: C.accent }}>Apple Pay</span>
                    <span className="text-[14px]" style={{ color: C.accent }}>✓</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-xl border p-3" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                    <span className="text-[14px]" style={{ color: C.textSec }}>💳</span>
                    <span className="flex-1 text-[13px] font-semibold text-left" style={{ color: C.textSec }}>Betalingskort</span>
                  </button>

                  <button onClick={() => navigate("topup-done")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-white active:scale-[0.97] transition-transform">
                    <span className="text-[16px]"></span>
                    <span className="text-[14px] font-bold">
                      Betal{topUpAmount ? ` ${formatDKK(parseInt(topUpAmount) * 100)}` : ""} med Apple Pay
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* ── TOPUP DONE ── */}
            {screen === "topup-done" && (
              <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: C.accent, boxShadow: `0 8px 24px ${C.accent}50` }}>
                  <span className="text-[36px] text-white">✓</span>
                </div>
                <p className="mt-5 text-[20px] font-extrabold" style={{ color: C.text }}>Optanket!</p>
                <p className="mt-1 text-[28px] font-extrabold" style={{ color: C.accent }}>{formatDKK(parseInt(topUpAmount || "0") * 100)}</p>
                <p className="mt-1 text-[14px]" style={{ color: C.textSec }}>er tilføjet din wallet</p>
                <button onClick={() => { setTopUpAmount(""); navigate("home"); }} className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-bold text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: C.primary }}>
                  Færdig
                </button>
              </div>
            )}

            {/* ── HISTORY ── */}
            {screen === "history" && (
              <>
                <NavHeader title="Historik" onBack={() => navigate("home")} />
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                  {TRANSACTIONS.map((tx) => {
                    const tc = TYPE_ICON_COLORS[tx.type] || TYPE_ICON_COLORS.P2P;
                    return (
                      <button key={tx.id} onClick={() => { setSelectedTx(tx); navigate("detail"); }} className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left active:scale-[0.98] transition-transform" style={{ backgroundColor: C.surface, borderColor: C.borderLight }}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: tc.bg }}>
                          <span className="text-[14px]" style={{ color: tc.color }}>{tx.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate" style={{ color: C.text }}>{tx.typeLabel}</p>
                          <p className="text-[10px] truncate" style={{ color: C.textSec }}>
                            {tx.direction === "incoming" ? `Fra ${tx.name}` : `Til ${tx.name}`}
                          </p>
                          {tx.desc && <p className="text-[9px] italic truncate" style={{ color: C.textLight }}>{tx.desc}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold" style={{ color: tx.direction === "incoming" ? C.success : C.text }}>
                            {tx.direction === "incoming" ? "+" : "-"}{formatDKK(tx.amount)}
                          </p>
                          <p className="text-[9px]" style={{ color: C.textLight }}>{tx.time} siden</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── DETAIL ── */}
            {screen === "detail" && (() => {
              const tc = TYPE_ICON_COLORS[selectedTx.type] || TYPE_ICON_COLORS.P2P;
              const isIn = selectedTx.direction === "incoming";
              return (
                <>
                  <NavHeader title="Transaktion" onBack={() => navigate("home")} />
                  <div className="flex-1 overflow-y-auto">
                    {/* Hero */}
                    <div className="flex flex-col items-center py-5 border-b" style={{ backgroundColor: C.surface, borderColor: C.borderLight }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: tc.bg }}>
                        <span className="text-[22px]" style={{ color: tc.color }}>{selectedTx.icon}</span>
                      </div>
                      <p className="mt-2 text-[28px] font-extrabold" style={{ color: isIn ? C.success : C.text }}>
                        {isIn ? "+" : "-"}{formatDKK(selectedTx.amount)}
                      </p>
                      <p className="text-[12px] font-medium" style={{ color: C.textSec }}>{selectedTx.typeLabel}</p>
                      <div className="mt-2 flex items-center gap-1.5 rounded-full px-3 py-1" style={{ backgroundColor: "#e8faf0" }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.success }} />
                        <span className="text-[11px] font-semibold" style={{ color: C.success }}>Gennemført</span>
                      </div>
                    </div>

                    {/* Details card */}
                    <div className="mx-4 mt-3 rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.borderLight }}>
                      {[
                        { icon: "👤", label: isIn ? "Fra" : "Til", value: selectedTx.name },
                        { icon: "📅", label: "Dato", value: "6. april 2026" },
                        { icon: "🕐", label: "Tidspunkt", value: "14:32:05" },
                        { icon: "🏷", label: "Type", value: selectedTx.typeLabel },
                        { icon: "📄", label: "Reference", value: `PW-${selectedTx.id.padStart(6, "0")}`, mono: true },
                        ...(selectedTx.desc ? [{ icon: "💬", label: "Besked", value: selectedTx.desc }] : []),
                      ].map((row, i, arr) => (
                        <div key={row.label}>
                          <div className="flex items-center justify-between px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px]">{row.icon}</span>
                              <span className="text-[12px] font-medium" style={{ color: C.textSec }}>{row.label}</span>
                            </div>
                            <span className={`text-[12px] font-semibold text-right ${"mono" in row ? "font-mono tracking-wide text-[11px]" : ""}`} style={{ color: C.text }}>{row.value}</span>
                          </div>
                          {i < arr.length - 1 && <div className="h-px ml-9" style={{ backgroundColor: C.borderLight }} />}
                        </div>
                      ))}
                    </div>

                    {/* Share button */}
                    <div className="px-4 mt-4 pb-4">
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl border py-3" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <span className="text-[13px]">📤</span>
                        <span className="text-[13px] font-semibold" style={{ color: C.primary }}>Del kvittering</span>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] font-medium animate-pulse" style={{ color: "rgba(10,47,91,0.25)" }}>
        {l === "fo" ? "↑ Trýst fyri at royna ↑" : l === "da" ? "↑ Klik for at prøve ↑" : "↑ Click to try ↑"}
      </p>
    </div>
  );
}
