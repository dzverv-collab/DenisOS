"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useDeals } from "@/components/DealStore";

function fmt(value: number, unit: string) {
  if (unit === "₽") return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
  return new Intl.NumberFormat("ru-RU").format(value) + " " + unit;
}

export function GoalsClient() {
  const { goals, updateGoal } = useDeals();
  const main = goals[0];
  const rest = goals.slice(1);

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-sm font-semibold text-emerald-600">Denis OS / Цели</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Цели</h1>
        <p className="mt-2 text-slate-500">Главная цель, ключевые направления и план недели.</p>
      </div>

      {main && (
        <Card className="mb-6 bg-slate-950 text-white">
          <div className="text-sm text-slate-300">{main.type}</div>
          <div className="mt-2 text-3xl font-bold">{main.title}</div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, (main.current / main.target) * 100)}%` }} />
          </div>
          <div className="mt-3 text-sm text-slate-300">{Math.round((main.current / main.target) * 100)}% выполнено</div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {rest.map((goal) => (
          <Card key={goal.id}>
            <div className="text-sm font-medium text-slate-500">{goal.type}</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{goal.title}</div>
            <div className="mt-4 text-sm text-slate-500">{fmt(goal.current, goal.unit)} / {fmt(goal.target, goal.unit)}</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }} />
            </div>
            <div className="mt-4 flex gap-2">
              <input type="number" defaultValue={goal.current} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" onBlur={(e) => updateGoal(goal.id, { current: Number(e.target.value) })} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-bold text-slate-950">План недели</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Купить 20 телефонов", "Закрыть 15 продаж", "Выпустить 5 роликов", "3 часа обучения"].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">□ {item}</div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
