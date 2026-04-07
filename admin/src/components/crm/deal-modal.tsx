"use client";

import { useState } from "react";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  FileText,
  Clock,
  MessageSquare,
  Video,
  PhoneCall,
  StickyNote,
  Plus,
  Trash2,
  Flag,
} from "lucide-react";
import type { Deal, Activity } from "@/lib/crm-store";
import { createUid } from "@/lib/crm-store";

const ACTIVITY_ICONS: Record<string, typeof PhoneCall> = {
  call: PhoneCall,
  email: MessageSquare,
  meeting: Video,
  note: StickyNote,
};

const ACTIVITY_LABELS: Record<string, string> = {
  call: "Opkald",
  email: "E-mail",
  meeting: "Møde",
  note: "Note",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Lav",
  medium: "Medium",
  high: "Høj",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-[#94a3b8]/10 text-[#64748b]",
  medium: "bg-[#f59e0b]/10 text-[#d97706]",
  high: "bg-[#ef4444]/10 text-[#dc2626]",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DealModalProps {
  deal: Deal;
  stageName: string;
  stageColor: string;
  onUpdate: (updates: Partial<Omit<Deal, "id" | "createdAt">>) => void;
  onAddActivity: (activity: Activity) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function DealModal({
  deal,
  stageName,
  stageColor,
  onUpdate,
  onAddActivity,
  onDelete,
  onClose,
}: DealModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [newActivityType, setNewActivityType] = useState<Activity["type"]>("note");
  const [newActivityText, setNewActivityText] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const handleFieldSave = (field: string, value: string | number) => {
    onUpdate({ [field]: value });
    setEditingField(null);
  };

  const handleAddActivity = () => {
    if (!newActivityText.trim()) return;
    onAddActivity({
      id: createUid(),
      type: newActivityType,
      text: newActivityText.trim(),
      createdAt: new Date().toISOString(),
    });
    setNewActivityText("");
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !deal.tags.includes(tag)) {
      onUpdate({ tags: [...deal.tags, tag] });
    }
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 pt-12 backdrop-blur-sm">
      <div
        className="relative mx-4 mb-12 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-[#0a2f5b]/[0.08] bg-white shadow-2xl shadow-[#0a2f5b]/[0.12] duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#0a2f5b]/[0.06] p-6 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: stageColor }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: stageColor }}>
                {stageName}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-[#0a2f5b]">
              {deal.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#0a2f5b]/40">
              <Building2 className="h-3.5 w-3.5" />
              {deal.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#0a2f5b]/30 transition-colors hover:bg-[#0a2f5b]/[0.04] hover:text-[#0a2f5b]/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Value + Probability banner */}
        <div className="flex items-center gap-6 border-b border-[#0a2f5b]/[0.06] bg-[#f8fafc] px-6 py-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#2ec964]" />
            <span className="text-lg font-bold text-[#0a2f5b]">
              {deal.value.toLocaleString("da-DK")} kr.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#2ec964]" />
            <span className="text-sm font-semibold text-[#0a2f5b]/60">
              {deal.probability}% sandsynlighed
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#0a2f5b]/30">Vægtet:</span>
            <span className="text-sm font-bold text-[#2ec964]">
              {Math.round(deal.value * (deal.probability / 100)).toLocaleString("da-DK")} kr.
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#0a2f5b]/[0.06] px-6">
          {(["details", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#0a2f5b]"
                  : "text-[#0a2f5b]/35 hover:text-[#0a2f5b]/60"
              }`}
            >
              {tab === "details" ? "Detaljer" : "Aktivitet"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#2ec964]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto p-6">
          {activeTab === "details" ? (
            <div className="space-y-5">
              {/* Contact info */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Kontaktperson
                </p>
                <div className="space-y-2">
                  <EditableRow
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Navn"
                    value={deal.contactName}
                    editing={editingField === "contactName"}
                    onEdit={() => setEditingField("contactName")}
                    onSave={(v) => handleFieldSave("contactName", v)}
                    onCancel={() => setEditingField(null)}
                  />
                  <EditableRow
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="E-mail"
                    value={deal.contactEmail}
                    editing={editingField === "contactEmail"}
                    onEdit={() => setEditingField("contactEmail")}
                    onSave={(v) => handleFieldSave("contactEmail", v)}
                    onCancel={() => setEditingField(null)}
                  />
                  <EditableRow
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Telefon"
                    value={deal.contactPhone}
                    editing={editingField === "contactPhone"}
                    onEdit={() => setEditingField("contactPhone")}
                    onSave={(v) => handleFieldSave("contactPhone", v)}
                    onCancel={() => setEditingField(null)}
                  />
                </div>
              </div>

              {/* Deal details */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Handelsdetaljer
                </p>
                <div className="space-y-2">
                  <EditableRow
                    icon={<DollarSign className="h-3.5 w-3.5" />}
                    label="Værdi (kr.)"
                    value={String(deal.value)}
                    type="number"
                    editing={editingField === "value"}
                    onEdit={() => setEditingField("value")}
                    onSave={(v) => handleFieldSave("value", Number(v))}
                    onCancel={() => setEditingField(null)}
                  />
                  <EditableRow
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                    label="Sandsynlighed (%)"
                    value={String(deal.probability)}
                    type="number"
                    editing={editingField === "probability"}
                    onEdit={() => setEditingField("probability")}
                    onSave={(v) => handleFieldSave("probability", Math.min(100, Math.max(0, Number(v))))}
                    onCancel={() => setEditingField(null)}
                  />
                  <EditableRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Forventet lukket"
                    value={deal.expectedClose}
                    type="date"
                    editing={editingField === "expectedClose"}
                    onEdit={() => setEditingField("expectedClose")}
                    onSave={(v) => handleFieldSave("expectedClose", v)}
                    onCancel={() => setEditingField(null)}
                  />
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a2f5b]/[0.02] px-3 py-2.5">
                    <Flag className="h-3.5 w-3.5 text-[#0a2f5b]/25" />
                    <span className="text-[12px] text-[#0a2f5b]/40">Prioritet</span>
                    <div className="ml-auto flex gap-1.5">
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => onUpdate({ priority: p })}
                          className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                            deal.priority === p
                              ? PRIORITY_COLORS[p]
                              : "text-[#0a2f5b]/20 hover:text-[#0a2f5b]/40"
                          }`}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Tags
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {deal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="group flex items-center gap-1 rounded-lg bg-[#0a2f5b]/[0.05] px-2.5 py-1 text-[11px] font-medium text-[#0a2f5b]/50"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                      <button
                        onClick={() =>
                          onUpdate({ tags: deal.tags.filter((t) => t !== tag) })
                        }
                        className="ml-0.5 text-[#0a2f5b]/20 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTag();
                      }}
                      placeholder="Tilføj tag..."
                      className="w-20 rounded-lg border-0 bg-transparent px-1 py-1 text-[11px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Notater
                </p>
                <textarea
                  value={deal.notes}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#0a2f5b]/[0.06] bg-[#0a2f5b]/[0.01] px-3.5 py-2.5 text-[13px] text-[#0a2f5b] outline-none transition-colors placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/30"
                  placeholder="Skriv notater om denne deal..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add activity */}
              <div className="rounded-xl border border-[#0a2f5b]/[0.06] bg-[#f8fafc] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Ny aktivitet
                </p>
                <div className="mb-3 flex gap-1.5">
                  {(["call", "email", "meeting", "note"] as const).map(
                    (type) => {
                      const Icon = ACTIVITY_ICONS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setNewActivityType(type)}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                            newActivityType === type
                              ? "bg-[#2ec964]/10 text-[#1a8a45]"
                              : "text-[#0a2f5b]/30 hover:text-[#0a2f5b]/50"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {ACTIVITY_LABELS[type]}
                        </button>
                      );
                    }
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddActivity();
                    }}
                    placeholder="Beskriv aktiviteten..."
                    className="flex-1 rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-3.5 py-2 text-[13px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/30"
                  />
                  <button
                    onClick={handleAddActivity}
                    disabled={!newActivityText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-[#2ec964] px-4 py-2 text-[12px] font-semibold text-white shadow-sm shadow-[#2ec964]/20 transition-colors hover:bg-[#25a854] disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tilføj
                  </button>
                </div>
              </div>

              {/* Activity timeline */}
              <div className="relative">
                {deal.activities.length === 0 && (
                  <div className="py-8 text-center">
                    <Clock className="mx-auto h-8 w-8 text-[#0a2f5b]/10" />
                    <p className="mt-2 text-[13px] text-[#0a2f5b]/30">
                      Ingen aktivitet endnu
                    </p>
                  </div>
                )}
                {deal.activities.map((act, i) => {
                  const Icon = ACTIVITY_ICONS[act.type] ?? StickyNote;
                  return (
                    <div key={act.id} className="group relative flex gap-3 pb-4">
                      {i < deal.activities.length - 1 && (
                        <div className="absolute left-[13px] top-8 bottom-0 w-px bg-[#0a2f5b]/[0.06]" />
                      )}
                      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0a2f5b]/[0.04]">
                        <Icon className="h-3.5 w-3.5 text-[#0a2f5b]/40" />
                      </div>
                      <div className="flex-1 rounded-xl bg-[#0a2f5b]/[0.02] px-3.5 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#0a2f5b]/50">
                            {ACTIVITY_LABELS[act.type]}
                          </span>
                          <span className="text-[10px] text-[#0a2f5b]/25">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-[#0a2f5b]/70">
                          {act.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#0a2f5b]/[0.06] px-6 py-4">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Slet deal
          </button>
          <div className="flex items-center gap-2 text-[11px] text-[#0a2f5b]/25">
            <FileText className="h-3.5 w-3.5" />
            Oprettet {formatDate(deal.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Editable Row ── */
function EditableRow({
  icon,
  label,
  value,
  type = "text",
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  type?: string;
  editing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[#2ec964]/[0.04] px-3 py-2">
        <div className="text-[#2ec964]">{icon}</div>
        <span className="text-[12px] font-medium text-[#0a2f5b]/40">{label}</span>
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(draft);
            if (e.key === "Escape") onCancel();
          }}
          onBlur={() => onSave(draft)}
          className="ml-auto w-48 rounded-lg border border-[#2ec964]/30 bg-white px-2.5 py-1 text-right text-[13px] text-[#0a2f5b] outline-none"
        />
      </div>
    );
  }

  return (
    <button
      onClick={onEdit}
      className="flex w-full items-center gap-3 rounded-xl bg-[#0a2f5b]/[0.02] px-3 py-2.5 text-left transition-colors hover:bg-[#0a2f5b]/[0.04]"
    >
      <div className="text-[#0a2f5b]/25">{icon}</div>
      <span className="text-[12px] text-[#0a2f5b]/40">{label}</span>
      <span className="ml-auto text-[13px] font-medium text-[#0a2f5b]">
        {value || "—"}
      </span>
    </button>
  );
}
