import { Deal } from "./types";

export function rub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value || 0)) + " ₽";
}

export function totalCost(deal: Deal) {
  return Number(deal.boughtFor || 0) + Number(deal.delivery || 0) + Number(deal.repair || 0) + Number(deal.otherExpenses || 0);
}

export function isSold(deal: Deal) {
  const hasSaleAmount = deal.soldFor !== null && deal.soldFor !== undefined && Number(deal.soldFor) > 0;
  if (!hasSaleAmount || deal.status !== "Продан") return false;

  // Для обычной продажи деньги считаются полученными сразу.
  // Для продажи доставкой прибыль фиксируем только после этапа «Забрал».
  if (deal.deliveryMethod === "Доставка") {
    return deal.trackingNumber === "Забрал";
  }

  return true;
}

export function profit(deal: Deal) {
  if (!isSold(deal)) return 0;
  return Number(deal.soldFor || 0) - totalCost(deal);
}

export function roi(deal: Deal) {
  if (!isSold(deal)) return 0;
  const cost = totalCost(deal);
  return cost ? (profit(deal) / cost) * 100 : 0;
}

export function dealAgeDays(deal: Deal) {
  const start = new Date(deal.purchaseDate).getTime();
  const end = deal.saleDate ? new Date(deal.saleDate).getTime() : Date.now();
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function statusValue(deals: Deal[], statuses: string[]) {
  return deals.filter((d) => statuses.includes(d.status)).reduce((s, d) => s + (d.soldFor || d.plannedSale || totalCost(d)), 0);
}

export function dashboardStats(deals: Deal[]) {
  const active = deals.filter((d) => !["Продан", "Возврат"].includes(d.status));
  const sold = deals.filter((d) => d.status === "Продан");
  const moneyInWork = active.reduce((s, d) => s + totalCost(d), 0);
  const expectedValue = active.reduce((s, d) => s + Number(d.plannedSale || totalCost(d) || 0), 0);
  const profitMonth = sold.reduce((s, d) => s + profit(d), 0);
  const avgCycle = sold.length ? sold.reduce((s, d) => s + dealAgeDays(d), 0) / sold.length : 0;
  const inSale = active.filter((d) => ["Выставлен", "Готов"].includes(d.status));
  const inRepair = active.filter((d) => ["У мастера"].includes(d.status));
  const inTransit = active.filter((d) => d.status === "Ко мне едет" || d.status === "В доставке");
  const oldActive = active.filter((d) => dealAgeDays(d) >= 10);
  const readyNotListed = active.filter((d) => ["Готов"].includes(d.status));

  return {
    active,
    sold,
    moneyInWork,
    expectedValue,
    profitMonth,
    activeCount: active.length,
    avgCycle,
    inSale,
    inRepair,
    inTransit,
    oldActive,
    readyNotListed,
    saleValue: inSale.reduce((s, d) => s + Number(d.plannedSale || totalCost(d) || 0), 0),
    repairValue: inRepair.reduce((s, d) => s + Number(d.plannedSale || totalCost(d) || 0), 0),
    transitValue: inTransit.reduce((s, d) => s + Number(d.plannedSale || totalCost(d) || 0), 0)
  };
}
