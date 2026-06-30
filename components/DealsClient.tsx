"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useDeals } from "@/components/DealStore";
import { Deal, DealStatus } from "@/lib/types";
import { dealAgeDays, rub, totalCost } from "@/lib/calc";
import { colors, memories, models, sources, statuses } from "@/lib/options";
import { useMemo, useRef, useState } from "react";

const wizardStatuses: DealStatus[] = [
  "Ко мне едет",
  "На руках",
  "У мастера",
  "Готов",
  "Выставлен",
];
const activeStatuses: DealStatus[] = [
  "Ко мне едет",
  "На руках",
  "У мастера",
  "Готов",
  "Выставлен",
];
const iphoneModels = models.filter((m) => m.startsWith("iPhone"));
const today = () => new Date().toISOString().slice(0, 10);

function displayStatus(status: string) {
  return status === "В доставке" ? "Ко мне едет" : status;
}

function normalizePhoneStatus(status: DealStatus): DealStatus {
  return status === "В доставке" ? "Ко мне едет" : status;
}

type ViewMode = "list" | "table";
type TabMode = "active" | "delivery" | "sold";

type SaleStage =
  | "Все доставки"
  | "Заказ оформлен"
  | "Отправлен"
  | "Ждёт в пункте выдачи"
  | "Забрал"
  | "Возврат"
  | "Едет обратно"
  | "Забрал возврат";
const deliverySaleStages: SaleStage[] = [
  "Заказ оформлен",
  "Отправлен",
  "Ждёт в пункте выдачи",
  "Забрал",
  "Возврат",
  "Едет обратно",
  "Забрал возврат",
];
const activeDeliveryStages: SaleStage[] = [
  "Заказ оформлен",
  "Отправлен",
  "Ждёт в пункте выдачи",
  "Едет обратно",
];
const deliverySaleStartStages: SaleStage[] = ["Заказ оформлен", "Отправлен"];
const saleStageFilters: SaleStage[] = ["Все доставки", ...activeDeliveryStages];

function saleStage(deal: Deal): SaleStage {
  if (deal.status !== "Продан") return "Все доставки";
  if (deal.deliveryMethod !== "Доставка") return "Забрал";
  const stage = deal.trackingNumber as SaleStage;
  if (stage === "Возврат") return "Едет обратно";
  return deliverySaleStages.includes(stage) ? stage : "Заказ оформлен";
}

function saleStageIcon(stage: SaleStage) {
  const icons: Record<string, string> = {
    "Все доставки": "📦",
    "Заказ оформлен": "🛒",
    Отправлен: "📤",
    "Ждёт в пункте выдачи": "📦",
    Забрал: "✅",
    Возврат: "🔄",
    "Едет обратно": "🚚",
    "Забрал возврат": "📦",
  };
  return icons[stage] ?? "📦";
}

function nextSaleStage(stage: SaleStage): SaleStage | null {
  const flow: SaleStage[] = [
    "Заказ оформлен",
    "Отправлен",
    "Ждёт в пункте выдачи",
  ];
  const index = flow.indexOf(stage);
  if (index < 0 || index >= flow.length - 1) return null;
  return flow[index + 1];
}

function isFinalSoldDeal(deal: Deal) {
  if (deal.status !== "Продан" || !deal.soldFor || Number(deal.soldFor) <= 0)
    return false;
  if (deal.deliveryMethod === "Доставка") return saleStage(deal) === "Забрал";
  return true;
}

function isActiveDeliveryDeal(deal: Deal) {
  return (
    deal.status === "Продан" &&
    deal.deliveryMethod === "Доставка" &&
    activeDeliveryStages.includes(saleStage(deal))
  );
}

function dealProfit(deal: Deal) {
  if (!isFinalSoldDeal(deal)) return 0;
  return Number(deal.soldFor || 0) - totalCost(deal);
}

function dealRoi(deal: Deal) {
  if (!isFinalSoldDeal(deal)) return 0;
  const cost = totalCost(deal);
  return cost ? (dealProfit(deal) / cost) * 100 : 0;
}

function saleAmount(deal: Deal) {
  return Number(deal.soldFor || totalCost(deal) || 0);
}

function isDeliverySale(deal: Deal) {
  return deal.status === "Продан" && deal.deliveryMethod === "Доставка";
}

type AddPhoneForm = {
  model: string;
  memory: string;
  color: string;
  battery: string;
  source: string;
  boughtFor: string;
  purchaseDate: string;
  status: DealStatus;
  note: string;
};

const emptyForm = (): AddPhoneForm => ({
  model: iphoneModels[0] ?? "iPhone 11",
  memory: "128 GB",
  color: "Black",
  battery: "",
  source: "Авито",
  boughtFor: "",
  purchaseDate: today(),
  status: "На руках",
  note: "",
});

const statusStyle: Record<string, string> = {
  Новый: "bg-slate-100 text-slate-700 ring-slate-200",
  "Ко мне едет": "bg-amber-50 text-amber-700 ring-amber-100",
  "В доставке": "bg-amber-50 text-amber-700 ring-amber-100",
  "На руках": "bg-sky-50 text-sky-700 ring-sky-100",
  "У мастера": "bg-violet-50 text-violet-700 ring-violet-100",
  Готов: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Выставлен: "bg-orange-50 text-orange-700 ring-orange-100",
  Продан: "bg-slate-100 text-slate-700 ring-slate-200",
  Возврат: "bg-red-50 text-red-700 ring-red-100",
};

const statusDot: Record<string, string> = {
  "Ко мне едет": "bg-amber-400",
  "В доставке": "bg-amber-400",
  "На руках": "bg-sky-400",
  "У мастера": "bg-violet-400",
  Готов: "bg-emerald-400",
  Выставлен: "bg-orange-400",
  Продан: "bg-slate-400",
  Возврат: "bg-red-400",
  Новый: "bg-slate-300",
};

function isActiveDeal(deal: Deal) {
  return !["Продан", "Возврат"].includes(deal.status);
}

function statusPriority(status: DealStatus) {
  const order: Record<string, number> = {
    "Ко мне едет": 1,
    "В доставке": 1,
    "На руках": 2,
    "У мастера": 3,
    Готов: 4,
    Выставлен: 5,
    Продан: 6,
    Возврат: 7,
    Новый: 0,
  };
  return order[status] ?? 99;
}

function ageTone(days: number) {
  if (days <= 7) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (days <= 14) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-red-50 text-red-700 ring-red-100";
}

function nextActionText(status: DealStatus) {
  if (status === "Ко мне едет" || status === "В доставке")
    return "Дождаться доставки и отметить «На руках»";
  if (status === "На руках")
    return "Проверить и решить: к мастеру или готовить к продаже";
  if (status === "У мастера") return "Проконтролировать ремонт и забрать";
  if (status === "Готов") return "Сделать фото и выставить объявление";
  if (status === "Выставлен") return "Отвечать покупателям и следить за ценой";
  if (status === "Продан") return "Сделка закрыта";
  return "Проверить следующий шаг";
}

function getFocusItems(deals: Deal[]) {
  const active = deals.filter(isActiveDeal);
  const ready = active.filter((d) => d.status === "Готов");
  const master = active.filter((d) => d.status === "У мастера");
  const oldListed = active.filter(
    (d) => d.status === "Выставлен" && dealAgeDays(d) >= 7,
  );
  const oldInWork = active.filter((d) => dealAgeDays(d) >= 15);

  const items: string[] = [];
  if (ready.length) items.push(`Сделать фото и выставить: ${ready.length}`);
  if (master.length) items.push(`Проверить у мастера: ${master.length}`);
  if (oldListed.length) items.push(`Давно выставлены: ${oldListed.length}`);
  if (!items.length && oldInWork.length)
    items.push(`Долго в работе: ${oldInWork.length}`);
  if (!items.length && active.length) items.push("Критичных зависаний нет");
  if (!items.length) items.push("Добавь первый телефон");
  return items.slice(0, 3);
}

