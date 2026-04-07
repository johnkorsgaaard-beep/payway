"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDKK } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  Settings, Save, Store, ArrowLeftRight, CreditCard, Wallet,
  Landmark, TrendingUp, AlertTriangle, CheckCircle2, Info,
} from "lucide-react";

interface FeeConfig {
  id: string;
  name: string;
  percentage: number;
  fixedAmount: number;
  isActive: boolean;
}

const FEE_LABELS: Record<string, { title: string; description: string }> = {
  topup_fee: {
    title: "Optankningsgebyr",
    description: "Gebyr når brugere fylder op via betalingskort",
  },
  p2p_fee: {
    title: "P2P-gebyr",
    description: "Gebyr for person-til-person overførsler (efter gratis grænse)",
  },
  merchant_fee: {
    title: "Butiksgebyr",
    description: "Standardgebyr for butiksbetalinger",
  },
  withdrawal_fee: {
    title: "Udbetalingsgebyr",
    description: "Gebyr for udbetaling til bankkonto",
  },
};

/* ─── Fee model reference data ─── */

const MERCHANT_EXAMPLES = [
  { amount: 100, stripe: 2.25, fee: 2.5, profit: 0.25 },
  { amount: 200, stripe: 2.50, fee: 5.0, profit: 2.50 },
  { amount: 500, stripe: 3.25, fee: 12.5, profit: 9.25 },
  { amount: 1000, stripe: 4.50, fee: 25.0, profit: 20.50 },
  { amount: 2000, stripe: 7.00, fee: 50.0, profit: 43.00 },
];

const TOPUP_CARD_EXAMPLES = [
  { amount: 100, stripe: 3.25, fee: 2.0, profit: -1.25 },
  { amount: 200, stripe: 4.70, fee: 4.0, profit: -0.70 },
  { amount: 327, stripe: 6.54, fee: 6.54, profit: 0 },
  { amount: 500, stripe: 9.05, fee: 10.0, profit: 0.95 },
  { amount: 1000, stripe: 16.30, fee: 20.0, profit: 3.70 },
];

const PAYOUT_EXAMPLES = [
  { amount: 500, stripe: 3.25, fee: 0, profit: -3.25, note: "1. gratis/md" },
  { amount: 500, stripe: 3.25, fee: 5.0, profit: 1.75, note: "Derefter" },
  { amount: 1000, stripe: 4.50, fee: 5.0, profit: 0.50, note: "Derefter" },
  { amount: 2000, stripe: 7.00, fee: 5.0, profit: -2.00, note: "Derefter" },
];

