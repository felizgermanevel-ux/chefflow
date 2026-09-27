import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const foundations = [
  ["Productos", "Nombre, unidad y precio de compra."],
  ["Organización", "Categorías y zonas de cada cocina."],
  ["Inventarios", "Registros fechados para comparar después."],
];

export default function Home() {
  return (
    <AppShell>
      <section className="max-w-2xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Base del MVP
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          El inventario, más claro y más rápido.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
          ChefFlow está preparado para crear una experiencia de inventario
          simple, pensada para usar con las manos ocupadas y desde una tablet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button">Comenzar configuración</Button>
          <Button type="button" variant="secondary">
            Ver estructura
          </Button>
        </div>
      </section>
      <section
        className="mt-14 grid gap-4 sm:grid-cols-3"
        aria-label="Base preparada"
      >
        {foundations.map(([title, description]) => (
          <article
            key={title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
          >
            <h2 className="font-bold">{title}</h2>
            <p className="mt-2 leading-6 text-[var(--muted)]">{description}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
