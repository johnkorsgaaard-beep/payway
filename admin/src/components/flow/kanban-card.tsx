"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CheckSquare } from "lucide-react";
import type { Card } from "@/lib/flow-store";

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkedCount = card.checklist.filter((c) => c.checked).length;
  const totalCount = card.checklist.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-pointer rounded-xl border border-[#0a2f5b]/[0.06] bg-white shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "z-50 opacity-50 shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      {card.color && (
        <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: card.color }} />
      )}
      <div className="flex items-start gap-1 p-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-[#0a2f5b]/20 opacity-0 transition-opacity hover:text-[#0a2f5b]/40 group-hover:opacity-100 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#0a2f5b]">{card.title}</p>
          {card.description && (
            <p className="mt-0.5 truncate text-xs text-[#0a2f5b]/30">{card.description}</p>
          )}
          {totalCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <CheckSquare className={`h-3.5 w-3.5 ${checkedCount === totalCount ? "text-[#2ec964]" : "text-[#0a2f5b]/30"}`} />
              <span className={`text-xs font-medium ${checkedCount === totalCount ? "text-[#2ec964]" : "text-[#0a2f5b]/30"}`}>
                {checkedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
