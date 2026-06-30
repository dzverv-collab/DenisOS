import { createClient } from "@supabase/supabase-js";
import { ContentCard, Deal, Goal, HabitLog, LearningEntry } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase = supabaseEnabled ? createClient(url!, anonKey!) : null;

function num(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function maybeDate(value: unknown) {
  return value === null || value === undefined || value === "" ? null : String(value);
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function dealFromDb(row: any): Deal {
  return {
    id: row.id,
    model: text(row.model || row.title, "iPhone"),
    memory: text(row.memory || row.storage, ""),
    color: text(row.color),
    status: text(row.status, "На руках") as Deal["status"],
    source: text(row.source),
    condition: text(row.condition),
    imei: text(row.imei),
    serial: text(row.serial),
    battery: row.battery === null || row.battery === undefined || row.battery === "" ? null : num(row.battery),
    sellerName: text(row.seller_name || row.seller),
    sellerContact: text(row.seller_contact || row.phone),
    salePlatform: text(row.sale_platform, "Авито"),
    boughtFor: num(row.bought_for ?? row.buy_price),
    delivery: num(row.delivery),
    repair: num(row.repair ?? row.repair_cost),
    otherExpenses: num(row.other_expenses),
    plannedSale: num(row.planned_sale),
    soldFor: row.sold_for === null || row.sold_for === undefined ? (row.sell_price === null || row.sell_price === undefined ? null : num(row.sell_price)) : num(row.sold_for),
    purchaseDate: text(row.purchase_date, row.created_at ? String(row.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)),
    listedDate: maybeDate(row.listed_date),
    saleDate: maybeDate(row.sale_date),
    deliveryMethod: text(row.delivery_method),
    trackingNumber: text(row.tracking_number),
    repairStatus: text(row.repair_status, "Не нужен"),
    repairNote: text(row.repair_note),
    note: text(row.note ?? row.notes),
    photos: arrayValue(row.photos),
    statusHistory: arrayValue(row.status_history),
  };
}

export function dealToDb(deal: Partial<Deal>) {
  const row: any = {
    title: deal.model,
    model: deal.model,
    memory: deal.memory,
    storage: deal.memory,
    color: deal.color,
    status: deal.status,
    source: deal.source,
    condition: deal.condition,
    imei: deal.imei,
    serial: deal.serial,
    battery: deal.battery,
    seller_name: deal.sellerName,
    seller: deal.sellerName,
    seller_contact: deal.sellerContact,
    phone: deal.sellerContact,
    sale_platform: deal.salePlatform,
    bought_for: deal.boughtFor,
    buy_price: deal.boughtFor,
    delivery: deal.delivery,
    repair: deal.repair,
    repair_cost: deal.repair,
    other_expenses: deal.otherExpenses,
    planned_sale: deal.plannedSale,
    sold_for: deal.soldFor,
    sell_price: deal.soldFor,
    purchase_date: deal.purchaseDate,
    listed_date: deal.listedDate,
    sale_date: deal.saleDate,
    delivery_method: deal.deliveryMethod,
    tracking_number: deal.trackingNumber,
    repair_status: deal.repairStatus,
    repair_note: deal.repairNote,
    note: deal.note,
    notes: deal.note,
    photos: deal.photos,
    status_history: deal.statusHistory,
    updated_at: new Date().toISOString(),
  };

  Object.keys(row).forEach((key) => row[key] === undefined && delete row[key]);
  return row;
}

export function contentFromDb(row: any): ContentCard {
  return {
    id: row.id,
    title: text(row.title),
    hook: text(row.hook),
    status: text(row.status, "Идея") as ContentCard["status"],
    views: num(row.views),
  };
}

export function goalFromDb(row: any): Goal {
  return {
    id: row.id,
    title: text(row.title),
    type: text(row.type),
    current: num(row.current),
    target: num(row.target),
    unit: text(row.unit),
  };
}

export function habitFromDb(row: any): HabitLog {
  return {
    date: text(row.date),
    sport: Boolean(row.sport),
    content: Boolean(row.content),
    learning: Boolean(row.learning),
    sleep: Boolean(row.sleep),
    plan: Boolean(row.plan),
  };
}

export function learningFromDb(row: any): LearningEntry {
  return {
    id: row.id,
    date: text(row.date),
    title: text(row.title),
    hours: num(row.hours),
    insight: text(row.insight),
  };
}
