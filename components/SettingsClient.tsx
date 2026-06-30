"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useDeals } from "@/components/DealStore";
import { dealsToCsv } from "@/lib/csv";
import { useState } from "react";

export function SettingsClient() {
  const { deals, exportData, importData, importDealsCsv, resetDemo, cloudReady, loading, syncFromCloud } = useDeals();
  const [backup, setBackup] = useState("");
  const [csv, setCsv] = useState("");

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-sm font-semibold text-emerald-600">Denis OS / Настройки</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Настройки</h1>
        <p className="mt-2 text-slate-500">Резервные копии, импорт и технические параметры.</p>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-slate-950">База данных Supabase</h2>
        <p className="mt-2 text-sm text-slate-500">
          Статус: {cloudReady ? "подключена" : "не подключена — используется сохранение в браузере"}.
        </p>
        <button onClick={syncFromCloud} disabled={!cloudReady || loading} className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">
          {loading ? "Синхронизация..." : "Синхронизировать из базы"}
        </button>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Резервная копия JSON</h2>
          <p className="mt-2 text-sm text-slate-500">Полная копия всех данных.</p>
          <button onClick={() => setBackup(exportData())} className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Сформировать копию</button>
          <textarea value={backup} onChange={(e) => setBackup(e.target.value)} className="mt-4 h-64 w-full rounded-2xl border border-slate-200 p-4 text-xs" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => importData(backup)} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Импортировать JSON</button>
            <button onClick={resetDemo} className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">Сброс демо</button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Импорт / экспорт сделок CSV</h2>
          <p className="mt-2 text-sm text-slate-500">Можно подготовить CSV из Excel и загрузить сделки.</p>
          <button onClick={() => setCsv(dealsToCsv(deals))} className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Экспорт CSV</button>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="mt-4 h-64 w-full rounded-2xl border border-slate-200 p-4 text-xs" placeholder="Вставь CSV сюда" />
          <button onClick={() => importDealsCsv(csv)} className="mt-3 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Импортировать сделки CSV</button>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-bold text-slate-950">Следующий технический шаг</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">1. Supabase/PostgreSQL</div>
          <div className="rounded-2xl bg-slate-50 p-4">2. Авторизация</div>
          <div className="rounded-2xl bg-slate-50 p-4">3. Фото телефонов</div>
          <div className="rounded-2xl bg-slate-50 p-4">4. Vercel deploy</div>
        </div>
      </Card>
    </AppShell>
  );
}
