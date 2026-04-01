import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  Trash,
  X,
  Check,
  Package,
  MagnifyingGlass,
  PencilSimple,
  Wrench,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProductType = "produkt" | "shërbim";

const typeConfig: Record<ProductType, { label: string; icon: React.ReactNode; className: string }> = {
  produkt: { label: "Produkt", icon: <Package size={14} />, className: "bg-blue-100 text-blue-700" },
  "shërbim": { label: "Shërbim", icon: <Wrench size={14} />, className: "bg-violet-100 text-violet-700" },
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  type: "shërbim" as ProductType,
  unit: "",
  isActive: true,
};

export default function Products() {
  const { addToast, fmt, currency, setCurrency } = useApp();
  const { data: products, isPending } = useQuery("Product", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Product");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = (products ?? []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const aktive = (products ?? []).filter((p) => p.isActive).length;
  const totalProducts = (products ?? []).filter((p) => p.type === "produkt").length;
  const totalServices = (products ?? []).filter((p) => p.type === "shërbim").length;

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      type: p.type as ProductType,
      unit: p.unit ?? "",
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      addToast("Emri është i detyrueshëm.", "error");
      return;
    }
    if (form.price === "" || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      addToast("Çmimi duhet të jetë një numër valid (0 ose më shumë).", "error");
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        type: form.type,
        unit: form.unit || undefined,
        isActive: form.isActive,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Produkti u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Produkti u shtua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Fshi "${name}"?`)) return;
    try {
      await remove(id);
      addToast(`"${name}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await update(id, { isActive: !current });
    } catch {
      addToast("Gabim.", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Produkte &amp; Shërbime</h1>
          <p className="text-body-sm font-body text-neutral-500">{filtered.length} rekord/e</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Shto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Aktive", value: aktive, color: "text-green-600", bg: "bg-green-50" },
          { label: "Produkte", value: totalProducts, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Shërbime", value: totalServices, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg} border-0 rounded-lg`}>
            <p className="text-caption font-body text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-h3 font-sans font-medium ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Kërko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "produkt", "shërbim"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${typeFilter === t ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
            >
              {t === "all" ? "Të gjitha" : typeConfig[t as ProductType].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-neutral-100 animate-skeleton-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Package size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë produkt</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || typeFilter !== "all" ? "Nuk u gjet asnjë rekord me këto filtra." : "Shtoni produktin ose shërbimin e parë."}
          </p>
          {!search && typeFilter === "all" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              Shto
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Emri</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Lloji</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Çmimi</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Njësia</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Statusi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-body-sm font-medium text-foreground">{p.name}</p>
                      {p.description && <p className="text-caption text-neutral-400 truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-caption px-2.5 py-0.5 rounded-full font-body ${typeConfig[p.type as ProductType]?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                        {typeConfig[p.type as ProductType]?.icon}
                        {typeConfig[p.type as ProductType]?.label ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm font-medium text-foreground">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-500 font-body">{p.unit ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p.id, p.isActive)}
                        className={`text-caption px-2.5 py-0.5 rounded-full font-body transition-colors cursor-pointer ${p.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
                      >
                        {p.isActive ? "Aktiv" : "Joaktiv"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                          <PencilSimple size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? "Redakto" : "Shto Produkt / Shërbim"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type toggle */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Lloji *</label>
                <div className="flex gap-2">
                  {(["produkt", "shërbim"] as ProductType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${form.type === t ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                    >
                      {typeConfig[t].icon}
                      {typeConfig[t].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Emri *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={form.type === "produkt" ? "p.sh. Laptop Dell XPS" : "p.sh. Konsulencë Mujore"}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Përshkrim (opsional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Përshkrim i shkurtër..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              {/* Monedha */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Monedha</label>
                <div className="flex gap-2">
                  {(["EUR", "ALL"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${currency === c ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                    >
                      {c === "EUR" ? "€ Euro" : "L Lekë"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Çmimi ({currency === "EUR" ? "€" : "L"}) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Njësia</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder={form.type === "produkt" ? "copë" : "orë / muaj"}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.isActive ? "bg-primary" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : ""}`} />
                </button>
                <span className="text-body-sm font-body text-neutral-600">{form.isActive ? "Aktiv" : "Joaktiv"}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">Anulo</Button>
              <Button onClick={handleSubmit} disabled={mutating} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                <Check size={16} />
                {mutating ? "Duke ruajtur..." : editId ? "Përditëso" : "Shto"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
