"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  KanbanSquare,
  X,
  Check,
} from "lucide-react";
import type { FlowState } from "@/lib/flow-store";
import {
  loadState,
  saveState,
  createBoard,
  deleteBoard,
  renameBoard,
} from "@/lib/flow-store";
import { KanbanBoard } from "@/components/flow/kanban-board";

export default function FlowPage() {
  const [state, setState] = useState<FlowState | null>(null);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  const commit = (next: FlowState) => {
    setState(next);
    saveState(next);
  };

  const activeBoard = state.boards.find((b) => b.id === state.activeBoardId) ?? state.boards[0] ?? null;

  const handleCreateBoard = () => {
    const trimmed = newBoardName.trim();
    if (trimmed) {
      commit(createBoard(state, trimmed));
      setNewBoardName("");
    }
    setIsCreating(false);
  };

  const handleRename = (boardId: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      commit(renameBoard(state, boardId, trimmed));
    }
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a2f5b] text-white">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0a2f5b]">pwFLOW</h1>
            <p className="text-sm text-[#0a2f5b]/40">Administrer opgaver og projekter</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setBoardMenuOpen(!boardMenuOpen)}
            className="flex items-center gap-2 rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a2f5b]/70 shadow-sm transition-colors hover:bg-[#0a2f5b]/[0.02]"
          >
            {activeBoard?.name || "Vælg board"}
            <ChevronDown className="h-4 w-4 text-[#0a2f5b]/30" />
          </button>

          {boardMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBoardMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-2 shadow-xl shadow-[#0a2f5b]/[0.08]">
                <p className="px-3 pb-1 pt-1 text-xs font-medium uppercase text-[#0a2f5b]/30">Boards</p>
                {state.boards.map((b) => (
                  <div
                    key={b.id}
                    className={`group flex items-center gap-2 px-3 py-2 ${
                      b.id === state.activeBoardId
                        ? "bg-[#2ec964]/[0.06]"
                        : "hover:bg-[#0a2f5b]/[0.02]"
                    }`}
                  >
                    {renamingId === b.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <input
                          className="flex-1 rounded-lg border border-[#2ec964]/30 bg-white px-2 py-1 text-sm text-[#0a2f5b] outline-none"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(b.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(b.id)}
                          className="text-[#2ec964] hover:text-[#25a854]"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className={`flex-1 text-left text-sm font-medium ${
                            b.id === state.activeBoardId
                              ? "text-[#1a8a45]"
                              : "text-[#0a2f5b]/70"
                          }`}
                          onClick={() => {
                            commit({ ...state, activeBoardId: b.id });
                            setBoardMenuOpen(false);
                          }}
                        >
                          {b.name}
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(b.id);
                            setRenameValue(b.name);
                          }}
                          className="text-[#0a2f5b]/20 opacity-0 transition-opacity hover:text-[#0a2f5b]/50 group-hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {state.boards.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Slet "${b.name}"?`)) {
                                commit(deleteBoard(state, b.id));
                              }
                            }}
                            className="text-[#0a2f5b]/20 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}

                <div className="mt-1 border-t border-[#0a2f5b]/[0.06] pt-1">
                  {isCreating ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        className="flex-1 rounded-lg border border-[#2ec964]/30 bg-white px-2 py-1 text-sm text-[#0a2f5b] outline-none"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateBoard();
                          if (e.key === "Escape") {
                            setNewBoardName("");
                            setIsCreating(false);
                          }
                        }}
                        placeholder="Board navn..."
                        autoFocus
                      />
                      <button onClick={() => { setNewBoardName(""); setIsCreating(false); }} className="text-[#0a2f5b]/30 hover:text-[#0a2f5b]/60">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#0a2f5b]/40 hover:bg-[#0a2f5b]/[0.02] hover:text-[#0a2f5b]/70"
                    >
                      <Plus className="h-4 w-4" />
                      Nyt board
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeBoard ? (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard board={activeBoard} state={state} setState={setState} />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <KanbanSquare className="h-16 w-16 text-[#0a2f5b]/10" />
          <p className="text-[#0a2f5b]/30">Intet board valgt. Opret et nyt board.</p>
          <button
            onClick={() => {
              setIsCreating(true);
              setBoardMenuOpen(true);
            }}
            className="rounded-xl bg-[#2ec964] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#2ec964]/20 hover:bg-[#25a854]"
          >
            Opret board
          </button>
        </div>
      )}
    </div>
  );
}
