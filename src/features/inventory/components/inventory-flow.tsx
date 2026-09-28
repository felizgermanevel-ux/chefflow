"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { inventoryValue } from "@/features/inventory/domain/calculations";

const zones = ["Cámara", "Almacén", "Congelador", "Cocina", "Bar"] as const;
const units = ["kg", "g", "L", "ml", "unidad"] as const;
const storageKey = "chefflow-inventories";

type Zone = (typeof zones)[number];
type Unit = (typeof units)[number];
type Product = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
};
type DraftProduct = Omit<Product, "id">;
type SavedInventory = {
  id: string;
  takenAt: string;
  zone: Zone;
  products: Product[];
  total: number;
};
type Screen = "start" | "zone" | "inventory" | "summary" | "history";
type ValidationErrors = Partial<Record<keyof DraftProduct, string>>;

const emptyProduct: DraftProduct = { name: "", quantity: 1, unit: "kg", unitPrice: 0 };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function readSavedInventories(): SavedInventory[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function InventoryFlow() {
  const [screen, setScreen] = useState<Screen>("start");
  const [zone, setZone] = useState<Zone | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<DraftProduct>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedInventory, setSavedInventory] = useState<SavedInventory | null>(null);
  const [savedInventories, setSavedInventories] = useState<SavedInventory[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [confirmZoneChange, setConfirmZoneChange] = useState(false);

  const total = useMemo(() => inventoryValue(products.map((product) => ({
    productId: product.id,
    quantity: product.quantity,
    unitPrice: product.unitPrice,
  }))), [products]);

  const resetDraft = () => {
    setDraft(emptyProduct);
    setEditingId(null);
    setErrors({});
  };

  const startInventory = () => {
    setProducts([]);
    setZone(null);
    setSavedInventory(null);
    resetDraft();
    setScreen("zone");
  };

  const openHistory = () => {
    setSavedInventories(readSavedInventories().sort((a, b) => b.takenAt.localeCompare(a.takenAt)));
    setScreen("history");
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const product = { ...draft, name: draft.name.trim() };
    const nextErrors: ValidationErrors = {};

    if (!product.name) nextErrors.name = "Escribe el nombre del producto, por ejemplo “Tomate pera”.";
    if (!Number.isFinite(product.quantity) || product.quantity <= 0) nextErrors.quantity = "Indica una cantidad mayor que 0 para poder contar este producto.";
    if (!Number.isFinite(product.unitPrice) || product.unitPrice < 0) nextErrors.unitPrice = "Indica un precio de compra igual o mayor que 0 €.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      setProducts((current) => current.map((item) => (item.id === editingId ? { ...product, id: item.id } : item)));
    } else {
      setProducts((current) => [...current, { ...product, id: crypto.randomUUID() }]);
    }
    resetDraft();
  };

  const editProduct = (product: Product) => {
    setDraft({ name: product.name, quantity: product.quantity, unit: product.unit, unitPrice: product.unitPrice });
    setEditingId(product.id);
    setErrors({});
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveInventory = () => {
    if (!zone || products.length === 0) return;
    const inventory: SavedInventory = { id: crypto.randomUUID(), takenAt: new Date().toISOString(), zone, products, total };
    const updatedInventories = [...readSavedInventories(), inventory];
    window.localStorage.setItem(storageKey, JSON.stringify(updatedInventories));
    setSavedInventories(updatedInventories);
    setSavedInventory(inventory);
    setScreen("summary");
  };

  if (screen === "start") {
    return (
      <AppShell>
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center pb-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Inventario</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Todo bajo control, sin perder tiempo.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">Cuenta tus productos, apunta el precio y conoce el valor de tu cocina al momento.</p>
          <div className="mt-10 flex flex-col gap-3 sm:w-fit sm:flex-row">
            <Button className="min-h-16 text-lg" onClick={startInventory}>+ Nuevo inventario</Button>
            <Button className="min-h-16 text-lg" variant="secondary" onClick={openHistory}>Ver inventarios guardados</Button>
          </div>
        </section>
      </AppShell>
    );
  }

  if (screen === "history") {
    return <HistoryScreen inventories={savedInventories} onBack={() => setScreen("start")} onNewInventory={startInventory} />;
  }

  if (screen === "zone") {
    return (
      <AppShell>
        <section className="mx-auto w-full max-w-2xl">
          <button className="mb-7 font-semibold text-[var(--primary)]" onClick={() => setScreen("start")}>← Volver</button>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Nuevo inventario</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">¿Qué zona vas a contar?</h1>
          <p className="mt-3 text-lg text-[var(--muted)]">Elige una zona para empezar.</p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {zones.map((item) => <button className="min-h-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 text-left text-xl font-bold shadow-sm transition hover:border-[var(--primary)] hover:bg-emerald-50" key={item} onClick={() => { setZone(item); setScreen("inventory"); }}>{item}</button>)}
          </div>
        </section>
      </AppShell>
    );
  }

  if (screen === "summary" && savedInventory) {
    return (
      <AppShell>
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Inventario guardado</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">¡Listo! Tu inventario está guardado.</h1>
          <p className="mt-3 text-lg text-[var(--muted)]">Por ahora se guarda solo en este navegador y en este dispositivo. Puedes consultarlo desde “Inventarios guardados”.</p>
          <dl className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] px-5">
            <SummaryRow label="Zona" value={savedInventory.zone} />
            <SummaryRow label="Fecha" value={formatDate(savedInventory.takenAt)} />
            <SummaryRow label="Productos" value={`${savedInventory.products.length} ${savedInventory.products.length === 1 ? "producto" : "productos"}`} />
            <SummaryRow label="Valor total" value={formatCurrency(savedInventory.total)} emphasized />
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button className="min-h-16 flex-1 text-lg" onClick={startInventory}>Crear otro inventario</Button>
            <Button className="min-h-16 flex-1 text-lg" variant="secondary" onClick={openHistory}>Ver guardados</Button>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-3xl pb-28">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Inventario · {zone}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Añade lo que tienes</h1></div>
          <button className="font-semibold text-[var(--primary)]" onClick={() => products.length > 0 ? setConfirmZoneChange(true) : setScreen("zone")}>Cambiar zona</button>
        </div>
        <form id="product-form" className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6" noValidate onSubmit={submitProduct}>
          <h2 className="text-xl font-bold">{editingId ? "Editar producto" : "Añadir producto"}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Completa los campos para añadir lo que acabas de contar.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={errors.name} className="sm:col-span-2"><input autoFocus aria-describedby={errors.name ? "name-error" : undefined} className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ej. Tomate pera" /><ErrorMessage id="name-error" message={errors.name} /></Field>
            <Field label="Cantidad" error={errors.quantity}><input aria-describedby={errors.quantity ? "quantity-error" : undefined} className="field" type="number" min="0" step="any" inputMode="decimal" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} /><ErrorMessage id="quantity-error" message={errors.quantity} /></Field>
            <Field label="Unidad"><select className="field" value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value as Unit })}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></Field>
            <Field label="Precio de compra (por unidad)" error={errors.unitPrice}><input aria-describedby={errors.unitPrice ? "unit-price-error" : undefined} className="field" type="number" min="0" step="any" inputMode="decimal" value={draft.unitPrice} onChange={(event) => setDraft({ ...draft, unitPrice: Number(event.target.value) })} /><ErrorMessage id="unit-price-error" message={errors.unitPrice} /></Field>
            <div className="rounded-xl bg-emerald-50 px-4 py-3"><p className="text-sm font-semibold text-[var(--muted)]">Valor del producto</p><p className="mt-1 text-xl font-bold text-[var(--primary)]">{formatCurrency(draft.quantity * draft.unitPrice)}</p></div>
          </div>
          <div className="mt-6 flex gap-3"><Button className="flex-1" type="submit">{editingId ? "Guardar cambios" : "Añadir producto"}</Button>{editingId && <Button type="button" variant="secondary" onClick={resetDraft}>Cancelar</Button>}</div>
        </form>
        <section className="mt-7" aria-label="Productos añadidos">
          <div className="flex items-baseline justify-between"><h2 className="text-xl font-bold">Productos ({products.length})</h2><p className="text-xl font-bold text-[var(--primary)]">{formatCurrency(total)}</p></div>
          {products.length === 0 ? <p className="mt-4 rounded-2xl border border-dashed border-[var(--border)] p-6 text-[var(--muted)]">Aún no has añadido productos.</p> : <ul className="mt-4 space-y-3">{products.map((product) => <ProductRow key={product.id} product={product} onEdit={() => editProduct(product)} onDelete={() => setProductToDelete(product)} />)}</ul>}
        </section>
      </section>
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--border)] bg-[var(--background)]/95 p-4 backdrop-blur sm:px-8"><div className="mx-auto flex w-full max-w-3xl items-center gap-4"><div className="min-w-0 flex-1"><p className="text-sm text-[var(--muted)]">Total del inventario</p><p className="text-2xl font-bold">{formatCurrency(total)}</p></div><Button className="min-h-14 shrink-0 text-base" disabled={products.length === 0} onClick={saveInventory}>Guardar inventario</Button></div></div>
      {productToDelete && <ConfirmationDialog title="¿Eliminar este producto?" description={`Vas a eliminar “${productToDelete.name}” del inventario. Esta acción no se puede deshacer.`} confirmLabel="Sí, eliminar" onCancel={() => setProductToDelete(null)} onConfirm={() => { setProducts((current) => current.filter((product) => product.id !== productToDelete.id)); setProductToDelete(null); }} />}
      {confirmZoneChange && <ConfirmationDialog title="¿Cambiar de zona?" description="Los productos que ya has añadido se mantendrán. Comprueba que pertenecen a la nueva zona antes de guardar." confirmLabel="Cambiar zona" onCancel={() => setConfirmZoneChange(false)} onConfirm={() => { setConfirmZoneChange(false); setScreen("zone"); }} />}
    </AppShell>
  );
}

