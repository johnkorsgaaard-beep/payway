"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Building2,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  Trash2,
} from "lucide-react";
import type { Pipeline, Deal } from "@/lib/crm-store";
import { createDeal } from "@/lib/crm-store";

interface ExtractedLead {
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  tags: string[];
  notes: string;
  estimatedValue: number;
  priority: "low" | "medium" | "high";
}

interface AiLeadModalProps {
  pipeline: Pipeline;
  onAddDeal: (stageId: string, deal: Deal) => void;
  onClose: () => void;
}

type Step = "input" | "loading" | "preview" | "error";

export function AiLeadModal({ pipeline, onAddDeal, onClose }: AiLeadModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<"image" | "text">("text");
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState(pipeline.stages[0]?.id ?? "");
  const [lead, setLead] = useState<ExtractedLead | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setMode("image");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExtract = async () => {
    setStep("loading");
    setError("");

    try {
      const body: Record<string, string> = {};
      if (mode === "image" && imageBase64) {
        body.image = imageBase64;
        if (textInput) body.text = textInput;
      } else if (textInput) {
        body.text = textInput;
      } else {
        setError("Angiv venligst et butiksnavn eller upload et billede.");
        setStep("input");
        return;
      }

      const res = await fetch("/api/crm/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Ukendt fejl");
      }

      setLead(data.lead as ExtractedLead);
      setStep("preview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Noget gik galt";
      setError(message);
      setStep("error");
    }
  };

  const handleConfirm = () => {
    if (!lead) return;
    const deal = createDeal({
      title: lead.title,
      company: lead.company,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      contactPhone: lead.contactPhone,
      tags: lead.tags,
      notes: lead.notes,
      value: lead.estimatedValue,
      priority: lead.priority,
    });
    onAddDeal(selectedStageId, deal);
    onClose();
  };

  const updateLead = (updates: Partial<ExtractedLead>) => {
    if (lead) setLead({ ...lead, ...updates });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 pt-12 backdrop-blur-sm">
      <div className="relative mx-4 mb-12 w-full max-w-lg rounded-2xl border border-[#0a2f5b]/[0.08] bg-white shadow-2xl shadow-[#0a2f5b]/[0.12]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0a2f5b]/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-lg shadow-[#8b5cf6]/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0a2f5b]">AI Lead Scanner</h2>
              <p className="text-[11px] text-[#0a2f5b]/35">Upload screenshot eller skriv butiksnavn</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#0a2f5b]/25 hover:bg-[#0a2f5b]/[0.04] hover:text-[#0a2f5b]/50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* ── Step: Input ── */}
          {step === "input" && (
            <div className="space-y-4">
              {/* Mode tabs */}
              <div className="flex gap-1.5 rounded-xl bg-[#0a2f5b]/[0.03] p-1">
                <button
                  onClick={() => setMode("text")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold transition-all ${
                    mode === "text"
                      ? "bg-white text-[#0a2f5b] shadow-sm"
                      : "text-[#0a2f5b]/35 hover:text-[#0a2f5b]/60"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Butiksnavn
                </button>
                <button
                  onClick={() => setMode("image")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold transition-all ${
                    mode === "image"
                      ? "bg-white text-[#0a2f5b] shadow-sm"
                      : "text-[#0a2f5b]/35 hover:text-[#0a2f5b]/60"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Screenshot
                </button>
              </div>

              {/* Text input */}
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (textInput.trim() || imageBase64)) handleExtract();
                }}
                placeholder={mode === "text" ? "Fx: Café Nólsoy, Tórshavn" : "Valgfri: tilføj kontekst til billedet..."}
                className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-4 py-3 text-[13px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20 focus:border-[#8b5cf6]/30 focus:shadow-sm focus:shadow-[#8b5cf6]/10"
              />

              {/* Image upload area */}
              {mode === "image" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFile(file);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                    isDragging
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/[0.04]"
                      : imagePreview
                        ? "border-[#2ec964]/30 bg-[#2ec964]/[0.02]"
                        : "border-[#0a2f5b]/[0.08] hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/[0.02]"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setImageBase64(null);
                        }}
                        className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white/80 hover:bg-black/70"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-[#2ec964] px-2 py-1">
                        <Check className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white">Billede klar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10">
                      <Upload className="h-8 w-8 text-[#0a2f5b]/15" />
                      <p className="text-[12px] font-medium text-[#0a2f5b]/30">
                        Træk et screenshot hertil eller klik for at uploade
                      </p>
                      <p className="text-[10px] text-[#0a2f5b]/20">
                        PNG, JPG — butiksfacade, visitkort, Google Maps, etc.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Stage selector */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                  Tilføj til kategori
                </label>
                <div className="relative">
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0a2f5b] outline-none focus:border-[#8b5cf6]/30"
                  >
                    {pipeline.stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/25" />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleExtract}
                disabled={!textInput.trim() && !imageBase64}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] py-3 text-[13px] font-semibold text-white shadow-lg shadow-[#8b5cf6]/20 transition-all hover:shadow-xl hover:shadow-[#8b5cf6]/30 disabled:opacity-40 disabled:shadow-none"
              >
                <Sparkles className="h-4 w-4" />
                Scan med AI
              </button>
            </div>
          )}

          {/* ── Step: Loading ── */}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6]" />
                <Sparkles className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[#8b5cf6]" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#0a2f5b]">AI analyserer...</p>
                <p className="mt-1 text-[12px] text-[#0a2f5b]/35">
                  {mode === "image" ? "Læser billede og udtrækker info" : "Finder information om butikken"}
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Error ── */}
          {step === "error" && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-[13px] font-semibold text-red-700">Noget gik galt</p>
                  <p className="mt-0.5 text-[12px] text-red-600/70">{error}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("input")}
                  className="flex-1 rounded-xl border border-[#0a2f5b]/[0.08] py-2.5 text-[13px] font-medium text-[#0a2f5b]/60 hover:bg-[#0a2f5b]/[0.03]"
                >
                  Prøv igen
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-[#0a2f5b]/[0.05] py-2.5 text-[13px] font-medium text-[#0a2f5b]/60 hover:bg-[#0a2f5b]/[0.08]"
                >
                  Luk
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Preview ── */}
          {step === "preview" && lead && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-[#2ec964]/10 px-3 py-2">
                <Check className="h-4 w-4 text-[#2ec964]" />
                <span className="text-[12px] font-semibold text-[#1a8a45]">
                  AI har fundet følgende — ret til inden du tilføjer
                </span>
              </div>

              <div className="space-y-3">
                <PreviewField label="Deal titel" value={lead.title} onChange={(v) => updateLead({ title: v })} />
                <PreviewField label="Firma" value={lead.company} onChange={(v) => updateLead({ company: v })} />
                <PreviewField label="Kontaktperson" value={lead.contactName} onChange={(v) => updateLead({ contactName: v })} />
                <PreviewField label="E-mail" value={lead.contactEmail} onChange={(v) => updateLead({ contactEmail: v })} />
                <PreviewField label="Telefon" value={lead.contactPhone} onChange={(v) => updateLead({ contactPhone: v })} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                      Estimeret værdi
                    </label>
                    <input
                      type="number"
                      value={lead.estimatedValue}
                      onChange={(e) => updateLead({ estimatedValue: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-2 text-[13px] text-[#0a2f5b] outline-none focus:border-[#8b5cf6]/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                      Prioritet
                    </label>
                    <select
                      value={lead.priority}
                      onChange={(e) => updateLead({ priority: e.target.value as Deal["priority"] })}
                      className="w-full appearance-none rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-2 text-[13px] text-[#0a2f5b] outline-none focus:border-[#8b5cf6]/30"
                    >
                      <option value="low">Lav</option>
                      <option value="medium">Medium</option>
                      <option value="high">Høj</option>
                    </select>
                  </div>
                </div>

                {lead.tags.length > 0 && (
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.tags.map((tag) => (
                        <span key={tag} className="rounded-lg bg-[#8b5cf6]/10 px-2 py-1 text-[11px] font-medium text-[#6d28d9]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lead.notes && (
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                      AI-notater
                    </label>
                    <textarea
                      value={lead.notes}
                      onChange={(e) => updateLead({ notes: e.target.value })}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-2 text-[12px] text-[#0a2f5b]/70 outline-none focus:border-[#8b5cf6]/30"
                    />
                  </div>
                )}

                {/* Stage selector */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
                    Tilføj til kategori
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStageId}
                      onChange={(e) => setSelectedStageId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-2 text-[13px] font-medium text-[#0a2f5b] outline-none focus:border-[#8b5cf6]/30"
                    >
                      {pipeline.stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/25" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep("input")}
                  className="flex-1 rounded-xl border border-[#0a2f5b]/[0.08] py-2.5 text-[13px] font-medium text-[#0a2f5b]/50 hover:bg-[#0a2f5b]/[0.03]"
                >
                  Tilbage
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2ec964] py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-[#2ec964]/20 hover:bg-[#25a854]"
                >
                  <Check className="h-4 w-4" />
                  Tilføj deal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0a2f5b]/25">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#0a2f5b]/[0.08] px-3 py-2 text-[13px] text-[#0a2f5b] outline-none focus:border-[#8b5cf6]/30"
        placeholder="—"
      />
    </div>
  );
}
