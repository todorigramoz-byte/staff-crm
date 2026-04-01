import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LangContext";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  Plus,
  PencilSimple,
  Trash,
  X,
  Check,
  MagnifyingGlass,
  EnvelopeSimple,
  Phone,
  Buildings,
  DotsSixVertical,
  CalendarCheck,
  Clock,
  Note,
  Funnel,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LeadStage = "new" | "contacted" | "negotiation" | "converted";
type ActiveTab = "leads" | "appointments";

const STAGES: LeadStage[] = ["new", "contacted", "negotiation", "converted"];

const emptyLeadForm = {
  name: "", email: "", phone: "", company: "", source: "", stage: "new" as LeadStage, notes: "",
};

const emptyApptForm = { clientId: "", title: "", scheduledAt: "", notes: "" };

function DroppableColumn({ stage, children }: { stage: LeadStage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[120px] rounded-lg transition-colors duration-150 ${isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  );
}

function DraggableLeadCard({
  lead, onEdit, onDelete, mutating,
}: {
  lead: any; onEdit: (l: any) => void; onDelete: (id: string, name: string) => void; mutating: boolean;
}) {
  const { t } = useLang();
  const { attributes, listeners, setNodeRef, transform, isDragging: localDragging } = useDraggable({ id: lead.id });
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : {};

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-4 bg-white border border-border rounded-lg transition-all duration-200 group ${localDragging ? "opacity-30 shadow-none" : "hover:shadow-md"}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <button {...listeners} {...attributes} className="p-1 -ml-1 rounded text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing touch-none mt-0.5 shrink-0" aria-label={t("leads_drag")}>
            <DotsSixVertical size={14} weight="bold" />
          </button>
          <p className="text-body-sm font-medium text-foreground leading-snug flex-1">{lead.name}</p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(lead)} className="p-1 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer" aria-label={t("edit")}>
              <PencilSimple size={13} />
            </button>
            <button onClick={() => onDelete(lead.id, lead.name)} className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer" aria-label={t("delete")}>
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
          <p className="text-caption text-neutral-400 font-body mt-1">{t("leads_source")} {lead.source}</p>
        )}
      </Card>
    </div>
  );
}

