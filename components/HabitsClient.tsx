"use client";

import { AppShell } from "@/components/AppShell";
import { Card, KpiCard } from "@/components/Card";
import { useDeals } from "@/components/DealStore";

const habitKeys = [
  ["sport", "Спорт"],
  ["content", "Контент"],
  ["learning", "Обучение"],
  ["sleep", "Сон"],
  ["plan", "План"]
] as const;

function today() {
  return new Date().toISOString().slice(0,10);
}

export function HabitsClient() {
  const { habits, toggleHabit } = useDeals();
  const date = today();
  const current = habits.find((h) => h.date === date) ?? { date, sport:false, content:false, learning:false, sleep:false, plan:false };
  const done = habitKeys.filter(([key]) => current[key]).length;
  const percent = Math.round((done / habitKeys.length) * 100);

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-sm font-semibold text-emerald-600">Denis OS / Привычки</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Привычки</h1>
        <p className="mt-2 text-slate-500">Отмечай день одним нажатием.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Сегодня" value={`${percent}%`} subtitle={`${done} из ${habitKeys.length} выполнено`} />
        <KpiCard title="Записей" value={String(habits.length)} subtitle="Дней в системе" />
        <KpiCard title="Фокус" value={percent >= 80 ? "Отлично" : "Нужно добить"} subtitle="Цель — 80%+ каждый день" />
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-bold text-slate-950">Сегодня</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {habitKeys.map(([key, label]) => (
            <button key={key} onClick={() => toggleHabit(date, key)} className={`rounded-3xl p-6 text-left font-bold transition ${current[key] ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
              <div className="text-2xl">{current[key] ? "☑" : "☐"}</div>
              <div className="mt-3">{label}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-bold text-slate-950">Последние дни</h2>
        <div className="mt-4 space-y-2">
          {habits.slice(0,7).map((h) => {
            const p = Math.round((habitKeys.filter(([key]) => h[key]).length / habitKeys.length) * 100);
            return <div key={h.date} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span>{h.date}</span><b>{p}%</b></div>;
          })}
        </div>
      </Card>
    </AppShell>
  );
}