function HistoryScreen({ inventories, onBack, onNewInventory }: { inventories: SavedInventory[]; onBack: () => void; onNewInventory: () => void }) {
  return <AppShell><section className="mx-auto w-full max-w-2xl"><button className="mb-7 font-semibold text-[var(--primary)]" onClick={onBack}>← Volver</button><p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Historial</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Inventarios guardados</h1><p className="mt-3 text-lg text-[var(--muted)]">Disponibles en este navegador y dispositivo.</p>{inventories.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-6"><p className="font-bold">Aún no hay inventarios guardados.</p><p className="mt-2 text-[var(--muted)]">Cuando guardes uno, aparecerá aquí.</p></div> : <ul className="mt-8 space-y-3">{inventories.map((inventory) => <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm" key={inventory.id}><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{inventory.zone}</h2><p className="mt-1 text-[var(--muted)]">{formatDate(inventory.takenAt)} · {inventory.products.length} {inventory.products.length === 1 ? "producto" : "productos"}</p></div><p className="whitespace-nowrap text-lg font-bold text-[var(--primary)]">{formatCurrency(inventory.total)}</p></div></li>)}</ul>}<Button className="mt-8 min-h-16 w-full text-lg sm:w-auto" onClick={onNewInventory}>+ Nuevo inventario</Button></section></AppShell>;
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block font-semibold">{label}</span>{children}{error && <span className="mt-2 block text-sm font-semibold text-red-700">{error}</span>}</label>;
}