function statusIcon(status: string) {
  const icons: Record<string, string> = {
    "Ко мне едет": "🚚",
    "В доставке": "🚚",
    "На руках": "📦",
    "У мастера": "🔧",
    Готов: "✅",
    Выставлен: "📸",
    Продан: "💰",
    Возврат: "↩️",
    Новый: "🆕",
  };
  return icons[status] ?? "📍";
}

const lifecycleStatuses: DealStatus[] = [
  "Ко мне едет",
  "На руках",
  "У мастера",
  "Готов",
  "Выставлен",
  "Продан",
];

function nextStatus(status: DealStatus): DealStatus | null {
  const i = lifecycleStatuses.indexOf(status);
  if (i < 0 || i >= lifecycleStatuses.length - 1) return null;
  return lifecycleStatuses[i + 1];
}

function statusNoun(count: number) {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return "телефонов";
  if (n1 === 1) return "телефон";
  if (n1 >= 2 && n1 <= 4) return "телефона";
  return "телефонов";
}

function StatusFlow({
  status,
  compact = false,
  onSelect,
}: {
  status: DealStatus;
  compact?: boolean;
  onSelect?: (status: DealStatus) => void;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${compact ? "overflow-x-auto pb-1" : "flex-wrap"}`}
    >
      {lifecycleStatuses.map((s, index) => {
        const active = s === status;
        const passed = lifecycleStatuses.indexOf(status) >= index;
        return (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(s);
            }}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-black ring-1 transition ${active ? "bg-slate-950 text-white ring-slate-950" : passed ? "bg-slate-100 text-slate-700 ring-slate-200" : "bg-white text-slate-400 ring-slate-200"}`}
            title={s}
          >
            {statusIcon(s)}
          </button>
        );
      })}
    </div>
  );
}

function StatusTimeline({ deal }: { deal: Deal }) {
  const history = deal.statusHistory?.length
    ? deal.statusHistory
    : [{ id: "start", status: deal.status, date: deal.purchaseDate }];
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="mb-3 text-sm font-black text-slate-950">
        История движения
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-slate-100"
          >
            <div className="font-black text-slate-800">
              {statusIcon(item.status)} {displayStatus(item.status)}
            </div>
            <div className="shrink-0 text-xs font-bold text-slate-400">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function withLocalStatusHistory(deal: Deal, status: DealStatus): Deal {
  const date = today();
  const last = deal.statusHistory?.[deal.statusHistory.length - 1];
  if (last?.status === status) return { ...deal, status };
  return {
    ...deal,
    status,
    statusHistory: [
      ...(deal.statusHistory ?? []),
      { id: crypto.randomUUID(), status, date },
    ],
  };
}

function withHistoryEvent(deal: Deal, event: string, date = today()): Deal {
  const last = deal.statusHistory?.[deal.statusHistory.length - 1];
  if (last?.status === event && last.date === date) return deal;
  return {
    ...deal,
    statusHistory: [
      ...(deal.statusHistory ?? []),
      { id: crypto.randomUUID(), status: event, date },
    ],
  };
}

function withDeliveryStageHistory(deal: Deal, stage: SaleStage, date = today()): Deal {
  if (stage === "Все доставки") return deal;
  return withHistoryEvent(deal, `Доставка: ${stage}`, date);
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

function lifecycleStats(deal: Deal) {
  const history = (deal.statusHistory?.length
    ? deal.statusHistory
    : [{ id: "start", status: deal.status, date: deal.purchaseDate }]
  )
    .filter((item) => item.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const endDate = isFinalSoldDeal(deal) && deal.saleDate ? deal.saleDate : today();
  const stats = {
    totalDays: daysBetween(deal.purchaseDate, endDate),
    incomingDays: 0,
    masterDays: 0,
    listedDays: 0,
    deliveryDays: 0,
    returns: 0,
    deliveryAttempts: 0,
  };

  history.forEach((item, index) => {
    const next = history[index + 1];
    const segmentEnd = next?.date ?? endDate;
    const days = daysBetween(item.date, segmentEnd);
    const label = String(item.status);

    if (label === "Ко мне едет" || label === "В доставке") stats.incomingDays += days;
    if (label === "У мастера") stats.masterDays += days;
    if (label === "Выставлен") stats.listedDays += days;
    if (label.startsWith("Доставка:")) stats.deliveryDays += days;
    if (label === "Доставка: Заказ оформлен") stats.deliveryAttempts += 1;
    if (label.includes("Возврат") || label.includes("Едет обратно")) stats.returns += 1;
  });

  return stats;
}

function LifecycleStatsCard({ deal }: { deal: Deal }) {
  const stats = lifecycleStats(deal);
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="mb-3 text-sm font-black text-slate-950">Цикл телефона</div>
      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Всего</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.totalDays} дн.</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Доставки</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.deliveryDays} дн.</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Попыток</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.deliveryAttempts}</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Возвратов</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.returns}</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">У мастера</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.masterDays} дн.</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">В продаже</div>
          <div className="mt-0.5 font-black text-slate-950">{stats.listedDays} дн.</div>
        </div>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-500">Дата покупки не сбрасывается после возврата. Повторные доставки продолжают один общий цикл телефона.</p>
    </div>
  );
}

function StatusOverviewCard({
  status,
  count,
  amount,
  amountLabel,
  active,
  onClick,
}: {
  status: DealStatus;
  count: number;
  amount: number;
  amountLabel: string;
  active: boolean;
  onClick: () => void;
}) {
  const moneyClass =
    status === "Продан"
      ? amount >= 0
        ? "text-emerald-700"
        : "text-red-700"
      : "text-slate-950";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-[1.35rem] p-3 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] active:translate-y-0 ${active ? "bg-slate-950 text-white ring-slate-950" : "bg-white/85 text-slate-950 ring-slate-200/70"}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${active ? "bg-white/10" : "bg-slate-50"}`}
      >
        {statusIcon(status)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-black">{displayStatus(status)}</div>
        <div
          className={`mt-0.5 text-xs font-bold ${active ? "text-slate-300" : "text-slate-500"}`}
        >
          {count} {statusNoun(count)}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={`text-sm font-black ${active ? "text-white" : moneyClass}`}
        >
          {status === "Продан" && amount > 0 ? "+" : ""}
          {rub(amount)}
        </div>
        <div
          className={`mt-0.5 text-[10px] font-black uppercase tracking-wide ${active ? "text-slate-300" : "text-slate-400"}`}
        >
          {amountLabel}
        </div>
      </div>
    </button>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${className}`}
    />
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`min-w-0 rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${active ? "border-slate-950 bg-slate-950 text-white shadow-soft" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

async function readPhotos(files: FileList | null) {
  if (!files?.length) return [];
  return Promise.all(
    Array.from(files)
      .slice(0, 8)
      .map(
        (file, index) =>
          new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                url: String(reader.result),
                name: file.name,
                isMain: index === 0,
              });
            reader.readAsDataURL(file);
          }),
      ),
  );
}

function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyle[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${statusDot[status] ?? "bg-slate-300"}`}
      />
      {displayStatus(status)}
    </span>
  );
}

function AgeBadge({ days }: { days: number }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${ageTone(days)}`}
    >
      ⏳ {days} дн.
    </span>
  );
}

function ProfitBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${positive ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"}`}
    >
      {positive ? "+" : ""}
      {rub(value)}
    </span>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/75 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs font-semibold text-slate-400">{sub}</div>
      ) : null}
    </div>
  );
}

