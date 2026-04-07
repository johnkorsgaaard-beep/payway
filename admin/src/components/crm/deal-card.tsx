"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  Calendar,
  GripVertical,
  Phone,
  TrendingUp,
} from "lucide-react";
import type { Deal } from "@/lib/crm-store";

const priorityDot: Record<string, string> = {
  low: "bg-[#94a3b8]",
  medium: "bg-[#f59e0b]",
  high: "bg-[#ef4444]",
};

function formatValue(v: number): string {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("da-DK");
}

function daysUntil(date: string): string {
  if (!date) return "";
  const diff = Math.ceil(
    (new Date(date).getTime() - Date.now()) / 86_400_000
  );
  if (diff < 0) return `${Math.abs(diff)}d siden`;
  if (diff === 0) return "I dag";
  return `${diff}d`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  stageColor: string;
}

export function DealCard({ deal, onClick, stageColor }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-pointer rounded-xl border bg-white p-3.5 shadow-sm transition-all hover:shadow-md ${
        isDragging
          ? "z-50 border-[#2ec964]/30 opacity-50 shadow-xl"
          : "border-[#0a2f5b]/[0.06] hover:border-[#0a2f5b]/[0.12]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 shrink-0 cursor-grab text-[#0a2f5b]/15 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[deal.priority]}`} />
            <p className="truncate text-[13px] font-semibold text-[#0a2f5b]">
              {deal.title}
            </p>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 shrink-0 text-[#0a2f5b]/25" />
            <span className="truncate text-[11px] text-[#0a2f5b]/40">
              {deal.company}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold text-[#0a2f5b]">
            {formatValue(deal.value)} kr.
          </span>
          <div className="flex items-center gap-0.5 rounded-full bg-[#2ec964]/10 px-1.5 py-0.5">
            <TrendingUp className="h-2.5 w-2.5 text-[#2ec964]" />
            <span className="text-[10px] font-bold text-[#1a8a45]">
              {deal.probability}%
            </span>
          </div>
        </div>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: stageColor }}
          title={deal.contactName}
        >
          {deal.contactName ? initials(deal.contactName) : "?"}
        </div>
      </div>

      {(deal.expectedClose || deal.contactPhone) && (
        <div className="mt-2.5 flex items-center gap-3 border-t border-[#0a2f5b]/[0.04] pt-2.5">
          {deal.expectedClose && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#0a2f5b]/20" />
              <span className="text-[10px] text-[#0a2f5b]/35">
                {daysUntil(deal.expectedClose)}
              </span>
            </div>
          )}
          {deal.contactPhone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-[#0a2f5b]/20" />
              <span className="text-[10px] text-[#0a2f5b]/35">
                {deal.contactPhone}
              </span>
            </div>
          )}
        </div>
      )}

      {deal.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {deal.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#0a2f5b]/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-[#0a2f5b]/40"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
