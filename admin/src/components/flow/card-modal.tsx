"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  AlignLeft,
  Tag,
  ListChecks,
} from "lucide-react";
import type { Card, CheckItem } from "@/lib/flow-store";
import { LABEL_COLORS } from "@/lib/flow-store";

interface CardModalProps {
  card: Card;
  onUpdate: (updates: Partial<Omit<Card, "id" | "createdAt">>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function CardModal({ card, onUpdate, onDelete, onClose }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [newCheckText, setNewCheckText] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const checkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== card.title) onUpdate({ title: trimmed });
    else setTitle(card.title);
  };

  const commitDescription = () => {
    if (description !== card.description) onUpdate({ description });
  };

  const toggleCheck = (checkId: string) => {
    onUpdate({
      checklist: card.checklist.map((c) =>
        c.id === checkId ? { ...c, checked: !c.checked } : c
      ),
    });
  };

  const removeCheck = (checkId: string) => {
    onUpdate({ checklist: card.checklist.filter((c) => c.id !== checkId) });
  };

  const addCheckItem = () => {
    const text = newCheckText.trim();
    if (!text) return;
    const item: CheckItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      checked: false,
    };
    onUpdate({ checklist: [...card.checklist, item] });
    setNewCheckText("");
    checkInputRef.current?.focus();
  };

  const checkedCount = card.checklist.filter((c) => c.checked).length;
  const totalCount = card.checklist.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-16 pb-16 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Color bar */}
        {card.color && (
          <div className="h-2 rounded-t-2xl" style={{ backgroundColor: card.color }} />
        )}

        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-0">
          <div className="flex-1">
            <input
              className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-300 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              placeholder="Kort titel..."
            />
            <p className="mt-1 text-xs text-gray-400">
              Oprettet {new Date(card.createdAt).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Color labels */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Tag className="h-4 w-4" />
              Farvelabel
            </div>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  className="h-8 w-12 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    outline: card.color === color ? "3px solid" : "none",
                    outlineColor: color,
                    outlineOffset: "2px",
                  }}
                  onClick={() => onUpdate({ color: card.color === color ? null : color })}
                />
              ))}
              {card.color && (
                <button
                  className="flex h-8 items-center rounded-lg border border-dashed border-gray-300 px-3 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-500 dark:border-gray-600"
                  onClick={() => onUpdate({ color: null })}
                >
                  Fjern
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <AlignLeft className="h-4 w-4" />
              Beskrivelse
            </div>
            <textarea
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-emerald-600 dark:focus:bg-gray-800"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commitDescription}
              placeholder="Tilføj en beskrivelse..."
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <ListChecks className="h-4 w-4" />
                Tjekliste
              </div>
              {totalCount > 0 && (
                <span className="text-xs text-gray-400">
                  {checkedCount}/{totalCount}
                </span>
              )}
            </div>

            {totalCount > 0 && (
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="space-y-1">
              {card.checklist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <button onClick={() => toggleCheck(item.id)} className="shrink-0">
                    {item.checked ? (
                      <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.checked
                        ? "text-gray-400 line-through"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeCheck(item.id)}
                    className="shrink-0 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                ref={checkInputRef}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-emerald-600"
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCheckItem();
                }}
                placeholder="Tilføj punkt..."
              />
              <button
                onClick={addCheckItem}
                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
              >
                <Plus className="h-3.5 w-3.5" />
                Tilføj
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            onClick={() => {
              if (window.confirm("Er du sikker på at du vil slette dette kort?")) {
                onDelete();
              }
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            Slet kort
          </button>
        </div>
      </div>
    </div>
  );
}
