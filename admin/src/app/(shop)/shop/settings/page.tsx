"use client";

import { useState } from "react";
import { Store, MapPin, Phone, Mail, CreditCard, QrCode, Save, Copy, Check } from "lucide-react";
import t from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

export default function ShopSettingsPage() {
  const { locale: l } = useLocale();
  const s = t.shop.settings;
  const [copied, setCopied] = useState(false);
  const merchantId = "MERCH-NLS-0042";

  const copyId = () => {
    navigator.clipboard.writeText(merchantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">{s.title[l]}</h1>
        <p className="mt-1 text-[14px] text-[#0a2f5b]/35">{s.subtitle[l]}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-[15px] font-bold text-[#0a2f5b]">
              <Store className="h-4 w-4 text-[#0a2f5b]/40" />
              {s.storeInfo[l]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.storeName[l]}</label>
                <input type="text" defaultValue="Café Nólsoy" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.category[l]}</label>
                <input type="text" defaultValue="Café & Restaurant" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                  <MapPin className="mb-0.5 inline h-3 w-3" /> {s.address[l]}
                </label>
                <input type="text" defaultValue="Niels Finsens gøta 12, 100 Tórshavn" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                  <Phone className="mb-0.5 inline h-3 w-3" /> {s.phone[l]}
                </label>
                <input type="text" defaultValue="+298 312 456" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">
                  <Mail className="mb-0.5 inline h-3 w-3" /> {s.email[l]}
                </label>
                <input type="text" defaultValue="info@cafenolsoy.fo" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0a2f5b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-[#0a2f5b]/15 transition-all hover:shadow-lg hover:shadow-[#0a2f5b]/25">
              <Save className="h-4 w-4" />
              {s.saveChanges[l]}
            </button>
          </div>

          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-[15px] font-bold text-[#0a2f5b]">
              <CreditCard className="h-4 w-4 text-[#0a2f5b]/40" />
              {s.payoutAccount[l]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.bankName[l]}</label>
                <input type="text" defaultValue="Betri Banki" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/25">{s.accountNumber[l]}</label>
                <input type="text" defaultValue="•••• •••• •••• 4821" className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-[#fafcfe] px-4 py-2.5 text-[14px] text-[#0a2f5b] outline-none transition-all focus:border-[#2ec964]/40 focus:ring-2 focus:ring-[#2ec964]/10" />
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#2ec964]/[0.05] p-3">
              <p className="text-[12px] text-[#1a8a45]">{s.payoutInfo[l]}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-4 text-[15px] font-bold text-[#0a2f5b]">Merchant ID</h2>
            <div className="flex items-center gap-2 rounded-xl bg-[#fafcfe] border border-[#0a2f5b]/[0.05] px-4 py-3">
              <code className="flex-1 text-[13px] font-mono font-semibold text-[#0a2f5b]">{merchantId}</code>
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
              <button className="mt-4 w-full rounded-xl border border-[#0a2f5b]/[0.08] py-2.5 text-[13px] font-semibold text-[#0a2f5b] transition-all hover:bg-[#0a2f5b]/[0.03]">
                {s.downloadQR[l]}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-6">
            <h2 className="mb-3 text-[15px] font-bold text-[#0a2f5b]">{s.yourFee[l]}</h2>
            <p className="text-[32px] font-extrabold text-[#0a2f5b]">1,5%</p>
            <p className="text-[12px] text-[#0a2f5b]/30">{s.perTx[l]}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#0a2f5b]/40">{s.minFee[l]}</span>
                <span className="font-semibold text-[#0a2f5b]">0,50 kr.</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#0a2f5b]/40">{s.maxFee[l]}</span>
                <span className="font-semibold text-[#0a2f5b]">50,00 kr.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
