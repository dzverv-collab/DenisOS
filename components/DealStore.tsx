"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialContent, initialDeals, initialGoals, initialHabits, initialLearning } from "@/lib/mock";
import { ContentCard, Deal, DealStatus, Goal, HabitLog, LearningEntry } from "@/lib/types";
import { csvToDeals } from "@/lib/csv";
import {
  contentFromDb,
  dealFromDb,
  dealToDb,
  goalFromDb,
  habitFromDb,
  learningFromDb,
  supabase,
  supabaseEnabled
} from "@/lib/supabase";

type Store = {
  deals: Deal[];
  content: ContentCard[];
  goals: Goal[];
  habits: HabitLog[];
  learning: LearningEntry[];
  cloudReady: boolean;
  loading: boolean;
  addDeal: (deal: Omit<Deal, "id">) => Promise<void>;
  updateDeal: (id: string, patch: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => void;
  updateStatus: (id: string, status: Deal["status"]) => void;
  addContent: (card: Omit<ContentCard, "id">) => void;
  moveContent: (id: string, status: ContentCard["status"]) => void;
  deleteContent: (id: string) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  toggleHabit: (date: string, key: keyof Omit<HabitLog, "date">) => void;
  addLearning: (entry: Omit<LearningEntry, "id">) => void;
  deleteLearning: (id: string) => void;
  exportData: () => string;
  importData: (raw: string) => void;
  importDealsCsv: (raw: string) => void;
  syncFromCloud: () => Promise<void>;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);
const todayKey = () => new Date().toISOString().slice(0, 10);

function normalizeDeal(deal: Deal): Deal {
  const status = deal.status === "В доставке" ? "Ко мне едет" : deal.status;
  const statusHistory = deal.statusHistory?.map((entry) => ({
    ...entry,
    status: entry.status === "В доставке" ? "Ко мне едет" : entry.status,
  }));
  return { ...deal, status, statusHistory };
}

function appendStatusHistory(deal: Deal, status: DealStatus, date = todayKey()): Deal {
  if (deal.status === status && deal.statusHistory?.length) return deal;
  const last = deal.statusHistory?.[deal.statusHistory.length - 1];
  if (last?.status === status) return { ...deal, status };
  return {
    ...deal,
    status,
    statusHistory: [
      ...(deal.statusHistory ?? []),
      { id: crypto.randomUUID(), status, date }
    ]
  };
}


export function DealStoreProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [content, setContent] = useState<ContentCard[]>(initialContent);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [habits, setHabits] = useState<HabitLog[]>(initialHabits);
  const [learning, setLearning] = useState<LearningEntry[]>(initialLearning);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  async function syncFromCloud() {
    if (!supabase) return;
    setLoading(true);
    try {
      const [dealsRes, contentRes, goalsRes, habitsRes, learningRes] = await Promise.all([
        supabase.from("deals").select("*").order("created_at", { ascending: false }),
        supabase.from("content_cards").select("*").order("created_at", { ascending: false }),
        supabase.from("goals").select("*").order("created_at", { ascending: true }),
        supabase.from("habits").select("*").order("date", { ascending: false }),
        supabase.from("learning_entries").select("*").order("created_at", { ascending: false })
      ]);

      if (dealsRes.data?.length) setDeals(dealsRes.data.map(dealFromDb).map(normalizeDeal));
      if (contentRes.data?.length) setContent(contentRes.data.map(contentFromDb));
      if (goalsRes.data?.length) setGoals(goalsRes.data.map(goalFromDb));
      if (habitsRes.data?.length) setHabits(habitsRes.data.map(habitFromDb));
      if (learningRes.data?.length) setLearning(learningRes.data.map(learningFromDb));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const keys = ["denis-os-deals", "denis-os-content", "denis-os-goals", "denis-os-habits", "denis-os-learning"];
    const [rawDeals, rawContent, rawGoals, rawHabits, rawLearning] = keys.map((k) => localStorage.getItem(k));
    try {
      if (rawDeals) setDeals(JSON.parse(rawDeals).map(normalizeDeal));
      if (rawContent) setContent(JSON.parse(rawContent));
      if (rawGoals) setGoals(JSON.parse(rawGoals));
      if (rawHabits) setHabits(JSON.parse(rawHabits));
      if (rawLearning) setLearning(JSON.parse(rawLearning));
    } catch (error) {
      console.error("Не удалось прочитать локальные данные Denis OS:", error);
    } finally {
      setHydrated(true);
    }
    if (supabaseEnabled) syncFromCloud();
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("denis-os-deals", JSON.stringify(deals)); }, [deals, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("denis-os-content", JSON.stringify(content)); }, [content, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("denis-os-goals", JSON.stringify(goals)); }, [goals, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("denis-os-habits", JSON.stringify(habits)); }, [habits, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("denis-os-learning", JSON.stringify(learning)); }, [learning, hydrated]);

  const value = useMemo<Store>(() => ({
    deals,
    content,
    goals,
    habits,
    learning,
    cloudReady: supabaseEnabled,
    loading,

    addDeal: async (deal) => {
      const tempId = crypto.randomUUID();
      const normalizedDeal = normalizeDeal({ ...deal, id: tempId } as Deal);
      const optimisticDeal: Deal = appendStatusHistory(normalizedDeal, normalizedDeal.status, normalizedDeal.purchaseDate);
      setDeals((prev) => [optimisticDeal, ...prev]);

      if (!supabase) return;

      const { data, error } = await supabase
        .from("deals")
        .insert(dealToDb(optimisticDeal))
        .select("*")
        .single();

      if (error) {
        console.error("Ошибка сохранения сделки в Supabase:", error);
        alert(`Не удалось сохранить телефон в базе: ${error.message}`);
        setDeals((prev) => prev.filter((d) => d.id !== tempId));
        return;
      }

      if (data) {
        setDeals((prev) => prev.map((d) => d.id === tempId ? dealFromDb(data) : d));
      }
    },

    updateDeal: async (id, patch) => {
      const previousDeals = deals;
      const existing = deals.find((d) => d.id === id);
      if (patch.status === "В доставке") patch = { ...patch, status: "Ко мне едет" };
      const nextPatch = existing && patch.status && patch.status !== existing.status && !patch.statusHistory
        ? appendStatusHistory({ ...existing, ...patch }, patch.status)
        : patch;
      setDeals((prev) => prev.map((d) => d.id === id ? (nextPatch as Deal).id ? (nextPatch as Deal) : { ...d, ...nextPatch } : d));
      if (!supabase) return;

      const { error } = await supabase.from("deals").update(dealToDb(nextPatch)).eq("id", id);
      if (error) {
        console.error("Ошибка обновления сделки в Supabase:", error);
        alert(`Не удалось обновить телефон в базе: ${error.message}`);
        setDeals(previousDeals);
      }
    },

    deleteDeal: async (id) => {
      setDeals((prev) => prev.filter((d) => d.id !== id));
      if (supabase) await supabase.from("deals").delete().eq("id", id);
    },

    updateStatus: async (id, status) => {
      if (status === "В доставке") status = "Ко мне едет";
      const today = todayKey();
      const previousDeals = deals;
      const existing = deals.find((d) => d.id === id);
      if (!existing) return;
      const nextDeal = appendStatusHistory({
        ...existing,
        status,
        saleDate: status === "Продан" ? today : existing.saleDate,
        listedDate: status === "Выставлен" ? today : existing.listedDate
      }, status, today);
      setDeals((prev) => prev.map((d) => d.id === id ? nextDeal : d));
      if (supabase) {
        const { error } = await supabase.from("deals").update(dealToDb(nextDeal)).eq("id", id);
        if (error) {
          console.error("Ошибка обновления статуса в Supabase:", error);
          alert(`Не удалось обновить статус: ${error.message}`);
          setDeals(previousDeals);
        }
      }
    },

    addContent: async (card) => {
      if (supabase) {
        const { data } = await supabase.from("content_cards").insert(card).select("*").single();
        if (data) setContent((prev) => [contentFromDb(data), ...prev]);
        return;
      }
      setContent((prev) => [{ ...card, id: crypto.randomUUID() }, ...prev]);
    },

    moveContent: async (id, status) => {
      setContent((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      if (supabase) await supabase.from("content_cards").update({ status }).eq("id", id);
    },

    deleteContent: async (id) => {
      setContent((prev) => prev.filter((c) => c.id !== id));
      if (supabase) await supabase.from("content_cards").delete().eq("id", id);
    },

    updateGoal: async (id, patch) => {
      setGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...patch } : g));
      if (supabase) await supabase.from("goals").update(patch).eq("id", id);
    },

    toggleHabit: async (date, key) => {
      const existing = habits.find((h) => h.date === date);
      const next = existing
        ? { ...existing, [key]: !existing[key] }
        : { date, sport:false, content:false, learning:false, sleep:false, plan:false, [key]: true };

      setHabits((prev) => existing ? prev.map((h) => h.date === date ? next : h) : [next, ...prev]);

      if (supabase) {
        await supabase.from("habits").upsert(next, { onConflict: "user_id,date" });
      }
    },

    addLearning: async (entry) => {
      if (supabase) {
        const { data } = await supabase.from("learning_entries").insert(entry).select("*").single();
        if (data) setLearning((prev) => [learningFromDb(data), ...prev]);
        return;
      }
      setLearning((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev]);
    },

    deleteLearning: async (id) => {
      setLearning((prev) => prev.filter((l) => l.id !== id));
      if (supabase) await supabase.from("learning_entries").delete().eq("id", id);
    },

    exportData: () => JSON.stringify({ deals, content, goals, habits, learning }, null, 2),

    importData: (raw) => {
      const data = JSON.parse(raw);
      if (data.deals) setDeals(data.deals.map(normalizeDeal));
      if (data.content) setContent(data.content);
      if (data.goals) setGoals(data.goals);
      if (data.habits) setHabits(data.habits);
      if (data.learning) setLearning(data.learning);
    },

    importDealsCsv: async (raw) => {
      const imported = csvToDeals(raw);
      if (supabase) {
        const { data } = await supabase.from("deals").insert(imported.map(dealToDb)).select("*");
        if (data) setDeals((prev) => [...data.map(dealFromDb).map(normalizeDeal), ...prev]);
        return;
      }
      setDeals((prev) => [...imported.map((d) => normalizeDeal({ ...d, id: crypto.randomUUID() } as Deal)), ...prev]);
    },

    syncFromCloud,

    resetDemo: () => {
      setDeals(initialDeals.map(normalizeDeal));
      setContent(initialContent);
      setGoals(initialGoals);
      setHabits(initialHabits);
      setLearning(initialLearning);
    }
  }), [deals, content, goals, habits, learning, loading, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDeals() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDeals must be used inside DealStoreProvider");
  return ctx;
}