export default function FeesPage() {
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [editing, setEditing] = useState<Record<string, { percentage: string; fixedAmount: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<FeeConfig[]>("/admin/fees")
      .then(setFees)
      .catch(() => {
        setFees([
          { id: "f1", name: "topup_fee", percentage: 2.0, fixedAmount: 0, isActive: true },
          { id: "f2", name: "p2p_fee", percentage: 0.0, fixedAmount: 0, isActive: true },
          { id: "f3", name: "merchant_fee", percentage: 2.5, fixedAmount: 0, isActive: true },
          { id: "f4", name: "withdrawal_fee", percentage: 0.0, fixedAmount: 500, isActive: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const startEditing = (fee: FeeConfig) => {
    setEditing((prev) => ({
      ...prev,
      [fee.id]: {
        percentage: fee.percentage.toString(),
        fixedAmount: fee.fixedAmount.toString(),
      },
    }));
  };

  const saveFee = async (feeId: string) => {
    const edit = editing[feeId];
    if (!edit) return;

    setSaving(feeId);
    try {
      await api.put(`/admin/fees/${feeId}`, {
        percentage: parseFloat(edit.percentage),
        fixedAmount: parseInt(edit.fixedAmount) || 0,
      });
      setFees((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? { ...f, percentage: parseFloat(edit.percentage), fixedAmount: parseInt(edit.fixedAmount) || 0 }
            : f
        )
      );
    } catch {
      setFees((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? { ...f, percentage: parseFloat(edit.percentage), fixedAmount: parseInt(edit.fixedAmount) || 0 }
            : f
        )
      );
    }
    setEditing((prev) => {
      const next = { ...prev };
      delete next[feeId];
      return next;
    });
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">Gebyrer</h1>
        <p className="text-[#0a2f5b]/40">Gebyrstruktur, Stripe-costs og profit/tab oversigt</p>
      </div>

      {/* ─── Quick summary cards ─── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0a2f5b]/40">Butik</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight text-[#2ec964]">2,5%</p>
              <p className="mt-1 text-[13px] text-[#0a2f5b]/35">Butikken betaler. Altid profit.</p>
            </div>
            <div className="rounded-xl bg-[#2ec964]/[0.08] p-3"><Store className="h-6 w-6 text-[#2ec964]" /></div>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0a2f5b]/40">P2P</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight text-[#0a2f5b]">Gratis</p>
              <p className="mt-1 text-[13px] text-[#0a2f5b]/35">Wallet → wallet. Cost: 0 kr.</p>
            </div>
            <div className="rounded-xl bg-[#0a2f5b]/[0.04] p-3"><ArrowLeftRight className="h-6 w-6 text-[#0a2f5b]/50" /></div>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0a2f5b]/40">Top-up (bank)</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight text-[#0a2f5b]">0,50 kr</p>
              <p className="mt-1 text-[13px] text-[#0a2f5b]/35">Bagt ind. Usynligt for bruger.</p>
            </div>
            <div className="rounded-xl bg-[#0a2f5b]/[0.04] p-3"><Landmark className="h-6 w-6 text-[#0a2f5b]/50" /></div>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0a2f5b]/40">Top-up (kort)</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight text-[#f59e0b]">2%</p>
              <p className="mt-1 text-[13px] text-[#0a2f5b]/35">Kunden betaler. BE: 327 kr.</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3"><CreditCard className="h-6 w-6 text-[#f59e0b]" /></div>
          </div>
        </Card>
      </div>

      {/* ─── BUTIK MODEL ─── */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2ec964]/10">
              <Store className="h-5 w-5 text-[#2ec964]" />
            </div>
            <div>
              <CardTitle>Butiksbetalinger</CardTitle>
              <CardDescription>Kunde betaler i butik via QR. Butikken betaler 2,5%. Stripe payout: 0,25% + 2 kr.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.06] text-left text-xs uppercase text-[#0a2f5b]/30">
                  <th className="px-4 py-3">Beløb</th>
                  <th className="px-4 py-3 text-right">Stripe cost</th>
                  <th className="px-4 py-3 text-right">Vi opkræver (2,5%)</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.04]">
                {MERCHANT_EXAMPLES.map((row) => (
                  <tr key={row.amount} className="hover:bg-[#0a2f5b]/[0.02]">
                    <td className="px-4 py-3 font-medium text-[#0a2f5b]">{row.amount} kr</td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.stripe.toFixed(2)} kr</td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.fee.toFixed(2)} kr</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#2ec964]">+{row.profit.toFixed(2)} kr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#2ec964]/[0.06] px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ec964]" />
            <p className="text-[13px] text-[#1a8a45]">Break-even: ~90 kr. Alt over giver profit. Butikken betaler altid.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── P2P MODEL ─── */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2f5b]/[0.06]">
              <ArrowLeftRight className="h-5 w-5 text-[#0a2f5b]/60" />
            </div>
            <div>
              <CardTitle>P2P-overførsler</CardTitle>
              <CardDescription>Wallet → wallet. Intern databaseflytning. Ingen tredjeparter involveret.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-xl bg-[#2ec964]/[0.06] px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ec964]" />
            <p className="text-[13px] text-[#1a8a45]">Altid gratis. Cost: 0 kr. Ingen Stripe, ingen bank. Vores vækstmotor — holder penge i systemet.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── TOP-UP BANK ─── */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2f5b]/[0.06]">
              <Landmark className="h-5 w-5 text-[#0a2f5b]/60" />
            </div>
            <div>
              <CardTitle>Top-up via bank (Open Banking)</CardTitle>
              <CardDescription>Bruger kobler bank → godkender med Face ID → penge i wallet. Cost: ~0,50 kr fast.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#0a2f5b]/[0.03] px-4 py-3">
              <Info className="h-4 w-4 shrink-0 text-[#0a2f5b]/40" />
              <p className="text-[13px] text-[#0a2f5b]/60">Bruger fylder op 500 kr → vi trækker 500,50 kr fra bank → viser 500 kr i wallet. De 0,50 kr er bagt ind og usynligt. Nævnt i vilkår.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#2ec964]/[0.06] px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ec964]" />
              <p className="text-[13px] text-[#1a8a45]">Cost for os: 0 kr. Uanset beløb. Altid dækket.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── TOP-UP KORT ─── */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <CreditCard className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div>
              <CardTitle>Top-up via kort (Stripe)</CardTitle>
              <CardDescription>Kunden betaler 2% gebyr. Stripe tager 1,45% + 1,80 kr. Break-even: 327 kr.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.06] text-left text-xs uppercase text-[#0a2f5b]/30">
                  <th className="px-4 py-3">Beløb</th>
                  <th className="px-4 py-3 text-right">Stripe cost</th>
                  <th className="px-4 py-3 text-right">Kunde betaler (2%)</th>
                  <th className="px-4 py-3 text-right">Profit/Tab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.04]">
                {TOPUP_CARD_EXAMPLES.map((row) => (
                  <tr key={row.amount} className="hover:bg-[#0a2f5b]/[0.02]">
                    <td className="px-4 py-3 font-medium text-[#0a2f5b]">
                      {row.amount} kr
                      {row.profit === 0 && <Badge variant="warning" className="ml-2">Break-even</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.stripe.toFixed(2)} kr</td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.fee.toFixed(2)} kr</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.profit >= 0 ? "text-[#2ec964]" : "text-red-500"}`}>
                      {row.profit >= 0 ? "+" : ""}{row.profit.toFixed(2)} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#f59e0b]" />
            <p className="text-[13px] text-amber-700">Under 327 kr taber vi penge. Men de fleste vælger gratis bankoverførsel, så kort-topup er sjælden.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── PAYOUT ─── */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2f5b]/[0.06]">
              <Wallet className="h-5 w-5 text-[#0a2f5b]/60" />
            </div>
            <div>
              <CardTitle>Payout (wallet → bank)</CardTitle>
              <CardDescription>1. udbetaling pr. måned gratis. Derefter 5 kr. Stripe: 0,25% + 2 kr.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.06] text-left text-xs uppercase text-[#0a2f5b]/30">
                  <th className="px-4 py-3">Beløb</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Stripe cost</th>
                  <th className="px-4 py-3 text-right">Vi opkræver</th>
                  <th className="px-4 py-3 text-right">Profit/Tab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.04]">
                {PAYOUT_EXAMPLES.map((row, i) => (
                  <tr key={i} className="hover:bg-[#0a2f5b]/[0.02]">
                    <td className="px-4 py-3 font-medium text-[#0a2f5b]">{row.amount} kr</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.fee === 0 ? "info" : "default"}>{row.note}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.stripe.toFixed(2)} kr</td>
                    <td className="px-4 py-3 text-right text-[#0a2f5b]/50">{row.fee.toFixed(2)} kr</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.profit >= 0 ? "text-[#2ec964]" : "text-red-500"}`}>
                      {row.profit >= 0 ? "+" : ""}{row.profit.toFixed(2)} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#0a2f5b]/[0.03] px-4 py-3">
            <Info className="h-4 w-4 shrink-0 text-[#0a2f5b]/40" />
            <p className="text-[13px] text-[#0a2f5b]/60">Jo færre der udbetaler, jo bedre. Fokus: gør wallet-balancen nyttig nok til at folk sjældent udbetaler.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── FULL SUMMARY ─── */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2f5b]">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Samlet oversigt</CardTitle>
              <CardDescription>Koster PayWay penge? Hvem betaler?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.06] text-left text-xs uppercase text-[#0a2f5b]/30">
                  <th className="px-4 py-3">Kanal</th>
                  <th className="px-4 py-3">Koster os penge?</th>
                  <th className="px-4 py-3">Hvem betaler?</th>
                  <th className="px-4 py-3">Beløbsafhængig?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.04]">
                <tr className="hover:bg-[#0a2f5b]/[0.02]">
                  <td className="px-4 py-3 font-medium text-[#0a2f5b]">Butiksbetaling</td>
                  <td className="px-4 py-3"><Badge variant="success">Nej — profit</Badge></td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Butikken (2,5%)</td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Ja — jo højere, jo mere profit</td>
                </tr>
                <tr className="hover:bg-[#0a2f5b]/[0.02]">
                  <td className="px-4 py-3 font-medium text-[#0a2f5b]">P2P</td>
                  <td className="px-4 py-3"><Badge variant="success">Nej — gratis</Badge></td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Ingen</td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Nej</td>
                </tr>
                <tr className="hover:bg-[#0a2f5b]/[0.02]">
                  <td className="px-4 py-3 font-medium text-[#0a2f5b]">Top-up (bank)</td>
                  <td className="px-4 py-3"><Badge variant="success">Nej — dækket</Badge></td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Bagt ind (0,50 kr usynligt)</td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Nej — fast pris</td>
                </tr>
                <tr className="hover:bg-[#0a2f5b]/[0.02]">
                  <td className="px-4 py-3 font-medium text-[#0a2f5b]">Top-up (kort)</td>
                  <td className="px-4 py-3"><Badge variant="warning">Under 327 kr</Badge></td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Kunden (2%)</td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Ja — BE: 327 kr</td>
                </tr>
                <tr className="hover:bg-[#0a2f5b]/[0.02]">
                  <td className="px-4 py-3 font-medium text-[#0a2f5b]">Payout</td>
                  <td className="px-4 py-3"><Badge variant="warning">1. gratis/md</Badge></td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Brugeren (5 kr efter 1.)</td>
                  <td className="px-4 py-3 text-[#0a2f5b]/60">Ja</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Fee config cards (existing) ─── */}
      <h2 className="mb-4 text-lg font-bold text-[#0a2f5b]">Gebyr-konfiguration</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {fees.map((fee) => {
          const label = FEE_LABELS[fee.name] || { title: fee.name, description: "" };
          const isEditing = !!editing[fee.id];

          return (
            <Card key={fee.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-[#2ec964]" />
                    <div>
                      <CardTitle>{label.title}</CardTitle>
                      <CardDescription>{label.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={fee.isActive ? "success" : "default"}>
                    {fee.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0a2f5b]/50">
                        Procent (%)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editing[fee.id].percentage}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [fee.id]: { ...prev[fee.id], percentage: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2 text-lg font-semibold text-[#0a2f5b]"
                        />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-[#0a2f5b]">
                          {fee.percentage}%
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0a2f5b]/50">
                        Fast beløb
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editing[fee.id].fixedAmount}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [fee.id]: { ...prev[fee.id], fixedAmount: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2 text-lg font-semibold text-[#0a2f5b]"
                        />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-[#0a2f5b]">
                          {fee.fixedAmount > 0 ? formatDKK(fee.fixedAmount) : "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditing((prev) => {
                              const next = { ...prev };
                              delete next[fee.id];
                              return next;
                            })
                          }
                        >
                          Annuller
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveFee(fee.id)}
                          disabled={saving === fee.id}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Gem
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEditing(fee)}
                      >
                        Rediger
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