function KpiButton({
  label,
  value,
  sub,
  icon,
  tone = "dark",
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  tone?: "dark" | "green" | "blue" | "amber" | "violet";
  onClick: () => void;
}) {
  const toneClass = {
    dark: "bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]",
    green: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100",
    blue: "bg-sky-50 text-sky-900 ring-1 ring-sky-100",
    amber: "bg-amber-50 text-amber-900 ring-1 ring-amber-100",
    violet: "bg-violet-50 text-violet-900 ring-1 ring-violet-100",
  }[tone];
  const subClass = tone === "dark" ? "text-slate-300" : "text-slate-500";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[1.65rem] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] active:translate-y-0 ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`text-[11px] font-black uppercase tracking-[0.16em] ${subClass}`}
        >
          {label}
        </div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
        {value}
      </div>
      {sub ? (
        <div className={`mt-1 text-xs font-bold ${subClass}`}>{sub}</div>
      ) : null}
    </button>
  );
}

function PhoneThumb({ deal, size = "md" }: { deal: Deal; size?: "sm" | "md" }) {
  const mainPhoto = deal.photos?.find((p) => p.isMain) ?? deal.photos?.[0];
  const cls =
    size === "sm" ? "h-12 w-12 rounded-2xl" : "h-16 w-16 rounded-[1.35rem]";
  if (mainPhoto)
    return (
      <img
        src={mainPhoto.url}
        className={`${cls} shrink-0 object-cover ring-1 ring-slate-200`}
        alt="Фото телефона"
      />
    );
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center bg-slate-100 text-2xl ring-1 ring-slate-200`}
    >
      📱
    </div>
  );
}

function StatusSelect({
  deal,
  onChange,
}: {
  deal: Deal;
  onChange: (status: DealStatus) => void;
}) {
  return (
    <select
      value={deal.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as DealStatus)}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
    >
      {statuses
        .filter((s) => s !== "Новый" && s !== "Возврат")
        .map((s) => (
          <option key={s}>{s}</option>
        ))}
    </select>
  );
}

function SaleStageBadge({ deal }: { deal: Deal }) {
  if (deal.status !== "Продан") return null;
  const stage = saleStage(deal);
  const tone =
    stage === "Забрал"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : stage === "Возврат" || stage === "Едет обратно"
        ? "bg-red-50 text-red-700 ring-red-100"
        : "bg-sky-50 text-sky-700 ring-sky-100";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ${tone}`}
    >
      {saleStageIcon(stage)} {stage}
    </span>
  );
}

