"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Store, Plus, X, Loader2, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  description: string;
  slug: string;
  phone: string;
  email: string;
  fee_rate: number;
  plan: string;
  onboarding_status: string;
  is_active: boolean;
  created_at: string;
  owner: { full_name: string; phone: string; email: string } | null;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  suspended: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv",
  pending: "Afventer",
  suspended: "Suspenderet",
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchants");
      const data = await res.json();
      setMerchants(data.merchants || []);
    } catch {
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const updateMerchant = async (id: string, updates: Record<string, unknown>) => {
    await fetch(`/api/merchants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchMerchants();
  };

  const deleteMerchant = async (m: Merchant) => {
    if (!confirm(`Er du sikker på du vil slette "${m.name}"?\n\nDette sletter også ejerens brugerkonto.`)) return;
    await fetch(`/api/merchants/${m.id}`, { method: "DELETE" });
    fetchMerchants();
  };

  const updateFee = async (id: string, currentFee: number) => {
    const input = prompt("Ny gebyr i basispunkter (250 = 2.5%):", currentFee.toString());
    if (!input) return;
    const fee = parseInt(input);
    if (isNaN(fee) || fee < 0 || fee > 10000) return;
    updateMerchant(id, { fee_rate: fee });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2f5b]">Butikker</h1>
          <p className="text-[#0a2f5b]/40">Administrer tilsluttede butikker og deres gebyrer</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Opret butik
        </Button>
      </div>

      {showCreate && (
        <CreateMerchantModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchMerchants(); }}
        />
      )}

      {editing && (
        <EditMerchantModal
          merchant={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchMerchants(); }}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[#2ec964]" />
            <CardTitle>Alle butikker ({merchants.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
            </div>
          ) : merchants.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-[#0a2f5b]/30">
              <Store className="mb-3 h-10 w-10" />
              <p className="text-[14px] font-medium">Ingen butikker endnu</p>
              <p className="text-[12px]">Opret den første butik med knappen ovenfor</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Butik</TableHeaderCell>
                  <TableHeaderCell>Ejer</TableHeaderCell>
                  <TableHeaderCell>Gebyr</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Oprettet</TableHeaderCell>
                  <TableHeaderCell>Handlinger</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {merchants.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium text-[#0a2f5b]">{m.name}</span>
                        {m.description && (
                          <p className="text-xs text-[#0a2f5b]/30">{m.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-[13px] text-[#0a2f5b]">{m.owner?.full_name || "—"}</span>
                        <p className="text-[11px] text-[#0a2f5b]/30">{m.owner?.email || m.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => updateFee(m.id, m.fee_rate)}
                        className="cursor-pointer rounded-lg bg-[#0a2f5b]/[0.04] px-2 py-0.5 font-mono text-sm text-[#0a2f5b] hover:bg-[#0a2f5b]/[0.08]"
                      >
                        {(m.fee_rate / 100).toFixed(1)}%
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{m.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[m.onboarding_status] || "default"}>
                        {STATUS_LABELS[m.onboarding_status] || m.onboarding_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#0a2f5b]/35">{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditing(m)}
                          className="rounded-lg p-1.5 text-[#0a2f5b]/30 transition-colors hover:bg-[#0a2f5b]/[0.05] hover:text-[#0a2f5b]"
                          title="Rediger"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {m.onboarding_status !== "active" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateMerchant(m.id, { onboarding_status: "active", is_active: true })}
                          >
                            Godkend
                          </Button>
                        )}
                        {m.onboarding_status === "active" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateMerchant(m.id, { onboarding_status: "suspended", is_active: false })}
                          >
                            Suspender
                          </Button>
                        )}
                        <button
                          onClick={() => deleteMerchant(m)}
                          className="rounded-lg p-1.5 text-[#0a2f5b]/20 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Slet"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateMerchantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    fee_rate: 250,
    plan: "free" as string,
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
  });

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl ved oprettelse");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-[#0a2f5b]/30 hover:bg-[#0a2f5b]/[0.05] hover:text-[#0a2f5b]">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-bold text-[#0a2f5b]">Opret ny butik</h2>
        <p className="mb-6 text-[13px] text-[#0a2f5b]/40">Udfyld info om butikken og dens ejer</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/30">Butik info</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Butiksnavn *" value={form.name} onChange={(v) => set("name", v)} required />
              <Input label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
            </div>
            <Input label="Beskrivelse" value={form.description} onChange={(v) => set("description", v)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Adresse" value={form.address} onChange={(v) => set("address", v)} />
              <Input label="By" value={form.city} onChange={(v) => set("city", v)} />
              <Input label="Postnr." value={form.postal_code} onChange={(v) => set("postal_code", v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">Gebyr (basispunkter)</label>
                <input
                  type="number"
                  value={form.fee_rate}
                  onChange={(e) => set("fee_rate", parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
                />
                <p className="mt-1 text-[11px] text-[#0a2f5b]/25">250 = 2,5%</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => set("plan", e.target.value)}
                  className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
                >
                  <option value="free">Free</option>
                  <option value="store">Store</option>
                  <option value="platform">Platform</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#0a2f5b]/30">Ejer / Login</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Fulde navn *" value={form.ownerName} onChange={(v) => set("ownerName", v)} required />
              <Input label="Telefon" value={form.ownerPhone} onChange={(v) => set("ownerPhone", v)} />
            </div>
            <Input label="E-mail *" value={form.ownerEmail} onChange={(v) => set("ownerEmail", v)} type="email" required />
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">Adgangskode *</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 pr-10 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a2f5b]/20 hover:text-[#0a2f5b]/40">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Annuller</Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opretter...</> : "Opret butik"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMerchantModal({ merchant, onClose, onSaved }: { merchant: Merchant; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: merchant.name,
    description: merchant.description,
    address: "",
    city: "",
    postal_code: "",
    phone: merchant.phone || "",
    email: merchant.email || "",
    fee_rate: merchant.fee_rate,
    plan: merchant.plan,
  });

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/merchants/${merchant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl ved opdatering");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-[#0a2f5b]/30 hover:bg-[#0a2f5b]/[0.05] hover:text-[#0a2f5b]">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-bold text-[#0a2f5b]">Rediger butik</h2>
        <p className="mb-6 text-[13px] text-[#0a2f5b]/40">{merchant.name}</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Butiksnavn" value={form.name} onChange={(v) => set("name", v)} required />
            <Input label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
          </div>
          <Input label="Beskrivelse" value={form.description} onChange={(v) => set("description", v)} />
          <Input label="E-mail" value={form.email} onChange={(v) => set("email", v)} type="email" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">Gebyr (basispunkter)</label>
              <input
                type="number"
                value={form.fee_rate}
                onChange={(e) => set("fee_rate", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
              />
              <p className="mt-1 text-[11px] text-[#0a2f5b]/25">250 = 2,5%</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => set("plan", e.target.value)}
                className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
              >
                <option value="free">Free</option>
                <option value="store">Store</option>
                <option value="platform">Platform</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Annuller</Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gemmer...</> : "Gem ændringer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3 py-2.5 text-[14px] text-[#0a2f5b] outline-none focus:border-[#2ec964]/40"
      />
    </div>
  );
}
