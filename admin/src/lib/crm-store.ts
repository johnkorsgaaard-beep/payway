export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note";
  text: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  tags: string[];
  notes: string;
  activities: Activity[];
  createdAt: string;
  expectedClose: string;
  priority: "low" | "medium" | "high";
  lostReason?: string;
}

export interface Stage {
  id: string;
  title: string;
  color: string;
  dealIds: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

export interface CrmState {
  pipelines: Pipeline[];
  deals: Record<string, Deal>;
  activePipelineId: string | null;
}

const STORAGE_KEY = "pwcrm_state";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const DEMO_DEALS: Deal[] = [
  {
    id: "d1",
    title: "Café Nólsoy — QR Betaling",
    value: 2400,
    probability: 80,
    company: "Café Nólsoy",
    contactName: "Jóhanna Petersen",
    contactEmail: "johanna@cafenolsoy.fo",
    contactPhone: "+298 312 456",
    tags: ["café", "tórshavn"],
    notes: "Interesseret i QR-betaling til cafeen. Vil gerne starte med 1 lokation.",
    activities: [
      { id: "a1", type: "meeting", text: "Demo af QR-betaling i butikken", createdAt: "2026-04-04T14:00:00Z" },
      { id: "a2", type: "email", text: "Sendt prisoverslag og info-materiale", createdAt: "2026-04-03T10:30:00Z" },
    ],
    createdAt: "2026-04-01T09:00:00Z",
    expectedClose: "2026-04-20",
    priority: "high",
  },
  {
    id: "d2",
    title: "Føroya Bjór — Taproom",
    value: 5800,
    probability: 60,
    company: "Føroya Bjór",
    contactName: "Bárður Hansen",
    contactEmail: "bardur@foroyabjor.fo",
    contactPhone: "+298 456 789",
    tags: ["restaurant", "klaksvík"],
    notes: "Vil bruge PayWay i deres nye taproom. 3 salgspunkter.",
    activities: [
      { id: "a3", type: "call", text: "Opfølgningssamtale — afventer intern godkendelse", createdAt: "2026-04-05T11:00:00Z" },
    ],
    createdAt: "2026-03-28T14:00:00Z",
    expectedClose: "2026-05-01",
    priority: "medium",
  },
  {
    id: "d3",
    title: "Magn — Supermarked",
    value: 12000,
    probability: 40,
    company: "Magn",
    contactName: "Súni Djurhuus",
    contactEmail: "suni@magn.fo",
    contactPhone: "+298 200 300",
    tags: ["retail", "kæde"],
    notes: "Stor kæde — vil teste i 1 butik først.",
    activities: [
      { id: "a4", type: "email", text: "Sendt case study fra Café Nólsoy", createdAt: "2026-04-02T09:00:00Z" },
    ],
    createdAt: "2026-03-25T10:00:00Z",
    expectedClose: "2026-06-01",
    priority: "high",
  },
  {
    id: "d4",
    title: "SMS Vágur — Kiosk",
    value: 1800,
    probability: 90,
    company: "SMS Vágur",
    contactName: "Anna Olsen",
    contactEmail: "anna@smsvagur.fo",
    contactPhone: "+298 100 200",
    tags: ["kiosk", "vágur"],
    notes: "Klar til at starte — afventer kontrakt.",
    activities: [
      { id: "a5", type: "note", text: "Kontrakt sendt til underskrift", createdAt: "2026-04-06T15:00:00Z" },
    ],
    createdAt: "2026-03-20T08:00:00Z",
    expectedClose: "2026-04-10",
    priority: "medium",
  },
  {
    id: "d5",
    title: "Havnar Bakari",
    value: 3200,
    probability: 20,
    company: "Havnar Bakari",
    contactName: "Katrin Joensen",
    contactEmail: "katrin@havnarbakari.fo",
    contactPhone: "+298 555 666",
    tags: ["bageri", "tórshavn"],
    notes: "Første kontakt via hjemmesiden. Vil gerne høre mere.",
    activities: [],
    createdAt: "2026-04-06T12:00:00Z",
    expectedClose: "2026-05-15",
    priority: "low",
  },
  {
    id: "d6",
    title: "Hotel Føroyar",
    value: 18500,
    probability: 50,
    company: "Hotel Føroyar",
    contactName: "Magnus Weihe",
    contactEmail: "magnus@hotelforoyar.fo",
    contactPhone: "+298 777 888",
    tags: ["hotel", "tórshavn"],
    notes: "Restaurant + bar + reception. Stort potentiale.",
    activities: [
      { id: "a6", type: "meeting", text: "Fremvisning planlagt til næste uge", createdAt: "2026-04-05T16:00:00Z" },
    ],
    createdAt: "2026-03-15T10:00:00Z",
    expectedClose: "2026-05-20",
    priority: "high",
  },
];

function defaultState(): CrmState {
  const pipelineId = uid();
  return {
    pipelines: [
      {
        id: pipelineId,
        name: "Salgspipeline",
        stages: [
          { id: "s1", title: "Ny lead", color: "#94a3b8", dealIds: ["d5"] },
          { id: "s2", title: "Kontaktet", color: "#3b82f6", dealIds: ["d6"] },
          { id: "s3", title: "Demo / Møde", color: "#8b5cf6", dealIds: ["d1", "d2"] },
          { id: "s4", title: "Tilbud sendt", color: "#f59e0b", dealIds: ["d3"] },
          { id: "s5", title: "Forhandling", color: "#f97316", dealIds: ["d4"] },
          { id: "s6", title: "Vundet", color: "#2ec964", dealIds: [] },
          { id: "s7", title: "Tabt", color: "#ef4444", dealIds: [] },
        ],
      },
    ],
    deals: Object.fromEntries(DEMO_DEALS.map((d) => [d.id, d])),
    activePipelineId: pipelineId,
  };
}

export function loadCrmState(): CrmState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as CrmState;
  } catch {
    return defaultState();
  }
}

