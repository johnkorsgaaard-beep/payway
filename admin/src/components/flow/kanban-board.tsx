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
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Board, Card, FlowState } from "@/lib/flow-store";
import {
  addCard,
  addColumn,
  deleteColumn,
  renameColumn,
  moveCard,
  reorderColumns,
  updateCard,
  deleteCard,
  saveState,
} from "@/lib/flow-store";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { CardModal } from "./card-modal";

interface KanbanBoardProps {
  board: Board;
  state: FlowState;
  setState: (s: FlowState) => void;
}

export function KanbanBoard({ board, state, setState }: KanbanBoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [modalCardId, setModalCardId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const commit = useCallback(
    (next: FlowState) => {
      setState(next);
      saveState(next);
    },
    [setState]
  );

  const findColumnByCardId = (cardId: string): string | null => {
    for (const col of board.columns) {
      if (col.cardIds.includes(cardId)) return col.id;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCardId(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type !== "card") return;

    const activeColId = findColumnByCardId(active.id as string);
    let overColId: string | null = null;

    if (over.data.current?.type === "card") {
      overColId = findColumnByCardId(over.id as string);
    } else if (over.data.current?.type === "column") {
      overColId = over.id as string;
    }

    if (!activeColId || !overColId || activeColId === overColId) return;

    const overCol = board.columns.find((c) => c.id === overColId);
    if (!overCol) return;

    let toIndex = overCol.cardIds.length;
    if (over.data.current?.type === "card") {
      toIndex = overCol.cardIds.indexOf(over.id as string);
    }

    commit(moveCard(state, board.id, activeColId, overColId, active.id as string, toIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over) return;

    if (active.data.current?.type === "column" && over.data.current?.type === "column") {
      if (active.id !== over.id) {
        const oldIds = board.columns.map((c) => c.id);
        const oldIndex = oldIds.indexOf(active.id as string);
        const newIndex = oldIds.indexOf(over.id as string);
        commit(reorderColumns(state, board.id, arrayMove(oldIds, oldIndex, newIndex)));
      }
      return;
    }

    if (active.data.current?.type === "card") {
      const activeColId = findColumnByCardId(active.id as string);
      if (!activeColId) return;

      if (over.data.current?.type === "card") {
        const overColId = findColumnByCardId(over.id as string);
        if (!overColId) return;
        const overCol = board.columns.find((c) => c.id === overColId);
        if (!overCol) return;
        const toIndex = overCol.cardIds.indexOf(over.id as string);
        if (activeColId === overColId && active.id !== over.id) {
          commit(moveCard(state, board.id, activeColId, overColId, active.id as string, toIndex));
        }
      }
    }
  };

  const handleAddColumn = () => {
    const trimmed = newColTitle.trim();
    if (trimmed) {
      commit(addColumn(state, board.id, trimmed));
      setNewColTitle("");
    }
    setAddingColumn(false);
  };

  const activeCard = activeCardId ? state.cards[activeCardId] : null;
  const modalCard = modalCardId ? state.cards[modalCardId] : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={board.columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {board.columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={col.cardIds.map((id) => state.cards[id]).filter(Boolean)}
                onAddCard={(title) => commit(addCard(state, board.id, col.id, title))}
                onRenameColumn={(title) => commit(renameColumn(state, board.id, col.id, title))}
                onDeleteColumn={() => commit(deleteColumn(state, board.id, col.id))}
                onCardClick={(cardId) => setModalCardId(cardId)}
              />
            ))}
          </SortableContext>

          {/* Add Column */}
          {addingColumn ? (
            <div className="w-72 shrink-0 rounded-2xl bg-[#0a2f5b]/[0.02] p-3">
              <input
                className="w-full rounded-xl border border-[#2ec964]/30 bg-white px-3 py-2 text-sm font-semibold text-[#0a2f5b] outline-none focus:border-[#25a854]"
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setNewColTitle("");
                    setAddingColumn(false);
                  }
                }}
                onBlur={handleAddColumn}
                placeholder="Kolonnenavn..."
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#0a2f5b]/[0.08] py-8 text-sm font-medium text-[#0a2f5b]/30 transition-colors hover:border-[#0a2f5b]/20 hover:bg-[#0a2f5b]/[0.02] hover:text-[#0a2f5b]/70"
            >
              <Plus className="h-4 w-4" />
              Tilføj kolonne
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-64 rotate-3 opacity-90">
              <KanbanCard card={activeCard} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card Modal */}
      {modalCard && (
        <CardModal
          card={modalCard}
          onUpdate={(updates) => commit(updateCard(state, modalCard.id, updates))}
          onDelete={() => {
            commit(deleteCard(state, board.id, modalCard.id));
            setModalCardId(null);
          }}
          onClose={() => setModalCardId(null)}
        />
      )}
    </>
  );
}
