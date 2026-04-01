import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  PencilSimple,
  Trash,
  X,
  Check,
  Users,
  EnvelopeSimple,
  Phone,
  MagnifyingGlass,
  IdentificationCard,
  MapPin,
  Globe,
  Note,
  UserCircle,
  Briefcase,
  CurrencyCircleDollar,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ClientStatus = "lead" | "active" | "inactive";

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-blue-100 text-blue-700" },
  active: { label: "Aktiv", className: "bg-green-100 text-green-700" },
  inactive: { label: "Joaktiv", className: "bg-neutral-100 text-neutral-500" },
};

const INDUSTRIES = [
  "IT / Teknologji",
  "Ndërtim",
  "Tregtia / Retail",
  "Shëndetësi",
  "Arsim",
  "Financë / Bankë",
  "Transport / Logjistikë",
  "Turizëm / Hoteleri",
  "Bujqësi",
  "Media / Reklamë",
  "Juridik / Konsultencë",
  "Prodhim",
  "Tjetër",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  nipt: "",
  status: "lead" as ClientStatus,
  address: "",
  city: "",
  country: "Shqipëri",
  website: "",
  notes: "",
  contactPerson: "",
  industry: "",
  contractValue: "",
};

export default function Clients() {
  const { addToast, setCurrentView, fmt } = useApp();
  const { data: clients, isPending } = useQuery("Client", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Client");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClientStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = (clients ?? []).filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: typeof clients extends (infer T)[] | undefined ? T : never) => {
    if (!c) return;
    setEditId((c as any).id);
    setForm({
      name: (c as any).name,
      email: (c as any).email,
      phone: (c as any).phone ?? "",
      nipt: (c as any).nipt ?? "",
      status: (c as any).status as ClientStatus,
      address: (c as any).address ?? "",
      city: (c as any).city ?? "",
      country: (c as any).country ?? "Shqipëri",
      website: (c as any).website ?? "",
      notes: (c as any).notes ?? "",
      contactPerson: (c as any).contactPerson ?? "",
      industry: (c as any).industry ?? "",
      contractValue: (c as any).contractValue != null ? String((c as any).contractValue) : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      addToast("Emri dhe email-i janë të detyrueshëm.", "error");
      return;
    }
    try {
      const payload: any = {
        ...form,
        contractValue: form.contractValue !== "" ? parseFloat(form.contractValue) : undefined,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Klienti u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Klienti u shtua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Fshi klientin "${name}"?`)) return;
    try {
      await remove(id);
      addToast(`"${name}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Klientët</h1>
          <p className="text-body-sm font-body text-neutral-500">
            {filtered.length} klient{filtered.length !== 1 ? "ë" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Shto Klient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Kërko klientë..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "lead", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
            >
              {s === "all" ? "Të gjithë" : s === "lead" ? "Lead" : s === "active" ? "Aktiv" : "Joaktiv"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-neutral-100 animate-skeleton-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë klient</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || statusFilter !== "all" ? "Nuk u gjet asnjë klient me këto filtra." : "Shtoni klientin e parë për të filluar."}
          </p>
          {!search && statusFilter === "all" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              Shto Klient
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-body-sm font-body">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Klienti</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden sm:table-cell">Email / Tel</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden md:table-cell">Industria</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden lg:table-cell">Vlera Kontratës</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden lg:table-cell">Qyteti</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Statusi</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, idx) => (
                <tr
                  key={client.id}
                  className={`border-b border-border last:border-0 hover:bg-neutral-50 transition-colors group ${idx % 2 === 0 ? "" : "bg-neutral-50/40"}`}
                >
                  {/* Klienti */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-caption font-medium text-white">
                          {client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        {(client as any).contactPerson && (
                          <p className="text-caption text-neutral-400">{(client as any).contactPerson}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Email / Tel */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <EnvelopeSimple size={12} className="text-neutral-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <Phone size={12} className="text-neutral-400 shrink-0" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Industria */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-neutral-600">
                      {(client as any).industry || <span className="text-neutral-300">—</span>}
                    </span>
                  </td>
                  {/* Vlera Kontratës */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {(client as any).contractValue != null ? (
                      <span className="font-medium text-emerald-600">{fmt(Number((client as any).contractValue))}</span>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  {/* Qyteti */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-neutral-600">
                      {(client as any).city || <span className="text-neutral-300">—</span>}
                    </span>
                  </td>
                  {/* Statusi */}
                  <td className="px-4 py-3">
                    <span className={`text-caption px-2 py-1 rounded-full font-medium ${statusConfig[client.status as ClientStatus]?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                      {statusConfig[client.status as ClientStatus]?.label ?? client.status}
                    </span>
                  </td>
                  {/* Veprime */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          sessionStorage.setItem("compose_clientId", client.id);
                          setCurrentView("emails");
                        }}
                        className="p-1.5 rounded hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Dërgo Email"
                      >
                        <PaperPlaneRight size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(client)}
                        className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                        title="Redakto"
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
                        title="Fshi"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                {editId ? "Redakto Klientin" : "Shto Klient të Ri"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Emri *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Emri i klientit ose kompanisë"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@shembull.com"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Telefoni</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+355 69 000 0000"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">NIPT</label>
                <input
                  type="text"
                  value={form.nipt}
                  onChange={(e) => setForm({ ...form, nipt: e.target.value })}
                  placeholder="K12345678A"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Adresa</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Rruga, Nr."
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Qyteti</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Tiranë"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shteti</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Shqipëri"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Faqja Web</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Personi Kontaktit</label>
                <input
                  type="text"
                  value={(form as any).contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value } as any)}
                  placeholder="p.sh. Ardit Hoxha"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Industria / Sektori</label>
                  <select
                    value={(form as any).industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value } as any)}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">— Zgjidh —</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Vlera Kontratës</label>
                  <input
                    type="number"
                    min="0"
                    value={(form as any).contractValue}
                    onChange={(e) => setForm({ ...form, contractValue: e.target.value } as any)}
                    placeholder="p.sh. 500000"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shënime</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Shënime të brendshme për klientin..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Statusi</label>
                <div className="flex gap-2">
                  {(["lead", "active", "inactive"] as ClientStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${form.status === s ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">
                Anulo
              </Button>
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
