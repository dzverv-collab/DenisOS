import Link from "next/link";
import { BarChart3, BookOpen, CheckCircle2, Film, Flag, GraduationCap, Home, Settings, Smartphone } from "lucide-react";
import { SignOutButton } from "@/components/AuthGate";

const navGroups = [
  {
    title: "Основное",
    items: [
      { href: "/", label: "Главная", icon: Home, daily: true },
      { href: "/deals", label: "Сделки", icon: Smartphone, daily: true },
      { href: "/analytics", label: "Аналитика", icon: BarChart3, daily: true },
      { href: "/content", label: "Контент", icon: Film }
    ]
  },
  {
    title: "Личная система",
    items: [
      { href: "/habits", label: "Привычки", icon: CheckCircle2 },
      { href: "/goals", label: "Цели", icon: Flag },
      { href: "/learning", label: "Обучение", icon: BookOpen }
    ]
  },
  {
    title: "Система",
    items: [
      { href: "/settings", label: "Настройки", icon: Settings, daily: true }
    ]
  }
];

const nav = navGroups.flatMap((group) => group.items);

export function AppShell({ children }: { children: React.ReactNode }) {
  const dailyNav = nav.filter((item) => item.daily);
  return (
    <div className="min-h-screen bg-transparent pb-24 xl:pb-0">
      <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-72 rounded-[2rem] border border-white/70 bg-white/72 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl xl:block">
        <div className="mb-5 rounded-[1.7rem] bg-slate-950 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)]">
          <div className="text-xl font-black tracking-tight">Denis OS</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">1% better daily</div>
        </div>
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-2 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.title}</div>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-950 hover:text-white">
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4"><SignOutButton /></div>
      </aside>
      <main className="xl:pl-80">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 xl:px-8">{children}</div>
      </main>
      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 rounded-[1.6rem] border border-white/70 bg-white/90 p-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.13)] backdrop-blur-xl xl:hidden">
        {dailyNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center rounded-[1.2rem] px-2 py-2 text-[11px] font-black text-slate-600 active:bg-slate-100">
              <Icon size={19} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
