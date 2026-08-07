"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logoutAction } from "@/lib/auth-actions";

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EventsIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

const links = [
  { href: "/usuarios", label: "Usuários", Icon: UsersIcon },
  { href: "/eventos", label: "Eventos", Icon: EventsIcon },
];

const COLLAPSE_KEY = "adm-sidebar-collapsed";

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_KEY);
    if (stored === "1") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div
      className={`min-h-screen lg:grid ${
        collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[220px_1fr]"
      }`}
    >
      {open ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-text transition-all duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[72px]" : "w-[220px]"}`}
      >
        <div
          className={`border-b border-white/10 py-3 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "flex-col gap-2" : "justify-between gap-2"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green text-sm font-black text-brand-dark">
                C
              </span>
              {!collapsed ? (
                <p className="text-sm font-bold tracking-tight">Confraria</p>
              ) : null}
            </div>

            <button
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-sm hover:bg-white/5 lg:inline-flex"
              onClick={toggleCollapsed}
              title={collapsed ? "Expandir" : "Recolher"}
              type="button"
            >
              {collapsed ? "»" : "«"}
            </button>
          </div>
        </div>

        <nav
          className={`flex flex-1 flex-col gap-1 py-3 ${collapsed ? "px-2" : "px-2.5"}`}
        >
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            const { Icon } = link;
            return (
              <Link
                className={`flex items-center rounded-xl transition ${
                  collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"
                } ${
                  active
                    ? "bg-brand-green text-brand-dark"
                    : "hover:bg-white/5"
                }`}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
                title={link.label}
              >
                <Icon className="shrink-0" />
                {!collapsed ? (
                  <span className="text-sm font-medium">{link.label}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div
          className={`border-t border-white/10 py-3 ${collapsed ? "px-2" : "px-2.5"}`}
        >
          {!collapsed ? (
            <p className="mb-2 truncate px-1 text-xs text-sidebar-muted" title={userName}>
              {userName}
            </p>
          ) : null}
          <form action={logoutAction}>
            <button
              className={`flex w-full items-center rounded-xl border border-white/15 text-sm hover:bg-white/5 ${
                collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"
              }`}
              title="Sair"
              type="submit"
            >
              <LogoutIcon />
              {!collapsed ? <span>Sair</span> : null}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-panel/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            className="btn-secondary"
            onClick={() => setOpen(true)}
            type="button"
          >
            Menu
          </button>
          <span className="text-sm font-bold">Admin Confraria</span>
          <span className="w-16" />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
