"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!supabase || !email) return;

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin },
    });

    if (!error) setSent(true);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-slate-500">
        Загрузка Denis OS...
      </div>
    );
  }

  if (!supabaseEnabled) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <div className="text-2xl font-bold">🚀 Denis OS</div>
            <div className="mt-1 text-sm text-slate-300">
              Вход в личную систему
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-bold text-slate-950">
            Войти по email
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Введи email, и Supabase отправит ссылку для входа.
          </p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={signIn}
            className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Отправить ссылку
          </button>

          {sent && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              Ссылка отправлена. Проверь почту.
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function SignOutButton() {
  if (!supabaseEnabled || !supabase) return null;

  return (
    <button
      onClick={() => supabase?.auth.signOut()}
      className="rounded-2xl border border-slate-300 px-3 py-1 text-sm"
    >
      Выйти
    </button>
  );
}