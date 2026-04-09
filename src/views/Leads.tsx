import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  PencilSimple,
  Trash,
  X,
  Check,
  Funnel,
  MagnifyingGlass,
  ArrowRight,
  EnvelopeSimple,
  Phone,
  Buildings,
  UserPlus,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LeadStage = "new" | "contacted" | "negotiation" | "converted";

const stageConfig: Record<LeadStage, { label: string; color: string; bg: string; bar: string }> = {
  new:         { label: "I Ri",      color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   bar: "bg-blue-500" },
  contacted:   { label: "Kontaktuar", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", bar: "bg-violet-500" },
  negotiation: { label: "Negocim",   color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  bar: "bg-amber-500" },
  converted:   { label: "Konvertuar", color: "text-green-700",  bg: "bg-green-50 border-green-200",  bar: "bg-green-500" },
};

const STAGES: LeadStage[] = ["new", "contacted", "negotiation", "converted"];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "",
  stage: "new" as LeadStage,
  notes: "",
};

export default function Leads() {
  const { addToast } = useApp();
  const { data: leads, isPending } = useQuery("Lead", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Lead");
  const { create: createClient, isPending: creatingClient } = useMutation("Client");

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | LeadStage>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = (leads ?? []).filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company ?? "").toLowerCase().includes(q);
    const matchStage = stageFilter === "all" || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (l: any) => {
    setEditId(l.id);
    setForm({
      name: l.name,
      email: l.email,
      phone: l.phone ?? "",
      company: l.company ?? "",
      source: l.source ?? "",
      stage: l.stage as LeadStage,
      notes: l.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      addToast("Emri dhe email-i janë të detyrueshëm.", "error");
      return;
    }
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        source: form.source || undefined,
        stage: form.stage,
        notes: form.notes || undefined,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Lead-i u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Lead-i u shtua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Fshi lead-in "${name}"?`)) return;
    try {
      await remove(id);
      addToast(`"${name}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const handleConvert = async (lead: any) => {
    if (!confirm(`Konverto "${lead.name}" në klient aktiv?`)) return;
    try {
      await createClient({
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? undefined,
        status: "active",
      });
      await update(lead.id, { stage: "converted" });
      addToast(`"${lead.name}" u konvertua në klient!`, "success");
    } catch {
      addToast("Gabim gjatë konvertimit.", "error");
    }
  };

  const stageGroups = STAGES.map((s) => ({
    stage: s,
    items: (leads ?? []).filter((l) => l.stage === s),
  }));

  const totalLeads = leads?.length ?? 0;
  const convertedCount = leads?.filter((l) => l.stage === "converted").length ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Leads</h1>
          <p className="text-body-sm font-body text-neutral-500">
            {totalLeads} lead total · {conversionRate}% konvertim
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Shto Lead
        </Button>
      </div>

      {/* Pipeline summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stageGroups.map(({ stage, items }) => {
          const cfg = stageConfig[stage];
          return (
            <Card
              key={stage}
              onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
              className={`p-4 border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stageFilter === stage ? cfg.bg + " ring-2 ring-offset-1 ring-current" : "bg-white border-border"}`}
            >
              <p className={`text-h3 font-sans font-medium ${cfg.color}`}>{items.length}</p>
              <p className="text-body-sm font-body text-neutral-600">{cfg.label}</p>
              <div className="mt-2 h-1 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cfg.bar} transition-all`}
                  style={{ width: totalLeads > 0 ? `${(items.length / totalLeads) * 100}%` : "0%" }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-6">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Kërko leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Kanban columns */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-neutral-100 animate-skeleton-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STAGES.filter((s) => stageFilter === "all" || s === stageFilter).map((stage) => {
            const cfg = stageConfig[stage];
            const items = filtered.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.bg}`}>
                  <span className={`text-body-sm font-medium font-body ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-caption font-medium px-2 py-0.5 rounded-full bg-white/60 ${cfg.color}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-neutral-200 rounded-lg px-4 py-8 text-center text-caption text-neutral-400 font-body">
                    Asnjë lead
                  </div>
                ) : (
                  items.map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-4 bg-white border border-border rounded-lg hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-body-sm font-medium text-foreground leading-snug">{lead.name}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-1 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                            aria-label="Redakto"
                          >
                            <PencilSimple size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id, lead.name)}
                            className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
                            aria-label="Fshi"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </div>

                      {lead.company && (
                        <div className="flex items-center gap-1.5 text-caption text-neutral-500 font-body mb-1">
                          <Buildings size={12} className="text-neutral-400 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-caption text-neutral-500 font-body mb-1">
                        <EnvelopeSimple size={12} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-caption text-neutral-500 font-body mb-1">
                          <Phone size={12} className="text-neutral-400 shrink-0" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.source && (
                        <p className="text-caption text-neutral-400 font-body mt-1">
                          Burimi: {lead.source}
                        </p>
                      )}

                      {/* Stage selector inline */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {STAGES.filter((s) => s !== lead.stage).map((s) => (
                          <button
                            key={s}
                            onClick={() => update(lead.id, { stage: s })}
                            className="text-caption px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary transition-all cursor-pointer font-body"
                          >
                            → {stageConfig[s].label}
                          </button>
                        ))}
                      </div>

                      {/* Convert button */}
                      {lead.stage !== "converted" && (
                        <button
                          onClick={() => handleConvert(lead)}
                          disabled={creatingClient}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 text-caption font-body transition-all cursor-pointer disabled:opacity-50"
                        >
                          <UserPlus size={13} />
                          Konverto në Klient
                        </button>
                      )}
                    </Card>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setModalOpen(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div
            className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                {editId ? "Redakto Lead-in" : "Shto Lead të Ri"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Emri *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Emri i plotë"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              {/* Email */}
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
              {/* Phone + Company row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+355 69 000 0000"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Kompania</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Emri i kompanisë"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              {/* Source */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Burimi</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">— Zgjidh burimin —</option>
                  <option value="Referim">Referim</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email">Email</option>
                  <option value="Thirrje">Thirrje</option>
                  <option value="Tjetër">Tjetër</option>
                </select>
              </div>
              {/* Stage */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Stadi</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGES.map((s) => {
                    const cfg = stageConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, stage: s })}
                        className={`py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${form.stage === s ? `${cfg.bg} ${cfg.color} border-current font-medium` : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shënime</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Shënime të brendshme..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal"
              >
                Anulo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={mutating}
                className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2"
              >
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
