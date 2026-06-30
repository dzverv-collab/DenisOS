"use client";

import { AppShell } from "@/components/AppShell";
import { Card, KpiCard } from "@/components/Card";
import { useDeals } from "@/components/DealStore";
import { dashboardStats, profit, rub } from "@/lib/calc";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AnalyticsClient() {
  const { deals } = useDeals();
  const stats = dashboardStats(deals);
  const byStatus = ["Ко мне едет", "На руках", "У мастера", "Готов", "Выставлен", "Продан"].map((status) => ({
    status,
    count: deals.filter((d) => d.status === status).length
  }));
  const profitData = deals.map((d, idx) => ({ name: `${idx + 1}`, profit: profit(d) }));

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-sm font-semibold text-emerald-600">Denis OS / Аналитика</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Аналитика</h1>
        <p className="mt-2 text-slate-500">Главные графики: прибыль, статусы, цикл сделки.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Средняя прибыль" value={rub(stats.sold.length ? stats.sold.reduce((s,d)=>s+profit(d),0)/stats.sold.length : 0)} subtitle="По проданным" />
        <KpiCard title="Средний цикл" value={`${stats.avgCycle.toFixed(1)} дня`} subtitle="По проданным" />
        <KpiCard title="В работе" value={String(stats.activeCount)} subtitle="Активные сделки" />
        <KpiCard title="Деньги в обороте" value={rub(stats.moneyInWork)} subtitle="Вложено сейчас" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Прибыль по сделкам</h2>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => rub(Number(value))} />
                <Line dataKey="profit" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Сделки по статусам</h2>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[10,10,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