function SaleStageActions({
  deal,
  onSaleStage,
  onReturn,
}: {
  deal: Deal;
  onSaleStage: (stage: SaleStage) => void;
  onReturn: () => void;
}) {
  if (!isDeliverySale(deal)) return null;
  const current = saleStage(deal);
  const next = nextSaleStage(current);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {next ? (
        <button
          type="button"
          title={`Следующий этап: ${next}`}
          onClick={(e) => {
            e.stopPropagation();
            onSaleStage(next);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white"
        >
          →
        </button>
      ) : null}

      {current === "Ждёт в пункте выдачи" ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaleStage("Забрал");
            }}
            className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
          >
            ✅ Забрал
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaleStage("Едет обратно");
            }}
            className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100"
          >
            🔄 Возврат
          </button>
        </>
      ) : null}


      {current === "Едет обратно" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReturn();
          }}
          className="rounded-full bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 ring-1 ring-sky-100"
        >
          📦 Забрал возврат
        </button>
      ) : null}

      <details className="relative">
        <summary className="cursor-pointer rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">
          Все этапы
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-1 ring-slate-200">
          {deliverySaleStages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaleStage(stage);
              }}
              className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-xs font-black transition last:mb-0 ${current === stage ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {saleStageIcon(stage)} {stage}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
function DealListRow({
  deal,
  onOpen,
  onEdit,
  onStatus,
  onCloseSale,
  onSaleStage,
  onReturnDelivery,
}: {
  deal: Deal;
  onOpen: () => void;
  onEdit: () => void;
  onStatus: (status: DealStatus) => void;
  onCloseSale: () => void;
  onSaleStage: (stage: SaleStage) => void;
  onReturnDelivery: () => void;
}) {
  const inSales = deal.status === "Продан";
  const closed = isFinalSoldDeal(deal);
  const age = dealAgeDays(deal);
  return (
    <div className="group overflow-hidden rounded-[1.85rem] border border-white/80 bg-white/[0.86] shadow-[0_14px_45px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full min-w-0 items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
      >
        <PhoneThumb deal={deal} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">
                {deal.model}
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-slate-500">
                {deal.color || "цвет —"} · {deal.memory} · 🔋
                {deal.battery ? `${deal.battery}%` : "—"}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={deal.status} />
              {inSales ? <SaleStageBadge deal={deal} /> : null}
            </div>
          </div>
          {inSales ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Вложено
                </div>
                <div className="mt-0.5 font-black text-slate-950">
                  {rub(totalCost(deal))}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Сумма продажи
                </div>
                <div className="mt-0.5 font-black text-slate-950">
                  {rub(Number(deal.soldFor || 0))}
                </div>
              </div>
              {closed ? (
                <>
                  <div
                    className={`rounded-2xl px-3 py-2 ring-1 ${dealProfit(deal) >= 0 ? "bg-emerald-50 ring-emerald-100" : "bg-red-50 ring-red-100"}`}
                  >
                    <div
                      className={`text-[10px] font-black uppercase tracking-wide ${dealProfit(deal) >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      Прибыль
                    </div>
                    <div
                      className={`mt-0.5 font-black ${dealProfit(deal) >= 0 ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {dealProfit(deal) >= 0 ? "+" : ""}
                      {rub(dealProfit(deal))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100">
                    <div className="text-[10px] font-black uppercase tracking-wide text-sky-500">
                      ROI
                    </div>
                    <div className="mt-0.5 font-black text-sky-700">
                      {dealRoi(deal).toFixed(1)}%
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                  <div className="text-[10px] font-black uppercase tracking-wide text-amber-500">
                    Доставка в процессе
                  </div>
                  <div className="mt-0.5 font-black text-amber-700">
                    {saleStage(deal)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)]">
                💰 {rub(totalCost(deal))}
              </span>
              <AgeBadge days={age} />
            </div>
          )}
        </div>
      </button>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100/80 bg-slate-50/50 px-3 py-3 sm:px-4">
        {!inSales ? (
          <StatusFlow status={deal.status} compact onSelect={onStatus} />
        ) : null}
        {!inSales && nextStatus(deal.status) ? (
          <button
            onClick={() => onStatus(nextStatus(deal.status)!)}
            title={`Следующий этап: ${nextStatus(deal.status)}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white"
          >
            →
          </button>
        ) : null}
        {inSales ? (
          <SaleStageActions
            deal={deal}
            onSaleStage={onSaleStage}
            onReturn={onReturnDelivery}
          />
        ) : null}
        <button
          onClick={onOpen}
          className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
        >
          Детали
        </button>
        {!inSales ? (
          <button
            onClick={onCloseSale}
            className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
          >
            Продан
          </button>
        ) : null}
        <button
          onClick={onEdit}
          className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
        >
          Изменить
        </button>
      </div>
    </div>
  );
}

function DealsTable({
  deals,
  onOpen,
  onStatus,
  onCloseSale,
}: {
  deals: Deal[];
  onOpen: (deal: Deal) => void;
  onStatus: (deal: Deal, status: DealStatus) => void;
  onCloseSale: (deal: Deal) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/[0.88] shadow-[0_14px_45px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">АКБ</th>
              <th className="px-4 py-3">Вложено</th>
              <th className="px-4 py-3">Продано</th>
              <th className="px-4 py-3">Прибыль</th>
              <th className="px-4 py-3">ROI</th>
              <th className="px-4 py-3">В работе</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deals.map((deal) => {
              const sold = isFinalSoldDeal(deal);
              return (
                <tr key={deal.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onOpen(deal)}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <PhoneThumb deal={deal} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-black text-slate-950">
                          {deal.model}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-500">
                          {deal.color || "—"} · {deal.memory}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {deal.battery ? `${deal.battery}%` : "—"}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-950">
                    {rub(totalCost(deal))}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {sold ? rub(Number(deal.soldFor || 0)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {sold ? (
                      <ProfitBadge value={dealProfit(deal)} />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-700">
                    {sold ? `${dealRoi(deal).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AgeBadge days={dealAgeDays(deal)} />
                  </td>
                  <td className="px-4 py-3">
                    {sold ? (
                      <StatusBadge status={deal.status} />
                    ) : (
                      <StatusSelect
                        deal={deal}
                        onChange={(status) => onStatus(deal, status)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpen(deal)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        Открыть
                      </button>
                      {!sold ? (
                        <button
                          onClick={() => onCloseSale(deal)}
                          className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                        >
                          Продан
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DealsClient() {
  const { deals, addDeal, updateDeal, updateStatus, deleteDeal } = useDeals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Все статусы");
  const [sort, setSort] = useState("Сначала новые");
  const [tab, setTab] = useState<TabMode>("active");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [batteryFilter, setBatteryFilter] = useState("Все АКБ");
  const [modelFilter, setModelFilter] = useState("Все модели");
  const [memoryFilter, setMemoryFilter] = useState("Все память");
  const [colorFilter, setColorFilter] = useState("Все цвета");
  const [sourceFilter, setSourceFilter] = useState("Все источники");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AddPhoneForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState<Deal | null>(null);
  const [saleForm, setSaleForm] = useState({
    soldFor: "",
    saleDate: today(),
    salePlatform: "Авито",
    saleMethod: "Личная встреча",
    saleStage: "Заказ оформлен" as SaleStage,
    note: "",
  });
  const [saleStageFilter, setSaleStageFilter] =
    useState<SaleStage>("Все доставки");
  const [statusPanelOpen, setStatusPanelOpen] = useState(false);
  const [salesPanelOpen, setSalesPanelOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  function scrollToDealsList() {
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  const activeDeals = useMemo(() => deals.filter(isActiveDeal), [deals]);
  const soldDeals = useMemo(
    () => deals.filter((d) => isFinalSoldDeal(d)),
    [deals],
  );
  const deliveryDeals = useMemo(
    () => deals.filter(isActiveDeliveryDeal),
    [deals],
  );
  const salesDeals = deliveryDeals;
  const focusItems = useMemo(() => getFocusItems(deals), [deals]);

  function needsAttention(deal: Deal) {
    return (
      isActiveDeal(deal) &&
      (deal.status === "Готов" ||
        deal.status === "У мастера" ||
        (deal.status === "Выставлен" && dealAgeDays(deal) >= 7) ||
        dealAgeDays(deal) >= 15)
    );
  }

  const filtered = useMemo(() => {
    let arr = deals;
    if (tab === "active") arr = arr.filter(isActiveDeal);
    if (tab === "delivery") arr = arr.filter(isActiveDeliveryDeal);
    if (tab === "sold") arr = arr.filter(isFinalSoldDeal);
    if (attentionOnly) arr = arr.filter(needsAttention);
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length) {
      arr = arr.filter((d) => {
        const haystack =
          `${d.model} ${d.memory} ${d.color} ${d.battery ?? ""} ${d.source} ${d.salePlatform ?? ""} ${d.deliveryMethod ?? ""} ${d.trackingNumber ?? ""} ${d.note}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      });
    }
    if (modelFilter !== "Все модели")
      arr = arr.filter((d) => d.model === modelFilter);
    if (memoryFilter !== "Все память")
      arr = arr.filter((d) => d.memory === memoryFilter);
    if (colorFilter !== "Все цвета")
      arr = arr.filter((d) => d.color === colorFilter);
    if (sourceFilter !== "Все источники")
      arr = arr.filter((d) => d.source === sourceFilter);
    if (statusFilter !== "Все статусы")
      arr = arr.filter((d) => d.status === statusFilter);
    if (batteryFilter === "100%") arr = arr.filter((d) => d.battery === 100);
    if (batteryFilter === "95%+")
      arr = arr.filter((d) => (d.battery ?? 0) >= 95);
    if (batteryFilter === "90%+")
      arr = arr.filter((d) => (d.battery ?? 0) >= 90);
    if (batteryFilter === "до 89%")
      arr = arr.filter((d) => (d.battery ?? 0) > 0 && (d.battery ?? 0) <= 89);
    if (tab === "delivery" && saleStageFilter !== "Все доставки")
      arr = arr.filter((d) => saleStage(d) === saleStageFilter);
    if (sort === "По вложениям")
      arr = [...arr].sort((a, b) => totalCost(b) - totalCost(a));
    if (sort === "По прибыли")
      arr = [...arr].sort((a, b) => dealProfit(b) - dealProfit(a));
    if (sort === "По ROI")
      arr = [...arr].sort((a, b) => dealRoi(b) - dealRoi(a));
    if (sort === "По сроку в работе")
      arr = [...arr].sort((a, b) => dealAgeDays(b) - dealAgeDays(a));
    if (sort === "По статусу")
      arr = [...arr].sort(
        (a, b) => statusPriority(a.status) - statusPriority(b.status),
      );
    if (sort === "По АКБ")
      arr = [...arr].sort((a, b) => (b.battery ?? 0) - (a.battery ?? 0));
    if (sort === "Сначала старые")
      arr = [...arr].sort(
        (a, b) =>
          new Date(a.purchaseDate).getTime() -
          new Date(b.purchaseDate).getTime(),
      );
    if (sort === "Сначала новые")
      arr = [...arr].sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime(),
      );
    return arr;
  }, [
    deals,
    query,
    modelFilter,
    memoryFilter,
    colorFilter,
    sourceFilter,
    statusFilter,
    sort,
    tab,
    batteryFilter,
    attentionOnly,
    saleStageFilter,
  ]);

  const steps = ["Модель", "Покупка", "Статус", "Дополнительно"];
  const deliveryMoneyInWork = deliveryDeals.reduce((s, d) => s + totalCost(d), 0);
  const deliveryExpectedRevenue = deliveryDeals.reduce((s, d) => s + Number(d.soldFor || 0), 0);
  const deliveryExpectedProfit = deliveryExpectedRevenue - deliveryMoneyInWork;
  const moneyInWork = activeDeals.reduce((s, d) => s + totalCost(d), 0) + deliveryMoneyInWork;
  const readyCount = activeDeals.filter((d) =>
    ["Готов", "Выставлен"].includes(d.status),
  ).length;
  const soldProfit = soldDeals.reduce((s, d) => s + dealProfit(d), 0);
  const avgRoi = soldDeals.length
    ? soldDeals.reduce((s, d) => s + dealRoi(d), 0) / soldDeals.length
    : 0;
  const bestRoi = soldDeals.length
    ? Math.max(...soldDeals.map((d) => dealRoi(d)))
    : 0;
  const avgProfit = soldDeals.length ? soldProfit / soldDeals.length : 0;
  const attentionCount = activeDeals.filter(
    (d) =>
      d.status === "Готов" ||
      d.status === "У мастера" ||
      (d.status === "Выставлен" && dealAgeDays(d) >= 7) ||
      dealAgeDays(d) >= 15,
  ).length;
  const statusOverview = activeStatuses.map((status) => {
    const statusDeals = activeDeals.filter((deal) => normalizePhoneStatus(deal.status) === status);
    return {
      status,
      count: statusDeals.length,
      amount: statusDeals.reduce((sum, deal) => sum + totalCost(deal), 0),
      amountLabel: "вложено",
    };
  });

  const salesOverview = activeDeliveryStages.map((stage) => {
    const stageDeals = deliveryDeals.filter((deal) => saleStage(deal) === stage);
    return {
      stage,
      count: stageDeals.length,
      amount: stageDeals.reduce((sum, deal) => sum + totalCost(deal), 0),
      amountLabel: "вложено",
    };
  });

  function applyStatusOverview(status: DealStatus) {
    setQuery("");
    setModelFilter("Все модели");
    setMemoryFilter("Все память");
    setColorFilter("Все цвета");
    setSourceFilter("Все источники");
    setBatteryFilter("Все АКБ");
    setAttentionOnly(false);
    setStatusFilter(status);
    setTab(status === "Продан" ? "sold" : "active");
    setSaleStageFilter("Все доставки");
    setSort(status === "Продан" ? "По прибыли" : "По вложениям");
    scrollToDealsList();
  }

  function applySaleOverview(stage: SaleStage) {
    setQuery("");
    setModelFilter("Все модели");
    setMemoryFilter("Все память");
    setColorFilter("Все цвета");
    setSourceFilter("Все источники");
    setBatteryFilter("Все АКБ");
    setStatusFilter("Все статусы");
    setAttentionOnly(false);
    setTab("delivery");
    setSaleStageFilter(stage);
    setSort("Сначала новые");
    scrollToDealsList();
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setStep(0);
    setOpen(true);
  }

  function startEdit(deal: Deal) {
    setEditing(deal);
    setForm({
      model: deal.model || iphoneModels[0] || "iPhone 11",
      memory: deal.memory || "128 GB",
      color: deal.color || "Black",
      battery: deal.battery ? String(deal.battery) : "",
      source: deal.source || "Авито",
      boughtFor: deal.boughtFor ? String(deal.boughtFor) : "",
      purchaseDate: deal.purchaseDate || today(),
      status:
        deal.status === "Продан" ? "Выставлен" : deal.status || "На руках",
      note: deal.note || "",
    });
    setStep(0);
    setOpen(true);
    setSelected(null);
  }

  async function savePhone() {
    if (saving) return;
    if (!form.boughtFor || Number(form.boughtFor) <= 0) {
      alert("Укажи сумму, сколько вложено в телефон.");
      return;
    }
    setSaving(true);
    try {
      const photoInput = document.querySelector<HTMLInputElement>(
        'input[name="photos"]',
      );
      const newPhotos = await readPhotos(photoInput?.files ?? null);
      const status = form.status;
      const data: Omit<Deal, "id"> = {
        model: form.model,
        memory: form.memory,
        color: form.color,
        condition: "",
        status,
        source: form.source,
        imei: "",
        serial: "",
        battery: form.battery ? Number(form.battery) : null,
        sellerName: "",
        sellerContact: "",
        salePlatform: "Авито",
        boughtFor: Number(form.boughtFor || 0),
        delivery: editing?.delivery ?? 0,
        repair: editing?.repair ?? 0,
        otherExpenses: editing?.otherExpenses ?? 0,
        plannedSale: editing?.plannedSale ?? 0,
        soldFor: editing?.soldFor ?? null,
        purchaseDate: form.purchaseDate || today(),
        listedDate:
          status === "Выставлен"
            ? (editing?.listedDate ?? today())
            : (editing?.listedDate ?? null),
        saleDate: editing?.saleDate ?? null,
        deliveryMethod: editing?.deliveryMethod ?? "",
        trackingNumber: editing?.trackingNumber ?? "",
        repairStatus: editing?.repairStatus ?? "Не нужен",
        repairNote: editing?.repairNote ?? "",
        note: form.note,
        photos: [...(editing?.photos ?? []), ...newPhotos],
      };

      if (editing) await updateDeal(editing.id, data);
      else await addDeal(data);
      setOpen(false);
      setEditing(null);
      setStep(0);
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  }

  function openCloseDeal(deal: Deal) {
    setClosing(deal);
    setSaleForm({
      soldFor: deal.soldFor ? String(deal.soldFor) : "",
      saleDate: deal.saleDate || today(),
      salePlatform: deal.salePlatform || "Авито",
      saleMethod:
        deal.deliveryMethod === "Доставка" ? "Доставка" : "Личная встреча",
      saleStage:
        saleStage(deal) === "Все доставки" ? "Заказ оформлен" : saleStage(deal),
      note: deal.note || "",
    });
  }

  async function saveCloseDeal() {
    if (!closing) return;
    const soldFor = Number(saleForm.soldFor || 0);
    if (!soldFor) {
      alert("Укажи цену продажи, чтобы закрыть сделку.");
      return;
    }
    const isDelivery = saleForm.saleMethod === "Доставка";
    const deliveryStage = isDelivery ? saleForm.saleStage : "Забрал";
    const finalMoneyReceived = !isDelivery || deliveryStage === "Забрал";
    let closedDeal = withLocalStatusHistory(
      {
        ...closing,
        soldFor,
        saleDate: finalMoneyReceived ? saleForm.saleDate || today() : null,
        salePlatform: saleForm.salePlatform,
        deliveryMethod: isDelivery ? "Доставка" : "Личная встреча",
        trackingNumber: deliveryStage,
        note: saleForm.note,
      },
      "Продан",
    );
    closedDeal = isDelivery
      ? withDeliveryStageHistory(closedDeal, deliveryStage)
      : withHistoryEvent(closedDeal, "Продажа: Личная встреча");
    const patch: Partial<Deal> = {
      status: "Продан",
      soldFor,
      saleDate: finalMoneyReceived ? saleForm.saleDate || today() : null,
      salePlatform: saleForm.salePlatform,
      deliveryMethod: isDelivery ? "Доставка" : "Личная встреча",
      trackingNumber: deliveryStage,
      note: saleForm.note,
      statusHistory: closedDeal.statusHistory,
    };
    await updateDeal(closing.id, patch);
    setClosing(null);
    setTab("sold");
    setSelected((prev) =>
      prev && prev.id === closing.id ? ({ ...prev, ...patch } as Deal) : prev,
    );
  }

  async function quickSaleStage(deal: Deal, stage: SaleStage) {
    if (stage === "Все доставки") return;
    const normalizedStage: SaleStage = stage === "Возврат" ? "Едет обратно" : stage;
    if (normalizedStage === "Забрал возврат") {
      await returnDelivery(deal);
      return;
    }
    const withEvent = withDeliveryStageHistory(
      { ...deal, status: "Продан", deliveryMethod: "Доставка", trackingNumber: normalizedStage },
      normalizedStage,
    );
    const patch: Partial<Deal> = {
      status: "Продан",
      deliveryMethod: "Доставка",
      trackingNumber: normalizedStage,
      saleDate: normalizedStage === "Забрал" ? deal.saleDate || today() : null,
      statusHistory: withEvent.statusHistory,
    };
    await updateDeal(deal.id, patch);
    if (normalizedStage === "Забрал") {
      setTab("sold");
      setSaleStageFilter("Все доставки");
    }
    setSelected((prev) =>
      prev && prev.id === deal.id ? ({ ...prev, ...patch } as Deal) : prev,
    );
  }

  async function returnDelivery(deal: Deal) {
    let returned = withDeliveryStageHistory(deal, "Забрал возврат");
    returned = withLocalStatusHistory(
      {
        ...returned,
        status: "На руках",
        deliveryMethod: "Возврат",
        trackingNumber: "Возврат получен",
        soldFor: null,
        saleDate: null,
        note: [deal.note, `Возврат получен ${today()}`]
          .filter(Boolean)
          .join("\n"),
      },
      "На руках",
    );
    const patch: Partial<Deal> = {
      status: "На руках",
      deliveryMethod: "Возврат",
      trackingNumber: "Возврат получен",
      soldFor: null,
      saleDate: null,
      note: returned.note,
      statusHistory: returned.statusHistory,
    };
    await updateDeal(deal.id, patch);
    setTab("active");
    setSaleStageFilter("Все доставки");
    setSelected((prev) =>
      prev && prev.id === deal.id ? ({ ...prev, ...patch } as Deal) : prev,
    );
  }

  async function quickStatus(deal: Deal, status: DealStatus) {
    status = normalizePhoneStatus(status);
    if (status === "Продан") {
      openCloseDeal(deal);
      return;
    }
    await updateStatus(deal.id, status);
    setSelected((prev) =>
      prev && prev.id === deal.id ? withLocalStatusHistory(prev, status) : prev,
    );
  }

  const activeFilterCount = [
    modelFilter,
    memoryFilter,
    colorFilter,
    sourceFilter,
    statusFilter,
    batteryFilter,
  ].filter((value) => !value.startsWith("Все")).length;

  function resetFilters() {
    setModelFilter("Все модели");
    setMemoryFilter("Все память");
    setColorFilter("Все цвета");
    setSourceFilter("Все источники");
    setStatusFilter("Все статусы");
    setBatteryFilter("Все АКБ");
    setAttentionOnly(false);
    setSaleStageFilter("Все доставки");
  }

  const activeFilterLabels = [
    attentionOnly ? "⚡ Требуют внимания" : null,
    modelFilter !== "Все модели" ? modelFilter : null,
    memoryFilter !== "Все память" ? memoryFilter : null,
    colorFilter !== "Все цвета" ? colorFilter : null,
    sourceFilter !== "Все источники" ? sourceFilter : null,
    statusFilter !== "Все статусы" ? statusFilter : null,
    batteryFilter !== "Все АКБ" ? `🔋 ${batteryFilter}` : null,
  ].filter(Boolean);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="mb-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Denis OS
              </div>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
                Сделки
              </h1>
              <p className="mt-2 text-sm font-bold text-slate-500">
                Деньги, телефоны и статусы — на одном экране.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="shrink-0 rounded-[1.35rem] bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.20)] transition hover:-translate-y-0.5 active:translate-y-0"
            >
              ＋ Добавить
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiButton
              label="Вложено"
              value={rub(moneyInWork)}
              sub={`${activeDeals.length} активных телефонов`}
              icon="💰"
              tone="dark"
              onClick={() => {
                setTab("active");
                setSort("По вложениям");
                setAttentionOnly(false);
              }}
            />
            <KpiButton
              label="Прибыль"
              value={rub(soldProfit)}
              sub={`${soldDeals.length} закрытых · ${deliveryDeals.length} доставок`}
              icon="💚"
              tone="green"
              onClick={() => {
                setTab("sold");
                setSort("По прибыли");
                setAttentionOnly(false);
              }}
            />
            <KpiButton
              label="Средний ROI"
              value={`${avgRoi.toFixed(1)}%`}
              sub={
                soldDeals.length
                  ? `Лучший: ${bestRoi.toFixed(1)}%`
                  : "пока нет продаж"
              }
              icon="📈"
              tone="blue"
              onClick={() => {
                setTab("sold");
                setSort("По ROI");
                setAttentionOnly(false);
              }}
            />
            <KpiButton
              label="В работе"
              value={activeDeals.length}
              sub="актуальные устройства"
              icon="📱"
              tone="violet"
              onClick={() => {
                setTab("active");
                setSort("Сначала новые");
                setAttentionOnly(false);
              }}
            />
            <KpiButton
              label="Внимание"
              value={attentionCount}
              sub={attentionCount ? "нужно проверить" : "всё спокойно"}
              icon="⚡"
              tone="amber"
              onClick={() => {
                setTab("active");
                setSort("По сроку в работе");
                setAttentionOnly(true);
              }}
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[1.75rem] bg-slate-50/70 p-3 ring-1 ring-slate-200/70">
              <div className="mb-2 flex items-end justify-between gap-3 px-1">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Телефоны</div>
                  <div className="mt-0.5 text-sm font-black text-slate-950">{activeDeals.length} в работе · {rub(activeDeals.reduce((sum, deal) => sum + totalCost(deal), 0))}</div>
                </div>
                {statusFilter !== "Все статусы" ? (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Все статусы")}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 ring-1 ring-slate-200"
                  >
                    Сбросить
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {statusOverview.map((item) => {
                  const active = statusFilter === item.status && tab === "active";
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => applyStatusOverview(item.status)}
                      title={`${displayStatus(item.status)} · ${item.count} · ${rub(item.amount)}`}
                      className={`flex min-w-[4.5rem] shrink-0 items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-black ring-1 transition active:scale-[0.98] ${active ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-100"}`}
                    >
                      <span className="text-base">{statusIcon(item.status)}</span>
                      <span>{item.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-50/70 p-3 ring-1 ring-slate-200/70">
              <div className="mb-2 flex items-end justify-between gap-3 px-1">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Доставки</div>
                  <div className="mt-0.5 text-sm font-black text-slate-950">{deliveryDeals.length} в доставках · {rub(deliveryMoneyInWork)} вложено</div>
                </div>
                {saleStageFilter !== "Все доставки" ? (
                  <button
                    type="button"
                    onClick={() => setSaleStageFilter("Все доставки")}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 ring-1 ring-slate-200"
                  >
                    Сбросить
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {salesOverview.map((item) => {
                  const active = saleStageFilter === item.stage && tab === "delivery";
                  return (
                    <button
                      key={item.stage}
                      type="button"
                      onClick={() => applySaleOverview(item.stage)}
                      title={`${item.stage} · ${item.count} · ${rub(item.amount)}`}
                      className={`flex min-w-[4.5rem] shrink-0 items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-black ring-1 transition active:scale-[0.98] ${active ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-100"}`}
                    >
                      <span className="text-base">{saleStageIcon(item.stage)}</span>
                      <span>{item.count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Вложено</div>
                  <div className="mt-0.5 text-sm font-black text-slate-950">{rub(deliveryMoneyInWork)}</div>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Выручка</div>
                  <div className="mt-0.5 text-sm font-black text-slate-950">{rub(deliveryExpectedRevenue)}</div>
                </div>
                <div className={`rounded-2xl px-3 py-2 ring-1 ${deliveryExpectedProfit >= 0 ? "bg-emerald-50 ring-emerald-100" : "bg-red-50 ring-red-100"}`}>
                  <div className={`text-[10px] font-black uppercase tracking-wide ${deliveryExpectedProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>Ожид. прибыль</div>
                  <div className={`mt-0.5 text-sm font-black ${deliveryExpectedProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{deliveryExpectedProfit >= 0 ? "+" : ""}{rub(deliveryExpectedProfit)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {focusItems.map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] bg-white/80 px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200/70"
              >
                {item === "Критичных зависаний нет" ? "✅" : "⚡"} {item}
              </div>
            ))}
          </div>
        </section>

        <div className="sticky top-0 z-20 mb-4 space-y-3 rounded-[1.75rem] border border-white/70 bg-white/85 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 text-sm font-black">
              <button
                onClick={() => { setTab("active"); setStatusFilter("Все статусы"); setSaleStageFilter("Все доставки"); }}
                className={`rounded-xl px-3 py-2 ${tab === "active" ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                Активные
              </button>
              <button
                onClick={() => { setTab("delivery"); setStatusFilter("Все статусы"); setSaleStageFilter("Все доставки"); }}
                className={`rounded-xl px-3 py-2 ${tab === "delivery" ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                Доставки
              </button>
              <button
                onClick={() => { setTab("sold"); setStatusFilter("Все статусы"); setSaleStageFilter("Все доставки"); }}
                className={`rounded-xl px-3 py-2 ${tab === "sold" ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                Проданные
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-sm font-black">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-xl px-3 py-2 ${viewMode === "list" ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                Список
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-xl px-3 py-2 ${viewMode === "table" ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                Таблица
              </button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              placeholder="11 black 128 100"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50"
            >
              ⚙️ Фильтры{activeFilterCount ? ` · ${activeFilterCount}` : ""}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
            >
              <option>Сначала новые</option>
              <option>Сначала старые</option>
              <option>По статусу</option>
              <option>По сроку в работе</option>
              <option>По АКБ</option>
              <option>По вложениям</option>
              <option>По прибыли</option>
              <option>По ROI</option>
            </select>
          </div>
          {tab === "delivery" ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {saleStageFilters.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setSaleStageFilter(stage)}
                  className={`rounded-full px-3 py-2 text-xs font-black transition ${saleStageFilter === stage ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {saleStageIcon(stage)} {stage}
                </button>
              ))}
            </div>
          ) : null}

          {activeFilterLabels.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {activeFilterLabels.map((label) => (
                <span
                  key={String(label)}
                  className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white"
                >
                  {label}
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600"
              >
                Сбросить
              </button>
            </div>
          ) : null}
        </div>

        {filtersOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 p-3 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          >
            <div
              className="fixed inset-x-0 bottom-0 mx-auto max-h-[88vh] max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-soft md:bottom-6 md:rounded-[2rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-400">
                    Быстрый подбор
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Фильтры
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Выбери параметры — Denis OS сразу оставит подходящие
                    телефоны.
                  </p>
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
                >
                  Готово
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Модель
                  </h3>
                  <ChoiceGrid
                    options={["Все модели", ...iphoneModels]}
                    value={modelFilter}
                    onChange={setModelFilter}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Память
                  </h3>
                  <ChoiceGrid
                    options={["Все память", ...memories]}
                    value={memoryFilter}
                    onChange={setMemoryFilter}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Цвет
                  </h3>
                  <ChoiceGrid
                    options={["Все цвета", ...colors]}
                    value={colorFilter}
                    onChange={setColorFilter}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Аккумулятор
                  </h3>
                  <ChoiceGrid
                    options={["Все АКБ", "100%", "95%+", "90%+", "до 89%"]}
                    value={batteryFilter}
                    onChange={setBatteryFilter}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Статус
                  </h3>
                  <ChoiceGrid
                    options={["Все статусы", ...activeStatuses, "Продан"]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Источник
                  </h3>
                  <ChoiceGrid
                    options={["Все источники", ...sources]}
                    value={sourceFilter}
                    onChange={setSourceFilter}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-2 bg-white pt-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white"
                >
                  Показать {filtered.length}
                </button>
              </div>
            </div>
          </div>
        )}

        {open && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
              setEditing(null);
            }}
          >
            <div
              className="mx-auto my-6 max-w-3xl rounded-[2rem] bg-white p-5 shadow-soft md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600">
                    Шаг {step + 1} из {steps.length}
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {editing ? "Редактировать телефон" : "Добавить телефон"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Минимум полей, только рабочие данные.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold"
                >
                  Закрыть
                </button>
              </div>
              <div className="mb-6 grid grid-cols-4 gap-2">
                {steps.map((title, index) => (
                  <div
                    key={title}
                    className={`h-2 rounded-full ${index <= step ? "bg-slate-950" : "bg-slate-100"}`}
                  />
                ))}
              </div>
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Модель
                    </h3>
                    <ChoiceGrid
                      options={iphoneModels}
                      value={form.model}
                      onChange={(model) => setForm((f) => ({ ...f, model }))}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Память
                    </h3>
                    <ChoiceGrid
                      options={memories}
                      value={form.memory}
                      onChange={(memory) => setForm((f) => ({ ...f, memory }))}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Цвет
                    </h3>
                    <ChoiceGrid
                      options={colors}
                      value={form.color}
                      onChange={(color) => setForm((f) => ({ ...f, color }))}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Аккумулятор
                    </h3>
                    <Field
                      value={form.battery}
                      onChange={(battery) =>
                        setForm((f) => ({ ...f, battery }))
                      }
                      type="number"
                      placeholder="Например: 86"
                    />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Источник
                    </h3>
                    <ChoiceGrid
                      options={sources}
                      value={form.source}
                      onChange={(source) => setForm((f) => ({ ...f, source }))}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-lg font-black text-slate-950">
                        Вложено
                      </h3>
                      <Field
                        value={form.boughtFor}
                        onChange={(boughtFor) =>
                          setForm((f) => ({ ...f, boughtFor }))
                        }
                        type="number"
                        placeholder="Например: 11000"
                      />
                    </div>
                    <div>
                      <h3 className="mb-3 text-lg font-black text-slate-950">
                        Дата покупки
                      </h3>
                      <Field
                        value={form.purchaseDate}
                        onChange={(purchaseDate) =>
                          setForm((f) => ({ ...f, purchaseDate }))
                        }
                        type="date"
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="mb-3 text-lg font-black text-slate-950">
                    Где сейчас телефон?
                  </h3>
                  <ChoiceGrid
                    options={wizardStatuses}
                    value={form.status}
                    onChange={(status) =>
                      setForm((f) => ({ ...f, status: status as DealStatus }))
                    }
                  />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Фото
                    </h3>
                    <input
                      name="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Необязательно. Можно добавить позже.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-black text-slate-950">
                      Комментарий
                    </h3>
                    <textarea
                      value={form.note}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, note: e.target.value }))
                      }
                      placeholder="Например: проверить динамики"
                      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}
              <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold disabled:opacity-40"
                >
                  Назад
                </button>
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setStep((s) => Math.min(steps.length - 1, s + 1))
                    }
                    className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white"
                  >
                    Далее
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={savePhone}
                    disabled={saving}
                    className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    {saving ? "Сохраняю..." : "Сохранить телефон"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={listRef} className="scroll-mt-28" />

        {filtered.length ? (
          viewMode === "table" ? (
            <DealsTable
              deals={filtered}
              onOpen={setSelected}
              onStatus={quickStatus}
              onCloseSale={openCloseDeal}
            />
          ) : (
            <div className="grid min-w-0 gap-3 xl:grid-cols-2">
              {filtered.map((deal) => (
                <DealListRow
                  key={deal.id}
                  deal={deal}
                  onOpen={() => setSelected(deal)}
                  onEdit={() => startEdit(deal)}
                  onStatus={(status) => quickStatus(deal, status)}
                  onCloseSale={() => openCloseDeal(deal)}
                  onSaleStage={(stage) => quickSaleStage(deal, stage)}
                  onReturnDelivery={() => returnDelivery(deal)}
                />
              ))}
            </div>
          )
        ) : (
          <Card className="py-12 text-center">
            <div className="text-5xl">📱</div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              Здесь пока пусто
            </h2>
            <p className="mt-2 text-slate-500">
              Добавь телефон или измени фильтр.
            </p>
            <button
              onClick={openAdd}
              className="mt-5 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white"
            >
              ＋ Добавить телефон
            </button>
          </Card>
        )}

        {selected && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="mx-auto my-8 max-w-5xl rounded-[2rem] bg-white p-5 shadow-soft md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black text-slate-950 md:text-4xl">
                    {selected.model}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {selected.color} · {selected.memory} · 🔋
                    {selected.battery || "—"}%
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold"
                >
                  Закрыть
                </button>
              </div>
              {selected.photos?.length ? (
                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  {selected.photos.map((p) => (
                    <img
                      key={p.id}
                      src={p.url}
                      className="h-40 w-full rounded-2xl object-cover"
                      alt="Фото"
                    />
                  ))}
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 md:grid-cols-5">
                <MiniStat label="Вложено" value={rub(totalCost(selected))} />
                <MiniStat
                  label={
                    selected.status === "Продан" && !isFinalSoldDeal(selected)
                      ? "Сумма продажи"
                      : "Продано"
                  }
                  value={
                    selected.status === "Продан"
                      ? rub(Number(selected.soldFor || 0))
                      : "—"
                  }
                />
                <MiniStat
                  label="Прибыль"
                  value={
                    isFinalSoldDeal(selected)
                      ? `${dealProfit(selected) >= 0 ? "+" : ""}${rub(dealProfit(selected))}`
                      : "—"
                  }
                />
                <MiniStat
                  label="ROI"
                  value={
                    isFinalSoldDeal(selected)
                      ? `${dealRoi(selected).toFixed(1)}%`
                      : "—"
                  }
                />
                <MiniStat
                  label="В работе"
                  value={`${dealAgeDays(selected)} дн.`}
                />
              </div>
              <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-4 text-sm font-semibold text-white">
                <b>Следующее действие</b>
                <br />
                {nextActionText(selected.status)}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <b>Покупка</b>
                  <br />
                  {selected.purchaseDate}
                  <br />
                  {rub(selected.boughtFor)}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <b>Источник</b>
                  <br />
                  {selected.source || "—"}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <b>Аккумулятор</b>
                  <br />
                  {selected.battery ? `${selected.battery}%` : "—"}
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {selected.note || "Заметок пока нет"}
              </div>
              <div className="mt-6">
                <LifecycleStatsCard deal={selected} />
              </div>
              <div className="mt-6">
                <StatusTimeline deal={selected} />
              </div>
              {isDeliverySale(selected) ? (
                <div className="mt-6 rounded-[1.5rem] bg-sky-50 p-4 ring-1 ring-sky-100">
                  <div className="mb-3 text-sm font-black text-slate-950">
                    Процесс доставки
                  </div>
                  <SaleStageActions
                    deal={selected}
                    onSaleStage={(stage) => quickSaleStage(selected, stage)}
                    onReturn={() => returnDelivery(selected)}
                  />
                  <p className="mt-3 text-xs font-bold text-sky-700">
                    Сделка попадёт в прибыль только после этапа «Забрал».
                  </p>
                </div>
              ) : null}
              {selected.status !== "Продан" ? (
                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="mb-3 text-sm font-black text-slate-950">
                    Движение по статусам
                  </div>
                  <StatusFlow
                    status={selected.status}
                    onSelect={(s) => quickStatus(selected, s)}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {nextStatus(selected.status) ? (
                      <button
                        onClick={() =>
                          quickStatus(selected, nextStatus(selected.status)!)
                        }
                        title={`Следующий этап: ${nextStatus(selected.status)}`}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white"
                      >
                        →
                      </button>
                    ) : null}
                    {selected.status === "На руках" ? (
                      <button
                        onClick={() => quickStatus(selected, "У мастера")}
                        className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-700"
                      >
                        🔧 Отправить мастеру
                      </button>
                    ) : null}
                    {selected.status === "На руках" ||
                    selected.status === "Готов" ? (
                      <button
                        onClick={() => quickStatus(selected, "Выставлен")}
                        className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-black text-orange-700"
                      >
                        📸 Выставить
                      </button>
                    ) : null}
                    {selected.status === "Выставлен" ? (
                      <button
                        onClick={() => openCloseDeal(selected)}
                        className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
                      >
                        💰 Продать
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => startEdit(selected)}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                >
                  Редактировать
                </button>
                {selected.status !== "Продан" ? (
                  <button
                    onClick={() => openCloseDeal(selected)}
                    className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700"
                  >
                    Закрыть продажу
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    deleteDeal(selected.id);
                    setSelected(null);
                  }}
                  className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {closing && (
          <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => setClosing(null)}
          >
            <div
              className="mx-auto my-10 max-w-xl rounded-[2rem] bg-white p-5 shadow-soft md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600">
                    Закрытие сделки
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {closing.model} {closing.memory}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Укажи цену продажи — Denis OS посчитает прибыль и ROI.
                  </p>
                </div>
                <button
                  onClick={() => setClosing(null)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold"
                >
                  Закрыть
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Как продаётся?
                  </h3>
                  <ChoiceGrid
                    options={["Личная встреча", "Доставка"]}
                    value={saleForm.saleMethod}
                    onChange={(saleMethod) =>
                      setSaleForm((f) => ({
                        ...f,
                        saleMethod,
                        saleStage:
                          saleMethod === "Доставка"
                            ? "Заказ оформлен"
                            : ("Забрал" as SaleStage),
                      }))
                    }
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Сумма продажи
                  </h3>
                  <Field
                    value={saleForm.soldFor}
                    onChange={(soldFor) =>
                      setSaleForm((f) => ({ ...f, soldFor }))
                    }
                    type="number"
                    placeholder="Например: 14500"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Дата
                  </h3>
                  <Field
                    value={saleForm.saleDate}
                    onChange={(saleDate) =>
                      setSaleForm((f) => ({ ...f, saleDate }))
                    }
                    type="date"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Где продан
                  </h3>
                  <ChoiceGrid
                    options={[
                      "Авито",
                      "Telegram",
                      "Магазин",
                      "Перекуп",
                      "Другое",
                    ]}
                    value={saleForm.salePlatform}
                    onChange={(salePlatform) =>
                      setSaleForm((f) => ({ ...f, salePlatform }))
                    }
                  />
                </div>
                {saleForm.saleMethod === "Доставка" ? (
                  <div>
                    <h3 className="mb-2 text-sm font-black text-slate-700">
                      Статус доставки
                    </h3>
                    <ChoiceGrid
                      options={deliverySaleStartStages}
                      value={saleForm.saleStage}
                      onChange={(saleStage) =>
                        setSaleForm((f) => ({
                          ...f,
                          saleStage: saleStage as SaleStage,
                        }))
                      }
                    />
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      Прибыль попадёт в итог только после этапа «Забрал».
                    </p>
                  </div>
                ) : null}
                <div>
                  <h3 className="mb-2 text-sm font-black text-slate-700">
                    Комментарий
                  </h3>
                  <textarea
                    value={saleForm.note}
                    onChange={(e) =>
                      setSaleForm((f) => ({ ...f, note: e.target.value }))
                    }
                    className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-slate-400"
                    placeholder="Необязательно"
                  />
                </div>
              </div>
              {Number(saleForm.soldFor || 0) > 0 ? (
                <div className="mt-5 rounded-[1.5rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <div className="text-xs font-black uppercase tracking-wide text-emerald-500">
                    Расчёт сделки
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="font-bold text-slate-500">Вложено</div>
                      <div className="font-black text-slate-950">
                        {rub(totalCost(closing))}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-500">Продано</div>
                      <div className="font-black text-slate-950">
                        {rub(Number(saleForm.soldFor || 0))}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600">Прибыль</div>
                      <div className="font-black text-emerald-700">
                        {Number(saleForm.soldFor || 0) - totalCost(closing) >= 0
                          ? "+"
                          : ""}
                        {rub(
                          Number(saleForm.soldFor || 0) - totalCost(closing),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm font-black text-sky-700 ring-1 ring-emerald-100">
                    ROI:{" "}
                    {totalCost(closing)
                      ? (
                          ((Number(saleForm.soldFor || 0) -
                            totalCost(closing)) /
                            totalCost(closing)) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setClosing(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={saveCloseDeal}
                  className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white"
                >
                  {saleForm.saleMethod === "Доставка"
                    ? "Создать доставку"
                    : "Закрыть сделку"}
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={openAdd}
          className="fixed bottom-5 right-5 z-40 rounded-[1.5rem] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(15,23,42,0.28)] md:hidden"
        >
          ＋ Телефон
        </button>
      </div>
    </AppShell>
  );
}
