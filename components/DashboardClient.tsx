"use client";

import { AppShell } from "@/components/AppShell";
import { Card, KpiCard } from "@/components/Card";
import { useDeals } from "@/components/DealStore";
import { dashboardStats, dealAgeDays, profit, rub } from "@/lib/calc";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";

export function DashboardClient() {
  const { deals, content, habits } = useDeals();
  const [period, setPeriod] = useState<"Неделя" | "Месяц">("Неделя");
  const stats = dashboardStats(deals);
  const latest = deals.slice(0, 4);
  const contentNotPublished = content.filter((c) => c.status !== "Опубликовано").length;
  const today = new Date().toISOString().slice(0,10);
  const todayHabit = habits.find((h) => h.date === today);
  const habitsDone = todayHabit ? Object.entries(todayHabit).filter(([k,v]) => k !== "date" && v).length : 0;

  const nextStep = useMemo(() => {
    if (stats.readyNotListed.length > 0) return { title: "Выставить готовые телефоны", text: `${stats.readyNotListed.length} устройств готовы, но ещё не работают на продажу.`, href: "/deals", color: "bg-red-50 text-red-700" };
    if (stats.oldActive.length > 0) return { title: "Разморозить зависшие телефоны", text: `${stats.oldActive.length} устройств старше 10 дней. Проверь цену и объявления.`, href: "/deals", color: "bg-amber-50 text-amber-700" };
    if (stats.inRepair.length > 0) return { title: "Ускорить ремонт", text: `В ремонте/у мастера: ${stats.inRepair.length} устройств на ${rub(stats.repairValue)}.`, href: "/deals", color: "bg-blue-50 text-blue-700" };
    return { title: "Держать поток", text: "Критичных затыков нет. Фокус — новые закупки и быстрые продажи.", href: "/deals", color: "bg-emerald-50 text-emerald-700" };
  }, [stats]);

  const profitSeries = useMemo(() => {
    const points = period === "Неделя" ? ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"] : ["1 нед","2 нед","3 нед","4 нед"];
    return points.map((day, i) => ({ day, profit: Math.round((stats.profitMonth / Math.max(points.length, 1)) * (0.6 + i * 0.18)) }));
  }, [period, stats.profitMonth]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-emerald-600">Denis OS Daily</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Главный экран</h1>
          <p className="mt-2 text-slate-500">Открыл → понял → сделал.</p>
        </div>
        <a href="/deals" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-soft">＋ Добавить телефон</a>
      </div>

      <Card className={`mb-6 ${nextStep.color}`}>
        <div className="text-sm font-semibold opacity-80">🎯 Следующий лучший шаг</div>
        <h2 className="mt-2 text-2xl font-bold">{nextStep.title}</h2>
        <p className="mt-2 text-sm leading-6">{nextStep.text}</p>
        <a href={nextStep.href} className="mt-4 inline-flex rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-950">Перейти к сделкам</a>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="💰 Вложено в работу" value={rub(stats.moneyInWork)} subtitle="По себестоимости активных" />
        <KpiCard title="📦 Потенциал продажи" value={rub(stats.expectedValue)} subtitle="По плановым ценам" />
        <KpiCard title="📱 Телефонов в работе" value={String(stats.activeCount)} subtitle="Без проданных и возвратов" />
        <KpiCard title="⏱ Средний цикл" value={`${stats.avgCycle.toFixed(1)} дня`} subtitle="По проданным сделкам" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">📍 Где деньги</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4"><span>Готово/в продаже</span><b>{rub(stats.saleValue)}</b></div>
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4"><span>Ко мне едет</span><b>{rub(stats.transitValue)}</b></div>
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4"><span>Ремонт/мастер</span><b>{rub(stats.repairValue)}</b></div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">📊 Прибыль</h2>
              <p className="text-sm text-slate-500">Период: {period.toLowerCase()}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-1">
              {(["Неделя","Месяц"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${period === p ? "bg-white shadow" : "text-slate-500"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => rub(Number(value))} />
                <Line type="monotone" dataKey="profit" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">📋 Последние телефоны</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {latest.map((deal) => (
              <a href="/deals" key={deal.id} className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{deal.model} {deal.memory}</div>
                    <div className="mt-1 text-sm text-slate-500">{deal.status} · {deal.source}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{dealAgeDays(deal)} дн.</div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Ожидаемая прибыль</div>
                <div className="text-xl font-bold text-emerald-600">{rub(profit(deal))}</div>
              </a>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-slate-950">🧠 Состояние</h2>
          <div className="mt-5 space-y-3 text-sm">
            <a href="/content" className="block rounded-2xl bg-amber-50 p-4 font-medium text-amber-700">Контент в работе: {contentNotPublished}</a>
            <a href="/habits" className="block rounded-2xl bg-emerald-50 p-4 font-medium text-emerald-700">Привычки сегодня: {habitsDone}/5</a>
            <a href="/deals" className="block rounded-2xl bg-slate-100 p-4 font-medium text-slate-700">Сделки старше 10 дней: {stats.oldActive.length}</a>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