export function saveCrmState(state: CrmState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addDeal(state: CrmState, pipelineId: string, stageId: string, deal: Deal): CrmState {
  return {
    ...state,
    deals: { ...state.deals, [deal.id]: deal },
    pipelines: state.pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, stages: p.stages.map((s) => (s.id === stageId ? { ...s, dealIds: [...s.dealIds, deal.id] } : s)) }
        : p
    ),
  };
}

export function updateDeal(state: CrmState, dealId: string, updates: Partial<Omit<Deal, "id" | "createdAt">>): CrmState {
  const existing = state.deals[dealId];
  if (!existing) return state;
  return {
    ...state,
    deals: { ...state.deals, [dealId]: { ...existing, ...updates } },
  };
}

export function deleteDeal(state: CrmState, pipelineId: string, dealId: string): CrmState {
  const deals = { ...state.deals };
  delete deals[dealId];
  return {
    ...state,
    deals,
    pipelines: state.pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, stages: p.stages.map((s) => ({ ...s, dealIds: s.dealIds.filter((id) => id !== dealId) })) }
        : p
    ),
  };
}

export function moveDeal(
  state: CrmState,
  pipelineId: string,
  fromStageId: string,
  toStageId: string,
  dealId: string,
  toIndex: number
): CrmState {
  return {
    ...state,
    pipelines: state.pipelines.map((p) => {
      if (p.id !== pipelineId) return p;
      return {
        ...p,
        stages: p.stages.map((s) => {
          if (s.id === fromStageId && s.id === toStageId) {
            const ids = s.dealIds.filter((id) => id !== dealId);
            ids.splice(toIndex, 0, dealId);
            return { ...s, dealIds: ids };
          }
          if (s.id === fromStageId) {
            return { ...s, dealIds: s.dealIds.filter((id) => id !== dealId) };
          }
          if (s.id === toStageId) {
            const ids = [...s.dealIds];
            ids.splice(toIndex, 0, dealId);
            return { ...s, dealIds: ids };
          }
          return s;
        }),
      };
    }),
  };
}

export function addActivity(state: CrmState, dealId: string, activity: Activity): CrmState {
  const deal = state.deals[dealId];
  if (!deal) return state;
  return {
    ...state,
    deals: {
      ...state.deals,
      [dealId]: { ...deal, activities: [activity, ...deal.activities] },
    },
  };
}

export function renameStage(state: CrmState, pipelineId: string, stageId: string, title: string): CrmState {
  return {
    ...state,
    pipelines: state.pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, stages: p.stages.map((s) => (s.id === stageId ? { ...s, title } : s)) }
        : p
    ),
  };
}

export function deleteStage(state: CrmState, pipelineId: string, stageId: string): CrmState {
  const pipeline = state.pipelines.find((p) => p.id === pipelineId);
  const stage = pipeline?.stages.find((s) => s.id === stageId);
  const deals = { ...state.deals };
  stage?.dealIds.forEach((id) => delete deals[id]);
  return {
    ...state,
    deals,
    pipelines: state.pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, stages: p.stages.filter((s) => s.id !== stageId) }
        : p
    ),
  };
}

export function addStage(state: CrmState, pipelineId: string, title: string, color: string): CrmState {
  return {
    ...state,
    pipelines: state.pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, stages: [...p.stages, { id: uid(), title, color, dealIds: [] }] }
        : p
    ),
  };
}

export function createDeal(overrides: Partial<Deal> & { title: string; company: string }): Deal {
  return {
    id: uid(),
    value: 0,
    probability: 10,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    tags: [],
    notes: "",
    activities: [],
    createdAt: new Date().toISOString(),
    expectedClose: "",
    priority: "medium",
    ...overrides,
  };
}

export function createUid(): string {
  return uid();
}
