"use client";

import { useState } from "react";
import { Store, MapPin, Phone, Mail, CreditCard, QrCode, Save, Copy, Check, Loader2 } from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useMerchant } from "@/lib/use-merchant";

export default function ShopSettingsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.settings;
  const { merchant, loading, refresh } = useMerchant();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2ec964]" />
      </div>
    );
  }

  if (!merchant) return null;

  const m = merchant as unknown as Record<string, string>;
  const val = (key: string) => form[key] ?? m[key] ?? "";

  const copyId = () => {
    navigator.clipboard.writeText(merchant.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (Object.keys(form).length === 0) return;
    setSaving(true);
    await fetch(`/api/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm({});
    refresh();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
        <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{merchant.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-[15px] font-bold text-[#0a2f5b]">
              <Store className="h-4 w-4 text-[#0a2f5b]/40" />
              {s.storeInfo[l]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={s.storeName[l]} value={val("name")} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label={s.category[l]} value={val("description")} onChange={(v) => setForm({ ...form, description: v })} />
              <div className="sm:col-span-2">
                <Field label={s.address[l]} value={val("address")} onChange={(v) => setForm({ ...form, address: v })} icon={<MapPin className="mb-0.5 inline h-3 w-3" />} />
              </div>
              <Field label={s.phone[l]} value={val("phone")} onChange={(v) => setForm({ ...form, phone: v })} icon={<Phone className="mb-0.5 inline h-3 w-3" />} />
              <Field label={s.email[l]} value={val("email")} onChange={(v) => setForm({ ...form, email: v })} icon={<Mail className="mb-0.5 inline h-3 w-3" />} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(form).length === 0}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0a2f5b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-[#0a2f5b]/15 transition-all hover:shadow-lg hover:shadow-[#0a2f5b]/25 disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {s.saveChanges[l]}
            </button>
          </div>

          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-[15px] font-bold text-[#0a2f5b]">
              <CreditCard className="h-4 w-4 text-[#0a2f5b]/40" />
              {s.payoutAccount[l]}
            </h2>
            <div className="rounded-xl bg-[#2ec964]/[0.05] p-4">
              <p className="text-[12px] text-[#1a8a45]">{s.payoutInfo[l]}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-4 text-[15px] font-bold text-[#0a2f5b]">Merchant ID</h2>
            <div className="flex items-center gap-2 rounded-xl bg-[#fafcfe] border border-[#0a2f5b]/[0.05] px-4 py-3">
              <code className="flex-1 text-[11px] font-mono font-semibold text-[#0a2f5b] break-all">{merchant.id}</code>
              <button onClick={copyId} className="rounded-lg p-1.5 text-[#0a2f5b]/30 transition-colors hover:bg-[#0a2f5b]/[0.05] hover:text-[#0a2f5b]">
                {copied ? <Check className="h-4 w-4 text-[#2ec964]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0a2f5b]">
              <QrCode className="h-4 w-4 text-[#0a2f5b]/40" />
              {s.storeQR[l]}
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-[#0a2f5b]/10 bg-[#fafcfe]">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`h-6 w-6 rounded-sm ${[0,1,2,4,5,6,10,12,14,18,20,21,22,24].includes(i) ? "bg-[#0a2f5b]" : "bg-[#0a2f5b]/[0.06]"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[12px] text-[#0a2f5b]/30 text-center">{s.qrDesc[l]}</p>
              <p className="mt-1 text-[11px] font-mono text-[#0a2f5b]/20">{merchant.id.slice(0, 12)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-3 text-[15px] font-bold text-[#0a2f5b]">{s.yourFee[l]}</h2>
            <p className="text-[32px] font-extrabold text-[#0a2f5b]">{(merchant.fee_rate / 100).toFixed(1)}%</p>
            <p className="text-[12px] text-[#0a2f5b]/30">{s.perTx[l]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
        {icon} {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10"
      />
    </div>
  );
}
