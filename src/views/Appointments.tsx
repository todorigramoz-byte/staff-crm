import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  Trash,
  X,
  Check,
  CalendarCheck,
  Clock,
  PencilSimple,
  Note,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const emptyForm = { clientId: "", title: "", scheduledAt: "", notes: "" };

export default function Appointments() {
  const { addToast } = useApp();
  const { data: appointments, isPending } = useQuery("Appointment", { orderBy: { scheduledAt: "asc" } });
  const { data: clients } = useQuery("Client");
  const { create, update, remove, isPending: mutating } = useMutation("Appointment");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]));
  const now = new Date();

  const filtered = (appointments ?? []).filter((a) => {
    const d = new Date(a.scheduledAt);
    if (filter === "upcoming") return d >= now;
    if (filter === "past") return d < now;
    return true;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: any) => {
    setEditId(a.id);
    const dt = new Date(a.scheduledAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ clientId: a.clientId, title: a.title, scheduledAt: local, notes: a.notes ?? "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.clientId || !form.title.trim() || !form.scheduledAt) {
      addToast("Plotëso klientin, titullin dhe datën.", "error");
      return;
    }
    try {
      const payload = {
        clientId: form.clientId,
        title: form.title,
        scheduledAt: new Date(form.scheduledAt),
        notes: form.notes || undefined,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Takimi u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Takimi u krijua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Fshi takimin "${title}"?`)) return;
    try {
      await remove(id);
      addToast(`"${title}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const groupByDate = (list: typeof filtered) => {
    const groups: Record<string, typeof filtered> = {};
    list.forEach((a) => {
      const key = new Date(a.scheduledAt).toLocaleDateString("sq-AL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Takimet</h1>
          <p className="text-body-sm font-body text-neutral-500">{filtered.length} takim/e</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Takim i Ri
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["upcoming", "past", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${filter === f ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
          >
            {f === "upcoming" ? "Të ardhshme" : f === "past" ? "Të kaluara" : "Të gjitha"}
          </button>
        ))}
      </div>

      {/* Content */}
      {isPending ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-neutral-100 animate-skeleton-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <CalendarCheck size={32} className="text-accent" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë takim</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {filter === "upcoming" ? "Nuk keni takime të planifikuara." : "Nuk ka takime të kaluara."}
          </p>
          {filter === "upcoming" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              Takim i Ri
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, appts]) => (
            <div key={date}>
              <h3 className="text-body-sm font-medium text-neutral-500 uppercase tracking-wider font-body mb-3 capitalize">
                {date}
              </h3>
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
                        <p className="text-caption text-neutral-500 font-body">{clientMap[appt.clientId] ?? "Klient i panjohur"}</p>
                        {appt.notes && (
                          <p className="text-caption text-neutral-400 font-body mt-1 flex items-center gap-1">
                            <Note size={12} />
                            {appt.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => openEdit(appt)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                          <PencilSimple size={14} />
                        </button>
                        <button onClick={() => handleDelete(appt.id, appt.title)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? "Redakto Takimin" : "Takim i Ri"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Klienti *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Zgjidh klientin...</option>
                  {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Titulli *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="p.sh. Konsultë fillestare"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Data dhe Ora *</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shenime</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Shënime opsionale..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">Anulo</Button>
              <Button onClick={handleSubmit} disabled={mutating} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                <Check size={16} />
                {mutating ? "Duke ruajtur..." : editId ? "Përditëso" : "Krijo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
