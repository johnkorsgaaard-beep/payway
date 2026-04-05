export interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  color: string | null;
  checklist: CheckItem[];
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export interface FlowState {
  boards: Board[];
  cards: Record<string, Card>;
  activeBoardId: string | null;
}

const STORAGE_KEY = "pwflow_state";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function defaultState(): FlowState {
  const boardId = uid();
  return {
    boards: [
      {
        id: boardId,
        name: "Mit Board",
        columns: [
          { id: uid(), title: "To Do", cardIds: [] },
          { id: uid(), title: "I gang", cardIds: [] },
          { id: uid(), title: "Færdig", cardIds: [] },
        ],
      },
    ],
    cards: {},
    activeBoardId: boardId,
  };
}

export function loadState(): FlowState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as FlowState;
  } catch {
    return defaultState();
  }
}

export function saveState(state: FlowState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createBoard(state: FlowState, name: string): FlowState {
  const board: Board = {
    id: uid(),
    name,
    columns: [
      { id: uid(), title: "To Do", cardIds: [] },
      { id: uid(), title: "I gang", cardIds: [] },
      { id: uid(), title: "Færdig", cardIds: [] },
    ],
  };
  return { ...state, boards: [...state.boards, board], activeBoardId: board.id };
}

export function deleteBoard(state: FlowState, boardId: string): FlowState {
  const board = state.boards.find((b) => b.id === boardId);
  const cardIdsToRemove = new Set(board?.columns.flatMap((c) => c.cardIds) ?? []);
  const cards = { ...state.cards };
  cardIdsToRemove.forEach((id) => delete cards[id]);
  const boards = state.boards.filter((b) => b.id !== boardId);
  return {
    ...state,
    boards,
    cards,
    activeBoardId: boards.length > 0 ? boards[0].id : null,
  };
}

export function renameBoard(state: FlowState, boardId: string, name: string): FlowState {
  return {
    ...state,
    boards: state.boards.map((b) => (b.id === boardId ? { ...b, name } : b)),
  };
}

export function addColumn(state: FlowState, boardId: string, title: string): FlowState {
  return {
    ...state,
    boards: state.boards.map((b) =>
      b.id === boardId
        ? { ...b, columns: [...b.columns, { id: uid(), title, cardIds: [] }] }
        : b
    ),
  };
}

export function renameColumn(state: FlowState, boardId: string, columnId: string, title: string): FlowState {
  return {
    ...state,
    boards: state.boards.map((b) =>
      b.id === boardId
        ? { ...b, columns: b.columns.map((c) => (c.id === columnId ? { ...c, title } : c)) }
        : b
    ),
  };
}

export function deleteColumn(state: FlowState, boardId: string, columnId: string): FlowState {
  const board = state.boards.find((b) => b.id === boardId);
  const col = board?.columns.find((c) => c.id === columnId);
  const cards = { ...state.cards };
  col?.cardIds.forEach((id) => delete cards[id]);
  return {
    ...state,
    cards,
    boards: state.boards.map((b) =>
      b.id === boardId ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) } : b
    ),
  };
}

export function addCard(state: FlowState, boardId: string, columnId: string, title: string): FlowState {
  const card: Card = {
    id: uid(),
    title,
    description: "",
    color: null,
    checklist: [],
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    cards: { ...state.cards, [card.id]: card },
    boards: state.boards.map((b) =>
      b.id === boardId
        ? {
            ...b,
            columns: b.columns.map((c) =>
              c.id === columnId ? { ...c, cardIds: [...c.cardIds, card.id] } : c
            ),
          }
        : b
    ),
  };
}

export function updateCard(state: FlowState, cardId: string, updates: Partial<Omit<Card, "id" | "createdAt">>): FlowState {
  const existing = state.cards[cardId];
  if (!existing) return state;
  return {
    ...state,
    cards: { ...state.cards, [cardId]: { ...existing, ...updates } },
  };
}

export function deleteCard(state: FlowState, boardId: string, cardId: string): FlowState {
  const cards = { ...state.cards };
  delete cards[cardId];
  return {
    ...state,
    cards,
    boards: state.boards.map((b) =>
      b.id === boardId
        ? { ...b, columns: b.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((id) => id !== cardId) })) }
        : b
    ),
  };
}

export function moveCard(
  state: FlowState,
  boardId: string,
  fromColumnId: string,
  toColumnId: string,
  cardId: string,
  toIndex: number
): FlowState {
  return {
    ...state,
    boards: state.boards.map((b) => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: b.columns.map((c) => {
          if (c.id === fromColumnId && c.id === toColumnId) {
            const ids = c.cardIds.filter((id) => id !== cardId);
            ids.splice(toIndex, 0, cardId);
            return { ...c, cardIds: ids };
          }
          if (c.id === fromColumnId) {
            return { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) };
          }
          if (c.id === toColumnId) {
            const ids = [...c.cardIds];
            ids.splice(toIndex, 0, cardId);
            return { ...c, cardIds: ids };
          }
          return c;
        }),
      };
    }),
  };
}

export function reorderColumns(state: FlowState, boardId: string, columnIds: string[]): FlowState {
  return {
    ...state,
    boards: state.boards.map((b) => {
      if (b.id !== boardId) return b;
      const colMap = new Map(b.columns.map((c) => [c.id, c]));
      return { ...b, columns: columnIds.map((id) => colMap.get(id)!).filter(Boolean) };
    }),
  };
}

export const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];
