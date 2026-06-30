import { Deal } from "./types";

function esc(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replaceAll('"', '""')}"`;
}

export function dealsToCsv(deals: Deal[]) {
  const headers = ["model","memory","color","status","source","boughtFor","delivery","repair","otherExpenses","plannedSale","soldFor","purchaseDate","saleDate","note"];
  const rows = deals.map((d) => headers.map((h) => esc((d as any)[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function csvToDeals(csv: string): Omit<Deal, "id">[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines.shift()?.split(",").map((h) => h.replace(/^"|"$/g, "")) ?? [];
  return lines.filter(Boolean).map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((v) => v.replace(/^"|"$/g, "").replaceAll('""', '"')) ?? [];
    const obj: any = {};
    headers.forEach((h, i) => obj[h] = values[i] ?? "");
    return {
      model: obj.model || "iPhone",
      memory: obj.memory || "128 GB",
      color: obj.color || "",
      status: obj.status || "На руках",
      source: obj.source || "Импорт",
      boughtFor: Number(obj.boughtFor || 0),
      delivery: Number(obj.delivery || 0),
      repair: Number(obj.repair || 0),
      otherExpenses: Number(obj.otherExpenses || 0),
      plannedSale: Number(obj.plannedSale || 0),
      soldFor: obj.soldFor ? Number(obj.soldFor) : null,
      purchaseDate: obj.purchaseDate || new Date().toISOString().slice(0,10),
      saleDate: obj.saleDate || null,
      note: obj.note || ""
    };
  });
}