function GhostCard({ lead }: { lead: any }) {
  return (
    <Card className="p-4 bg-white border-2 border-primary shadow-2xl rounded-lg w-72 rotate-2 opacity-95">
      <p className="text-body-sm font-medium text-foreground leading-snug mb-1">{lead.name}</p>
      {lead.company && (
        <div className="flex items-center gap-1.5 text-caption text-neutral-500 font-body">
          <Buildings size={12} className="text-neutral-400 shrink-0" />
          <span className="truncate">{lead.company}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-caption text-neutral-500 font-body mt-1">
        <EnvelopeSimple size={12} className="text-neutral-400 shrink-0" />
        <span className="truncate">{lead.email}</span>
      </div>
    </Card>
  );
}

export default function Leads() {
  const { addToast } = useApp();
  const { t } = useLang();

  const { data: leads, isPending } = useQuery("Lead", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Lead");

  const { data: appointments, isPending: apptPending } = useQuery("Appointment", { orderBy: { scheduledAt: "asc" } });
  const { data: clients } = useQuery("Client");
  const { create: createAppt, update: updateAppt, remove: removeAppt, isPending: apptMutating } = useMutation("Appointment");

  const [activeTab, setActiveTab] = useState<ActiveTab>("leads");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | LeadStage>("all");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLeadForm);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [apptEditId, setApptEditId] = useState<string | null>(null);
  const [apptForm, setApptForm] = useState(emptyApptForm);
  const [apptFilter, setApptFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const stageConfig: Record<LeadStage, { label: string; color: string; bg: string; bar: string }> = {
    new:         { label: t("leads_stage_new"),         color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     bar: "bg-blue-500" },
    contacted:   { label: t("leads_stage_contacted"),   color: "text-violet-700", bg: "bg-violet-50 border-violet-200", bar: "bg-violet-500" },
    negotiation: { label: t("leads_stage_negotiation"), color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",   bar: "bg-amber-500" },
    converted:   { label: t("leads_stage_converted"),   color: "text-green-700",  bg: "bg-green-50 border-green-200",   bar: "bg-green-500" },
  };

  const filtered = (leads ?? []).filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company ?? "").toLowerCase().includes(q);
    const matchStage = stageFilter === "all" || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const openCreateLead = () => { setEditId(null); setForm(emptyLeadForm); setLeadModalOpen(true); };
  const openEditLead = (l: any) => {
    setEditId(l.id);
    setForm({ name: l.name, email: l.email, phone: l.phone ?? "", company: l.company ?? "", source: l.source ?? "", stage: l.stage as LeadStage, notes: l.notes ?? "" });
    setLeadModalOpen(true);
  };

  const handleLeadSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { addToast(t("leads_required"), "error"); return; }
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone || undefined, company: form.company || undefined, source: form.source || undefined, stage: form.stage, notes: form.notes || undefined };
      if (editId) { await update(editId, payload); addToast(t("leads_saved"), "success"); }
      else { await create(payload); addToast(t("leads_added"), "success"); }
      setLeadModalOpen(false);
    } catch { addToast(t("error_save"), "error"); }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`${t("delete")} "${name}"?`)) return;
    try { await remove(id); addToast(`"${name}" ${t("leads_deleted")}`, "info"); }
    catch { addToast(t("error_delete"), "error"); }
  };

  const handleDragStart = (event: DragStartEvent) => { setActiveDragId(String(event.active.id)); };
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const newStage = String(over.id) as LeadStage;
    const lead = (leads ?? []).find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage || !STAGES.includes(newStage)) return;
    try {
      await update(leadId, { stage: newStage });
      addToast(`"${lead.name}" ${t("leads_moved")} "${stageConfig[newStage].label}"`, "success");
    } catch { addToast(t("error_save"), "error"); }
  };

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]));
  const now = new Date();

  const filteredAppts = (appointments ?? []).filter((a) => {
    const d = new Date(a.scheduledAt);
    if (apptFilter === "upcoming") return d >= now;
    if (apptFilter === "past") return d < now;
    return true;
  });

  const groupByDate = (list: typeof filteredAppts) => {
    const groups: Record<string, typeof filteredAppts> = {};
    list.forEach((a) => {
      const key = new Date(a.scheduledAt).toLocaleDateString("sq-AL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };
  const grouped = groupByDate(filteredAppts);

  const openCreateAppt = () => { setApptEditId(null); setApptForm(emptyApptForm); setApptModalOpen(true); };
  const openEditAppt = (a: any) => {
    setApptEditId(a.id);
    const dt = new Date(a.scheduledAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setApptForm({ clientId: a.clientId, title: a.title, scheduledAt: local, notes: a.notes ?? "" });
    setApptModalOpen(true);
  };

  const handleApptSubmit = async () => {
    if (!apptForm.clientId || !apptForm.title.trim() || !apptForm.scheduledAt) {
      addToast(t("appt_required"), "error"); return;
    }
    try {
      const payload = { clientId: apptForm.clientId, title: apptForm.title, scheduledAt: new Date(apptForm.scheduledAt), notes: apptForm.notes || undefined };
      if (apptEditId) { await updateAppt(apptEditId, payload); addToast(t("appt_saved"), "success"); }
      else { await createAppt(payload); addToast(t("appt_created"), "success"); }
      setApptModalOpen(false);
    } catch { addToast(t("error_save"), "error"); }
  };

  const handleDeleteAppt = async (id: string, title: string) => {
    if (!confirm(`${t("delete")} "${title}"?`)) return;
    try { await removeAppt(id); addToast(`"${title}" ${t("leads_deleted")}`, "info"); }
    catch { addToast(t("error_delete"), "error"); }
  };

  const activeLead = activeDragId ? (leads ?? []).find((l) => l.id === activeDragId) : null;
  const stageGroups = STAGES.map((s) => ({ stage: s, items: (leads ?? []).filter((l) => l.stage === s) }));
  const totalLeads = leads?.length ?? 0;
  const convertedCount = leads?.filter((l) => l.stage === "converted").length ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">{t("leads_title")}</h1>
          <p className="text-body-sm font-body text-neutral-500">
            {totalLeads} lead total · {conversionRate}% {t("leads_conversion")} · {appointments?.length ?? 0} {t("leads_tab_appts").toLowerCase()}
          </p>
        </div>
        <Button
          onClick={activeTab === "leads" ? openCreateLead : openCreateAppt}
          className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          {activeTab === "leads" ? t("leads_add") : t("leads_appt_new")}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-body border-b-2 transition-all -mb-px cursor-pointer ${activeTab === "leads" ? "border-primary text-primary font-medium" : "border-transparent text-neutral-500 hover:text-primary"}`}
        >
          <Funnel size={16} />
          {t("leads_tab_leads")}
          {totalLeads > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-caption ${activeTab === "leads" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"}`}>{totalLeads}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-body border-b-2 transition-all -mb-px cursor-pointer ${activeTab === "appointments" ? "border-primary text-primary font-medium" : "border-transparent text-neutral-500 hover:text-primary"}`}
        >
          <CalendarCheck size={16} />
          {t("leads_tab_appts")}
          {(appointments?.length ?? 0) > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-caption ${activeTab === "appointments" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"}`}>{appointments?.length}</span>
          )}
        </button>
      </div>

      {/* ── LEADS TAB ── */}
      {activeTab === "leads" && (
        <>
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
                    <div className={`h-full rounded-full ${cfg.bar} transition-all`} style={{ width: totalLeads > 0 ? `${(items.length / totalLeads) * 100}%` : "0%" }} />
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-sm mb-6">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={t("leads_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-lg bg-neutral-100 animate-skeleton-pulse" />)}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {STAGES.filter((s) => stageFilter === "all" || s === stageFilter).map((stage) => {
                  const cfg = stageConfig[stage];
                  const items = filtered.filter((l) => l.stage === stage);
                  return (
                    <div key={stage} className="flex flex-col gap-3">
                      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.bg}`}>
                        <span className={`text-body-sm font-medium font-body ${cfg.color}`}>{cfg.label}</span>
                        <span className={`text-caption font-medium px-2 py-0.5 rounded-full bg-white/60 ${cfg.color}`}>{items.length}</span>
                      </div>
                      <DroppableColumn stage={stage}>
                        {items.length === 0 ? (
                          <div className="border-2 border-dashed border-neutral-200 rounded-lg px-4 py-8 text-center text-caption text-neutral-400 font-body">
                            {t("leads_drag_here")}
                          </div>
                        ) : (
                          items.map((lead) => (
                            <DraggableLeadCard
                              key={lead.id}
                              lead={lead}
                              onEdit={openEditLead}
                              onDelete={handleDeleteLead}
                              mutating={mutating}
                            />
                          ))
                        )}
                      </DroppableColumn>
                    </div>
                  );
                })}
              </div>
              <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
                {activeLead ? <GhostCard lead={activeLead} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === "appointments" && (
        <>
          <div className="flex gap-2 mb-6">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setApptFilter(f)}
                className={`px-4 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${apptFilter === f ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
              >
                {f === "upcoming" ? t("appt_upcoming") : f === "past" ? t("appt_past") : t("appt_all")}
              </button>
            ))}
          </div>

          {apptPending ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-neutral-100 animate-skeleton-pulse" />)}</div>
          ) : filteredAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <CalendarCheck size={32} className="text-accent" />
              </div>
              <h2 className="text-h3 font-sans font-medium text-foreground mb-2">{t("appt_none")}</h2>
              <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
                {apptFilter === "upcoming" ? t("appt_none_upcoming") : t("appt_none_past")}
              </p>
              {apptFilter === "upcoming" && (
                <Button onClick={openCreateAppt} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                  <Plus size={18} />
                  {t("leads_appt_new")}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, appts]) => (
                <div key={date}>
                  <h3 className="text-body-sm font-medium text-neutral-500 uppercase tracking-wider font-body mb-3 capitalize">{date}</h3>
                  <div className="space-y-2">
                    {appts.map((appt) => {
                      const isPast = new Date(appt.scheduledAt) < now;
                      return (
                        <Card key={appt.id} className={`p-4 bg-white border border-border rounded-lg flex items-start gap-4 group hover:shadow-md transition-all duration-200 ${isPast ? "opacity-60" : ""}`}>
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex flex-col items-center justify-center shrink-0">
                            <Clock size={18} className="text-accent" />
                            <span className="text-caption text-accent font-medium">
                              {new Date(appt.scheduledAt).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-foreground">{appt.title}</p>
                            <p className="text-caption text-neutral-500 font-body">{clientMap[appt.clientId] ?? t("appt_unknown_client")}</p>
                            {appt.notes && (
                              <p className="text-caption text-neutral-400 font-body mt-1 flex items-center gap-1">
                                <Note size={12} />
                                {appt.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => openEditAppt(appt)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                              <PencilSimple size={14} />
                            </button>
                            <button onClick={() => handleDeleteAppt(appt.id, appt.title)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
                              <Trash size={14} />
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── LEAD MODAL ── */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setLeadModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                {editId ? t("leads_edit_title") : t("leads_add_title")}
              </h2>
              <button onClick={() => setLeadModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_name")}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emri i plotë" className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_email")}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@shembull.com" className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_phone")}</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+355 69 000 0000" className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_company")}</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Emri i kompanisë" className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_source_label")}</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">{t("leads_source_select")}</option>
                  <option value="Referim">Referim</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email">Email</option>
                  <option value="Thirrje">Thirrje</option>
                  <option value="Tjetër">Tjetër</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_stage_label")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGES.map((s) => {
                    const cfg = stageConfig[s];
                    return (
                      <button key={s} onClick={() => setForm({ ...form, stage: s })} className={`py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${form.stage === s ? `${cfg.bg} ${cfg.color} border-current font-medium` : "bg-white text-neutral-600 border-border hover:border-primary"}`}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("leads_notes_label")}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Shënime të brendshme..." rows={3} className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setLeadModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">{t("cancel")}</Button>
              <Button onClick={handleLeadSubmit} disabled={mutating} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                <Check size={16} />
                {mutating ? t("saving") : editId ? t("update") : t("add")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPOINTMENT MODAL ── */}
      {apptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setApptModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">{apptEditId ? t("appt_edit_title") : t("appt_new_title")}</h2>
              <button onClick={() => setApptModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("appt_client")}</label>
                <select value={apptForm.clientId} onChange={(e) => setApptForm({ ...apptForm, clientId: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">{t("appt_client_select")}</option>
                  {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("appt_title")}</label>
                <input type="text" value={apptForm.title} onChange={(e) => setApptForm({ ...apptForm, title: e.target.value })} placeholder={t("appt_title_placeholder")} className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("appt_datetime")}</label>
                <input type="datetime-local" value={apptForm.scheduledAt} onChange={(e) => setApptForm({ ...apptForm, scheduledAt: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("appt_notes")}</label>
                <textarea value={apptForm.notes} onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })} placeholder="Shënime opsionale..." rows={3} className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setApptModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">{t("cancel")}</Button>
              <Button onClick={handleApptSubmit} disabled={apptMutating} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                <Check size={16} />
                {apptMutating ? t("saving") : apptEditId ? t("update") : t("appt_create_btn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
