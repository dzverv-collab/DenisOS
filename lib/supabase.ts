import { createClient } from "@supabase/supabase-js";
import { ContentCard, Deal, Goal, HabitLog, LearningEntry } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase = supabaseEnabled
  ? createClient(url!, anonKey!)
  : null;

export function dealFromDb(row: any): Deal {
  return {
    id: row.id,
    model: row.model,
    memory: row.memory,
    color: row.color ?? "",
    status: row.status,
    source: row.source ?? "",
    condition: row.condition ?? "",
    imei: row.imei ?? "",
    serial: row.serial ?? "",
    battery: row.battery === null || row.battery === undefined ? null : Number(row.battery),
    sellerName: row.seller_name ?? "",
    sellerContact: row.seller_contact ?? "",
    salePlatform: row.sale_platform ?? "Авито",
    boughtFor: Number(row.bought_for ?? 0),
    delivery: Number(row.delivery ?? 0),
    repair: Number(row.repair ?? 0),
    otherExpenses: Number(row.other_expenses ?? 0),
    plannedSale: Number(row.planned_sale ?? 0),
    soldFor: row.sold_for === null ? null : Number(row.sold_for),
    purchaseDate: row.purchase_date,
    listedDate: row.listed_date ?? null,
    saleDate: row.sale_date,
    deliveryMethod: row.delivery_method ?? "",
    trackingNumber: row.tracking_number ?? "",
    repairStatus: row.repair_status ?? "",
    repairNote: row.repair_note ?? "",
    note: row.note ?? "",
    photos: Array.isArray(row.photos) ? row.photos : [],
    statusHistory: Array.isArray(row.status_history) ? row.status_history : []
  };
}

export function dealToDb(deal: Partial<Deal>) {
  const row: any = {
    model: deal.model,
    memory: deal.memory,
    color: deal.color,
    status: deal.status,
    source: deal.source,
    condition: deal.condition,
    imei: deal.imei,
    serial: deal.serial,
    battery: deal.battery,
    seller_name: deal.sellerName,
    seller_contact: deal.sellerContact,
    sale_platform: deal.salePlatform,
    bought_for: deal.boughtFor,
    delivery: deal.delivery,
    repair: deal.repair,
    other_expenses: deal.otherExpenses,
    planned_sale: deal.plannedSale,
    sold_for: deal.soldFor,
    purchase_date: deal.purchaseDate,
    listed_date: deal.listedDate,
    sale_date: deal.saleDate,
    delivery_method: deal.deliveryMethod,
    tracking_number: deal.trackingNumber,
    repair_status: deal.repairStatus,
    repair_note: deal.repairNote,
    note: deal.note,
    photos: deal.photos,
    status_history: deal.statusHistory
  };
  Object.keys(row).forEach((key) => row[key] === undefined && delete row[key]);
  return row;
}

export function contentFromDb(row: any): ContentCard {
  return {
    id: row.id,
    title: row.title,
    hook: row.hook ?? "",
    status: row.status,
    views: Number(row.views ?? 0)
  };
}

export function goalFromDb(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    type: row.type ?? "",
    current: Number(row.current ?? 0),
    target: Number(row.target ?? 0),
    unit: row.unit ?? ""
  };
}

export function habitFromDb(row: any): HabitLog {
  return {
    date: row.date,
    sport: Boolean(row.sport),
    content: Boolean(row.content),
    learning: Boolean(row.learning),
    sleep: Boolean(row.sleep),
    plan: Boolean(row.plan)
  };
}

export function learningFromDb(row: any): LearningEntry {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    hours: Number(row.hours ?? 0),
    insight: row.insight ?? ""
  };
}
