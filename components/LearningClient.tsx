"use client";

import { AppShell } from "@/components/AppShell";
import { Card, KpiCard } from "@/components/Card";
import { useDeals } from "@/components/DealStore";

export function LearningClient() {
  const { learning, addLearning, deleteLearning } = useDeals();
  const hours = learning.reduce((s, l) => s + Number(l.hours || 0), 0);

  function submit(formData: FormData) {
    addLearning({
      date: String(formData.get("date") || new Date().toISOString().slice(0,10)),
      title: String(formData.get("title") || "Обучение"),
      hours: Number(formData.get("hours") || 0),
      insight: String(formData.get("insight") || "")
    });
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-sm font-semibold text-emerald-600">Denis OS / Обучение</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Обучение</h1>
        <p className="mt-2 text-slate-500">Что изучил, сколько часов и какие выводы сделал.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Всего часов" value={hours.toFixed(1)} subtitle="По всем записям" />
        <KpiCard title="Записей" value={String(learning.length)} subtitle="Материалов изучено" />
        <KpiCard title="Цель месяца" value="40 ч" subtitle="Можно настроить позже" />
      </div>

      <Card className="mt-6">
        <form action={submit} className="grid gap-3 md:grid-cols-5">
          <input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input name="title" placeholder="Что изучал" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input name="hours" type="number" step="0.5" placeholder="Часы" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input name="insight" placeholder="Главный вывод" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Добавить</button>
        </form>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {learning.map((entry) => (
          <Card key={entry.id}>
            <div className="flex justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">{entry.date} · {entry.hours} ч</div>
                <div className="mt-2 text-xl font-bold text-slate-950">{entry.title}</div>
                <p className="mt-3 text-sm text-slate-600">{entry.insight}</p>
              </div>
              <button onClick={() => deleteLearning(entry.id)} className="h-fit rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Удалить</button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
