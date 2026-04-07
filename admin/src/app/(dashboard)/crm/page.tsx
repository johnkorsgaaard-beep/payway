"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Handshake,
  Calendar,
  RotateCcw,
  Sparkles,
  Plus,
} from "lucide-react";
import type { CrmState, Deal, Activity } from "@/lib/crm-store";
import {
  loadCrmState,
  saveCrmState,
  updateDeal,
  deleteDeal,
  addActivity,
  addDeal,
  addStage,
} from "@/lib/crm-store";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { DealModal } from "@/components/crm/deal-modal";
import { AiLeadModal } from "@/components/crm/ai-lead-modal";

function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toLocaleString("da-DK");
}

export default function CrmPage() {
  const [state, setState] = useState<CrmState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalDealId, setModalDealId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showAiModal, setShowAiModal] = useState(false);
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  useEffect(() => {
    setState(loadCrmState());
  }, []);

  const commit = useCallback((next: CrmState) => {
    setState(next);
    saveCrmState(next);
  }, []);

  const pipeline = state?.pipelines.find(
    (p) => p.id === state.activePipelineId
  ) ?? state?.pipelines[0] ?? null;

  const stats = useMemo(() => {
    if (!state || !pipeline) {
      return { totalValue: 0, weightedValue: 0, dealCount: 0, wonValue: 0, winRate: 0, avgDealSize: 0 };
    }

    const allDealIds = pipeline.stages.flatMap((s) => s.dealIds);
    const deals = allDealIds.map((id) => state.deals[id]).filter(Boolean);

    const wonStage = pipeline.stages.find((s) => s.title === "Vundet");
    const lostStage = pipeline.stages.find((s) => s.title === "Tabt");
    const wonIds = new Set(wonStage?.dealIds ?? []);
    const lostIds = new Set(lostStage?.dealIds ?? []);

    const activeDeals = deals.filter((d) => !wonIds.has(d.id) && !lostIds.has(d.id));
    const wonDeals = deals.filter((d) => wonIds.has(d.id));

    const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = activeDeals.reduce(
      (sum, d) => sum + d.value * (d.probability / 100),
      0
    );
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const closedCount = wonDeals.length + deals.filter((d) => lostIds.has(d.id)).length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
    const avgDealSize = activeDeals.length > 0 ? Math.round(totalValue / activeDeals.length) : 0;

    return {
      totalValue,
      weightedValue: Math.round(weightedValue),
      dealCount: activeDeals.length,
      wonValue,
      winRate,
      avgDealSize,
    };
  }, [state, pipeline]);

  if (!state) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  const modalDeal = modalDealId ? state.deals[modalDealId] : null;
  const modalStage = modalDealId && pipeline
    ? pipeline.stages.find((s) => s.dealIds.includes(modalDealId))
    : null;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2ec964] to-[#1a8a45] text-white shadow-lg shadow-[#2ec964]/20">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0a2f5b]">CRM</h1>
            <p className="text-sm text-[#0a2f5b]/40">
              Pipeline &amp; salgsopfølgning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/25" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg deals, firmaer..."
              className="w-64 rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#0a2f5b] outline-none transition-colors placeholder:text-[#0a2f5b]/25 focus:border-[#2ec964]/30 focus:shadow-sm focus:shadow-[#2ec964]/10"
            />
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="appearance-none rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-2.5 pl-3 pr-8 text-[13px] font-medium text-[#0a2f5b]/60 outline-none transition-colors focus:border-[#2ec964]/30"
            >
              <option value="all">Alle prioriteter</option>
              <option value="high">Høj prioritet</option>
              <option value="medium">Medium</option>
              <option value="low">Lav</option>
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0a2f5b]/25" />
          </div>

          {/* Add stage */}
          {addingStage ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newStageName.trim() && pipeline) {
                    commit(addStage(state!, pipeline.id, newStageName.trim(), "#64748b"));
                    setNewStageName("");
                    setAddingStage(false);
                  }
                  if (e.key === "Escape") {
                    setNewStageName("");
                    setAddingStage(false);
                  }
                }}
                placeholder="Kategorinavn..."
                className="w-36 rounded-xl border border-[#2ec964]/30 bg-white px-3 py-2.5 text-[13px] text-[#0a2f5b] outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingStage(true)}
              title="Tilføj kategori"
              className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white p-2.5 text-[#0a2f5b]/30 transition-colors hover:text-[#0a2f5b]/60"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          {/* AI Lead Scanner */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[#8b5cf6]/20 transition-all hover:shadow-xl hover:shadow-[#8b5cf6]/30"
          >
            <Sparkles className="h-4 w-4" />
            AI Lead
          </button>

          {/* Reset demo */}
          <button
            onClick={() => {
              localStorage.removeItem("pwcrm_state");
              setState(loadCrmState());
            }}
            title="Nulstil demo-data"
            className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white p-2.5 text-[#0a2f5b]/30 transition-colors hover:text-[#0a2f5b]/60"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-4 grid grid-cols-6 gap-3">
        {[
          {
            icon: Target,
            label: "Pipeline værdi",
            value: `${formatValue(stats.totalValue)} kr.`,
            color: "from-[#0a2f5b] to-[#1a5a9e]",
          },
          {
            icon: TrendingUp,
            label: "Vægtet værdi",
            value: `${formatValue(stats.weightedValue)} kr.`,
            color: "from-[#2ec964] to-[#1a8a45]",
          },
          {
            icon: Handshake,
            label: "Aktive deals",
            value: String(stats.dealCount),
            color: "from-[#3b82f6] to-[#2563eb]",
          },
          {
            icon: DollarSign,
            label: "Vundet total",
            value: `${formatValue(stats.wonValue)} kr.`,
            color: "from-[#2ec964] to-[#16a34a]",
          },
          {
            icon: Users,
            label: "Win rate",
            value: `${stats.winRate}%`,
            color: "from-[#8b5cf6] to-[#7c3aed]",
          },
          {
            icon: Calendar,
            label: "Gns. deal størrelse",
            value: `${formatValue(stats.avgDealSize)} kr.`,
            color: "from-[#f59e0b] to-[#d97706]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#0a2f5b]/[0.05] bg-white p-4 shadow-sm shadow-[#0a2f5b]/[0.02]"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-[#0a2f5b]/30">
                  {stat.label}
                </p>
                <p className="text-[16px] font-bold text-[#0a2f5b]">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      {pipeline && (
        <div className="flex-1 overflow-hidden">
          <PipelineBoard
            pipeline={pipeline}
            state={state}
            setState={setState}
            onDealClick={setModalDealId}
            searchQuery={searchQuery}
            priorityFilter={filterPriority}
          />
        </div>
      )}

      {/* Deal modal */}
      {modalDeal && modalStage && (
        <DealModal
          deal={modalDeal}
          stageName={modalStage.title}
          stageColor={modalStage.color}
          onUpdate={(updates) => commit(updateDeal(state, modalDeal.id, updates))}
          onAddActivity={(activity: Activity) =>
            commit(addActivity(state, modalDeal.id, activity))
          }
          onDelete={() => {
            if (pipeline) {
              commit(deleteDeal(state, pipeline.id, modalDeal.id));
            }
            setModalDealId(null);
          }}
          onClose={() => setModalDealId(null)}
        />
      )}

      {/* AI Lead modal */}
      {showAiModal && pipeline && (
        <AiLeadModal
          pipeline={pipeline}
          onAddDeal={(stageId, deal) => {
            commit(addDeal(state, pipeline.id, stageId, deal));
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
}
