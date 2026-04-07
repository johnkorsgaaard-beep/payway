"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import type { Pipeline, Deal, CrmState } from "@/lib/crm-store";
import {
  moveDeal,
  addDeal,
  createDeal,
  saveCrmState,
  renameStage,
  deleteStage,
} from "@/lib/crm-store";
import { DealCard } from "./deal-card";

interface PipelineBoardProps {
  pipeline: Pipeline;
  state: CrmState;
  setState: (s: CrmState) => void;
  onDealClick: (dealId: string) => void;
  searchQuery: string;
  priorityFilter: string;
}

function StageColumn({
  stage,
  deals,
  totalValue,
  stageCount,
  onDealClick,
  onAddDeal,
  onRename,
  onDelete,
}: {
  stage: Pipeline["stages"][number];
  deals: Deal[];
  totalValue: number;
  stageCount: number;
  onDealClick: (dealId: string) => void;
  onAddDeal: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage" },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(stage.title);

  const handleRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== stage.title) onRename(trimmed);
    setRenaming(false);
  };

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-2xl transition-colors ${
        isOver ? "bg-[#2ec964]/[0.04]" : "bg-[#0a2f5b]/[0.015]"
      }`}
    >
      {/* Stage header */}
      <div className="mx-2.5 mt-2.5 rounded-xl bg-[#0a2f5b] px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20"
            style={{ backgroundColor: stage.color }}
          />
          {renaming ? (
            <div className="flex flex-1 items-center gap-1.5">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
                className="flex-1 rounded-lg bg-white/10 px-2 py-0.5 text-[13px] font-bold text-white outline-none placeholder:text-white/30"
              />
              <button onClick={handleRename} className="text-[#2ec964] hover:text-[#25a854]">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setRenaming(false)} className="text-white/30 hover:text-white/60">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <h3 className="flex-1 text-[13px] font-bold text-white">
              {stage.title}
            </h3>
          )}
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-bold text-white/80">
            {deals.length}
          </span>

          {/* Stage menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-0.5 text-white/25 transition-colors hover:bg-white/10 hover:text-white/60"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-40 w-44 rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-1.5 shadow-xl shadow-[#0a2f5b]/[0.1]">
                  <button
                    onClick={() => {
                      setRenameValue(stage.title);
                      setRenaming(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-[#0a2f5b]/60 hover:bg-[#0a2f5b]/[0.03]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Omdøb kategori
                  </button>
                  {stageCount > 1 && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (window.confirm(`Slet "${stage.title}" og alle ${deals.length} deals i den?`)) {
                          onDelete();
                        }
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Slet kategori
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-1.5 text-[12px] font-bold text-white/50">
          {totalValue.toLocaleString("da-DK")} kr.
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-2.5 pt-2"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              stageColor={stage.color}
              onClick={() => onDealClick(deal.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add deal button */}
      <div className="px-2.5 pb-3">
        <button
          onClick={onAddDeal}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#0a2f5b]/[0.06] py-2 text-[12px] font-medium text-[#0a2f5b]/25 transition-all hover:border-[#2ec964]/30 hover:bg-[#2ec964]/[0.03] hover:text-[#2ec964]"
        >
          <Plus className="h-3.5 w-3.5" />
          Tilføj deal
        </button>
      </div>
    </div>
  );
}

export function PipelineBoard({
  pipeline,
  state,
  setState,
  onDealClick,
  searchQuery,
  priorityFilter,
}: PipelineBoardProps) {
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [addingToStage, setAddingToStage] = useState<string | null>(null);
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealCompany, setNewDealCompany] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const commit = useCallback(
    (next: CrmState) => {
      setState(next);
      saveCrmState(next);
    },
    [setState]
  );

  const findStageByDealId = (dealId: string): string | null => {
    for (const stage of pipeline.stages) {
      if (stage.dealIds.includes(dealId)) return stage.id;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "deal") {
      setActiveDealId(event.active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type !== "deal") return;

    const activeStageId = findStageByDealId(active.id as string);
    let overStageId: string | null = null;

    if (over.data.current?.type === "deal") {
      overStageId = findStageByDealId(over.id as string);
    } else if (over.data.current?.type === "stage") {
      overStageId = over.id as string;
    }

    if (!activeStageId || !overStageId || activeStageId === overStageId) return;

    const overStage = pipeline.stages.find((s) => s.id === overStageId);
    if (!overStage) return;

    let toIndex = overStage.dealIds.length;
    if (over.data.current?.type === "deal") {
      toIndex = overStage.dealIds.indexOf(over.id as string);
    }

    commit(
      moveDeal(state, pipeline.id, activeStageId, overStageId, active.id as string, toIndex)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDealId(null);

    if (!over) return;

    if (active.data.current?.type === "deal") {
      const activeStageId = findStageByDealId(active.id as string);
      if (!activeStageId) return;

      if (over.data.current?.type === "deal") {
        const overStageId = findStageByDealId(over.id as string);
        if (!overStageId) return;
        const overStage = pipeline.stages.find((s) => s.id === overStageId);
        if (!overStage) return;
        const toIndex = overStage.dealIds.indexOf(over.id as string);
        if (activeStageId === overStageId && active.id !== over.id) {
          commit(
            moveDeal(state, pipeline.id, activeStageId, overStageId, active.id as string, toIndex)
          );
        }
      }
    }
  };

  const handleAddDeal = (stageId: string) => {
    const title = newDealTitle.trim();
    const company = newDealCompany.trim();
    if (!title) return;
    const deal = createDeal({ title, company: company || title });
    commit(addDeal(state, pipeline.id, stageId, deal));
    setNewDealTitle("");
    setNewDealCompany("");
    setAddingToStage(null);
  };

  const activeDeal = activeDealId ? state.deals[activeDealId] : null;
  const q = searchQuery.toLowerCase();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto pb-4">
        {pipeline.stages.map((stage) => {
          const allDeals = stage.dealIds
            .map((id) => state.deals[id])
            .filter(Boolean);
          const filteredDeals = allDeals
            .filter((d) =>
              !q ||
              d.title.toLowerCase().includes(q) ||
              d.company.toLowerCase().includes(q) ||
              d.contactName.toLowerCase().includes(q) ||
              d.tags.some((t) => t.includes(q))
            )
            .filter((d) => priorityFilter === "all" || d.priority === priorityFilter);
          const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={stage.id} className="flex flex-col">
              <StageColumn
                stage={stage}
                deals={filteredDeals}
                totalValue={totalValue}
                stageCount={pipeline.stages.length}
                onDealClick={onDealClick}
                onAddDeal={() => setAddingToStage(stage.id)}
                onRename={(title) => commit(renameStage(state, pipeline.id, stage.id, title))}
                onDelete={() => commit(deleteStage(state, pipeline.id, stage.id))}
              />

              {addingToStage === stage.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="w-96 rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-6 shadow-2xl">
                    <h3 className="mb-4 text-[15px] font-bold text-[#0a2f5b]">
                      Ny deal i &quot;{stage.title}&quot;
                    </h3>
                    <div className="space-y-3">
                      <input
                        autoFocus
                        value={newDealTitle}
                        onChange={(e) => setNewDealTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddDeal(stage.id);
                          if (e.key === "Escape") setAddingToStage(null);
                        }}
                        placeholder="Deal titel..."
                        className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3.5 py-2.5 text-[13px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/30"
                      />
                      <input
                        value={newDealCompany}
                        onChange={(e) => setNewDealCompany(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddDeal(stage.id);
                          if (e.key === "Escape") setAddingToStage(null);
                        }}
                        placeholder="Firmanavn..."
                        className="w-full rounded-xl border border-[#0a2f5b]/[0.08] px-3.5 py-2.5 text-[13px] text-[#0a2f5b] outline-none placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/30"
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => setAddingToStage(null)}
                        className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#0a2f5b]/40 hover:text-[#0a2f5b]/60"
                      >
                        Annuller
                      </button>
                      <button
                        onClick={() => handleAddDeal(stage.id)}
                        disabled={!newDealTitle.trim()}
                        className="rounded-xl bg-[#2ec964] px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-[#2ec964]/20 hover:bg-[#25a854] disabled:opacity-40"
                      >
                        Opret deal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="w-72 rotate-2 opacity-90 shadow-2xl">
            <DealCard
              deal={activeDeal}
              stageColor="#2ec964"
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
