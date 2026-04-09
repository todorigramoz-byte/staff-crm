import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  FolderOpen,
  ArrowRight,
  CalendarBlank,
  Briefcase,
  Buildings,
  PencilSimple,
  CheckCircle,
  Plus,
  Trash,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type CvSession = {
  id: string;
  jobTitle: string;
  companyName: string;
  openedAt: string; // ISO string
  notes: string;
};

const STORAGE_KEY = "cvTrackerSessions";

function loadSessions(): CvSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveSessions(list: CvSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sq-AL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "tani";
  if (m < 60) return `${m} min më parë`;
  if (h < 24) return `${h} orë më parë`;
  const d = Math.floor(h / 24);
  return `${d} ditë më parë`;
}

export default function CvTracker() {
  const { addToast } = useApp();

  const [sessions, setSessions] = useState<CvSession[]>(loadSessions);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ jobTitle: "", companyName: "", openedAt: "", notes: "" });

  const lastSession = sessions.length > 0
    ? sessions.reduce((a, b) => a.openedAt > b.openedAt ? a : b)
    : null;

  const history = [...sessions]
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
    .filter((s) => s.id !== lastSession?.id);

  const openNew = () => {
    setEditId(null);
    const now = new Date();
    now.setSeconds(0, 0);
    setForm({ jobTitle: "", companyName: "", openedAt: now.toISOString().slice(0, 16), notes: "" });
    setShowModal(true);
  };

  const openEdit = (s: CvSession) => {
    setEditId(s.id);
    setForm({
      jobTitle: s.jobTitle,
      companyName: s.companyName,
      openedAt: s.openedAt.slice(0, 16),
      notes: s.notes,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.jobTitle.trim()) {
      addToast("Pozicioni i punës është i detyrueshëm", "error");
      return;
    }
    let updated: CvSession[];
    if (editId) {
      updated = sessions.map((s) =>
        s.id === editId
          ? { ...s, jobTitle: form.jobTitle.trim(), companyName: form.companyName.trim(), openedAt: new Date(form.openedAt).toISOString(), notes: form.notes }
          : s
      );
      addToast("Regjistrimi u përditësua", "success");
    } else {
      const newS: CvSession = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        jobTitle: form.jobTitle.trim(),
        companyName: form.companyName.trim(),
        openedAt: new Date(form.openedAt).toISOString(),
        notes: form.notes,
      };
      updated = [newS, ...sessions];
      addToast("U regjistrua puna e re", "success");
    }
    setSessions(updated);
    saveSessions(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    addToast("Regjistrimi u fshi", "info");
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground mb-1">CV Tracker</h1>
          <p className="text-body-sm font-body text-neutral-500">
            Kujto se ku ndalu kur hap CV&#39;të manualisht
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2 shrink-0"
        >
          <Plus size={16} weight="bold" />
          Regjistro Punën
        </Button>
      </div>

      {/* LAST OPENED — big prominent card */}
      {lastSession ? (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-100 text-caption font-body uppercase tracking-widest mb-2 flex items-center gap-2">
                <Clock size={14} weight="bold" />
                Ku ndala herën e fundit
              </p>
              <h2 className="text-2xl font-bold font-sans mb-1 leading-tight">
                {lastSession.jobTitle}
              </h2>
              {lastSession.companyName && (
                <p className="text-blue-100 font-body flex items-center gap-1.5 mb-3">
                  <Buildings size={15} weight="regular" />
                  {lastSession.companyName}
                </p>
              )}
              <div className="flex items-center gap-2 text-blue-100 text-body-sm font-body">
                <CalendarBlank size={15} weight="regular" />
                <span>{formatDateTime(lastSession.openedAt)}</span>
                <span className="opacity-60">({timeAgo(lastSession.openedAt)})</span>
              </div>
              {lastSession.notes && (
                <p className="mt-3 text-blue-100 text-body-sm font-body bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                  {lastSession.notes}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => openEdit(lastSession)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Ndrysho"
              >
                <PencilSimple size={16} weight="bold" className="text-white" />
              </button>
              <button
                onClick={openNew}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Regjistro tjetrën"
              >
                <ArrowRight size={16} weight="bold" className="text-white" />
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={openNew}
              className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-sans font-semibold text-body-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} weight="bold" />
              Regjistro Punën Tjetër
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FolderOpen size={32} weight="duotone" className="text-blue-400" />
          </div>
          <h3 className="text-h4 font-sans font-medium text-foreground mb-2">Asnjë punë e regjistruar</h3>
          <p className="text-body-sm text-neutral-500 font-body mb-5 max-w-xs">
            Kur fillon të hapësh CV&#39;të, regjistro pozicionin dhe kompaninë këtu — nesër do ta dish saktësisht ku ndalu.
          </p>
          <Button
            onClick={openNew}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2"
          >
            <Plus size={16} weight="bold" />
            Regjistro Punën e Parë
          </Button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-caption font-body font-medium text-neutral-400 uppercase tracking-wider mb-3">
            Historiku i mëparshëm
          </p>
          <div className="space-y-2">
            {history.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3 group hover:border-neutral-300 transition-colors"
              >
                <div className="p-2 rounded-lg bg-neutral-100 shrink-0">
                  <Briefcase size={16} weight="duotone" className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground font-sans truncate">{s.jobTitle}</p>
                  <p className="text-caption text-neutral-400 font-body flex items-center gap-1.5">
                    {s.companyName && <><Buildings size={11} />{s.companyName} · </>}
                    <CalendarBlank size={11} />
                    {formatShort(s.openedAt)}
                    <span className="opacity-60">({timeAgo(s.openedAt)})</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition-colors"
                    title="Ndrysho"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Fshi"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                {editId ? "Ndrysho Regjistrimin" : "Ku ndala tani?"}
              </h2>
              <p className="text-caption text-neutral-500 font-body mt-0.5">
                {editId ? "Përditëso të dhënat" : "Shëno pozicionin dhe kompaninë e fundit"}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-neutral-700 mb-1.5 font-body">
                  Pozicioni i Punës <span className="text-error">*</span>
                </label>
                <input
                  autoFocus
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="p.sh. Inxhinier Software"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-body font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-neutral-700 mb-1.5 font-body">
                  Kompania
                </label>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="p.sh. Tech SH.P.K."
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-body font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-neutral-700 mb-1.5 font-body">
                  Data &amp; Ora
                </label>
                <input
                  type="datetime-local"
                  value={form.openedAt}
                  onChange={(e) => setForm({ ...form, openedAt: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-body font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-neutral-700 mb-1.5 font-body">
                  Shënime (opsionale)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="p.sh. Ndalu te kandidati #45, faqja 3..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-body font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="font-normal">
                Anulo
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal"
              >
                {editId ? "Ruaj" : "Regjistro"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
