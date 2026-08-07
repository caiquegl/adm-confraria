"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-brand-dark" />
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-green/30 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-primary/40 blur-3xl" />

      <div className="panel-card relative w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green text-base font-black text-brand-dark">
            C
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-dark">
              Admin Confraria
            </h1>
            <p className="text-sm text-muted">Acesso administrativo</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">E-mail</span>
            <input
              autoComplete="email"
              className="field-input"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Senha</span>
            <input
              autoComplete="current-password"
              className="field-input"
              name="password"
              required
              type="password"
            />
          </label>

          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          ) : null}

          <button className="btn-primary w-full" disabled={pending} type="submit">
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
