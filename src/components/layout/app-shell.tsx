import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-10 flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-xl text-white"
        >
          ✦
        </span>
        <div>
          <p className="text-xl font-bold tracking-tight">ChefFlow</p>
          <p className="text-sm text-[var(--muted)]">Inventario de cocina</p>
        </div>
      </header>
      {children}
    </main>
  );
}