function ErrorMessage({ id, message }: { id: string; message?: string }) {
  return message ? <span className="sr-only" id={id}>{message}</span> : null;
}

function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{product.name}</h3><p className="mt-1 text-[var(--muted)]">{product.quantity} {product.unit} · {formatCurrency(product.unitPrice)} / {product.unit}</p></div><p className="whitespace-nowrap text-lg font-bold text-[var(--primary)]">{formatCurrency(product.quantity * product.unitPrice)}</p></div><div className="mt-4 flex gap-4"><button className="font-semibold text-[var(--primary)]" onClick={onEdit}>Editar</button><button className="font-semibold text-red-700" onClick={onDelete}>Eliminar</button></div></li>;
}

function ConfirmationDialog({ title, description, confirmLabel, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return <div aria-labelledby="confirmation-title" aria-modal="true" className="fixed inset-0 z-10 flex items-end bg-black/35 p-4 sm:items-center sm:justify-center" role="dialog"><div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-xl"><h2 className="text-2xl font-bold" id="confirmation-title">{title}</h2><p className="mt-3 leading-6 text-[var(--muted)]">{description}</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="min-h-14" variant="secondary" onClick={onCancel}>Cancelar</Button><Button className="min-h-14 bg-red-700 hover:bg-red-800" onClick={onConfirm}>{confirmLabel}</Button></div></div></div>;
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return <div className="flex items-center justify-between gap-4 py-4"><dt className="text-[var(--muted)]">{label}</dt><dd className={emphasized ? "text-xl font-bold text-[var(--primary)]" : "font-bold"}>{value}</dd></div>;
}
