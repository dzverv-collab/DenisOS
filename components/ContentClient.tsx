"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useDeals } from "@/components/DealStore";
import { ContentCard, ContentStatus } from "@/lib/types";
import { useState } from "react";

const columns: ContentStatus[] = ["Идея", "Снято", "Монтаж", "Запланировано", "Опубликовано"];

export function ContentClient() {
  const { content, addContent, moveContent, deleteContent } = useDeals();
  const [open, setOpen] = useState(false);

  function submit(formData: FormData) {
    const card: Omit<ContentCard, "id"> = {
      title: String(formData.get("title") || "Новый ролик"),
      hook: String(formData.get("hook") || ""),
      status: String(formData.get("status") || "Идея") as ContentStatus,
      views: Number(formData.get("views") || 0)
    };
    addContent(card);
    setOpen(false);
  }

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold text-emerald-600">Denis OS / Контент</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Контент</h1>
          <p className="mt-2 text-slate-500">Канбан-доска роликов от идеи до публикации.</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">＋ Новый ролик</button>
      </div>

      {open && (
        <Card className="mb-6">
          <form action={submit} className="grid gap-3 md:grid-cols-5">
            <input name="title" placeholder="Название ролика" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
            <input name="hook" placeholder="Хук" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <select name="status" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              {columns.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Сохранить</button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <div key={column} className="rounded-3xl bg-white/70 p-4">
            <div className="mb-4 font-bold text-slate-950">{column}</div>
            <div className="space-y-3">
              {content.filter((card) => card.status === column).map((card) => (
                <Card key={card.id} className="p-4">
                  <div className="font-semibold text-slate-950">{card.title}</div>
                  <div className="mt-2 text-sm text-slate-500">{card.hook}</div>
                  <div className="mt-3 text-sm text-slate-500">Просмотры: {card.views.toLocaleString("ru-RU")}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {columns.filter((c) => c !== column).slice(0,2).map((c) => (
                      <button key={c} onClick={() => moveContent(card.id, c)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold">→ {c}</button>
                    ))}
                    <button onClick={() => deleteContent(card.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Удалить</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
