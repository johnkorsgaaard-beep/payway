"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, MoreHorizontal, Trash2, Pencil, X } from "lucide-react";
import type { Column, Card } from "@/lib/flow-store";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onAddCard: (title: string) => void;
  onRenameColumn: (title: string) => void;
  onDeleteColumn: () => void;
  onCardClick: (cardId: string) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onRenameColumn,
  onDeleteColumn,
  onCardClick,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.title);

  const { setNodeRef: droppableRef } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });

  const {
    attributes,
    listeners,
    setNodeRef: sortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onAddCard(trimmed);
      setNewTitle("");
    }
    setIsAdding(false);
  };

  const handleRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(trimmed);
    } else {
      setRenameValue(column.title);
    }
    setIsRenaming(false);
  };

  return (
    <div
      ref={sortableRef}
      style={style}
      className={`flex w-72 shrink-0 flex-col rounded-2xl bg-[#0a2f5b]/[0.02] ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab rounded p-0.5 text-[#0a2f5b]/20 hover:text-[#0a2f5b]/40 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {isRenaming ? (
          <input
            className="flex-1 rounded-xl border border-[#2ec964]/30 bg-white px-2 py-1 text-sm font-semibold text-[#0a2f5b] outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setRenameValue(column.title);
                setIsRenaming(false);
              }
            }}
            autoFocus
          />
        ) : (
          <h3 className="flex-1 text-sm font-semibold text-[#0a2f5b]/70">
            {column.title}
          </h3>
        )}

        <span className="rounded-md bg-[#0a2f5b]/[0.08] px-1.5 py-0.5 text-xs font-medium text-[#0a2f5b]/40">
          {cards.length}
        </span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-xl p-1 text-[#0a2f5b]/30 transition-colors hover:bg-[#0a2f5b]/[0.06] hover:text-[#0a2f5b]/70"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-[#0a2f5b]/[0.06] bg-white py-1 shadow-lg">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#0a2f5b]/70 hover:bg-[#0a2f5b]/[0.02]"
                  onClick={() => {
                    setIsRenaming(true);
                    setRenameValue(column.title);
                    setShowMenu(false);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Omdøb
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  onClick={() => {
                    onDeleteColumn();
                    setShowMenu(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Slet kolonne
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards */}
      <div ref={droppableRef} className="flex-1 space-y-2 px-3 pb-2" style={{ minHeight: 40 }}>
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="px-3 pb-3">
        {isAdding ? (
          <div className="space-y-2">
            <textarea
              className="w-full resize-none rounded-xl border border-[#0a2f5b]/[0.06] bg-white p-3 text-sm outline-none placeholder:text-[#0a2f5b]/30 focus:border-[#2ec964]/30"
              rows={2}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") {
                  setNewTitle("");
                  setIsAdding(false);
                }
              }}
              placeholder="Kort titel..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="rounded-xl bg-[#25a854] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a8a45]"
              >
                Tilføj
              </button>
              <button
                onClick={() => {
                  setNewTitle("");
                  setIsAdding(false);
                }}
                className="rounded-xl p-1.5 text-[#0a2f5b]/30 hover:text-[#0a2f5b]/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-[#0a2f5b]/30 transition-colors hover:bg-[#0a2f5b]/[0.02] hover:text-[#0a2f5b]/70"
          >
            <Plus className="h-4 w-4" />
            Tilføj kort
          </button>
        )}
      </div>
    </div>
  );
}
