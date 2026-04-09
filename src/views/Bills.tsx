import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  Trash,
  X,
  Check,
  Receipt,
  MagnifyingGlass,
  PencilSimple,
  Warning,
  CalendarBlank,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BillStatus = "pending" | "paid" | "overdue";

const statusConfig: Record<BillStatus, { label: string; className: string }> = {
  pending: { label: "Në pritje", className: "bg-amber-100 text-amber-700" },
  paid: { label: "Paguar", className: "bg-green-100 text-green-700" },
  overdue: { label: "Vonuar", className: "bg-red-100 text-red-700" },
};

const CATEGORIES = ["Qiraja", "Utilities", "Furnitor", "Tatim", "Pagat", "Tjetër"];

const emptyForm = {
  supplierName: "",
  billNumber: "",
  description: "",
  amount: "",
  dueDate: "",
  issueDate: "",
  category: "",
  status: "pending" as BillStatus,
  notes: "",
};

export default function Bills() {
  const { addToast, fmt } = useApp();
  const { data: bills, isPending } = useQuery("Bill", { orderBy: { dueDate: "asc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Bill");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BillStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = (bills ?? []).filter((b) => {
    const matchSearch =
      b.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalPaid = (bills ?? []).filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const totalPending = (bills ?? []).filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0);
  const totalOverdue = (bills ?? []).filter((b) => b.status === "overdue").reduce((s, b) => s + b.amount, 0);

  // Bills due within 7 days (still pending)
  const soonDue = (bills ?? []).filter((b) => {
    if (b.status !== "pending") return false;
    const diff = new Date(b.dueDate).getTime() - Date.now();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const openCreate = () => {
    setEditId(null);
    const today = new Date().toISOString().split("T")[0];
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm({ ...emptyForm, issueDate: today, dueDate: due.toISOString().split("T")[0] });
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      supplierName: b.supplierName,
      billNumber: b.billNumber,
      description: b.description ?? "",
      amount: String(b.amount),
      dueDate: new Date(b.dueDate).toISOString().split("T")[0],
      issueDate: b.issueDate ? new Date(b.issueDate).toISOString().split("T")[0] : "",
      category: b.category ?? "",
      status: b.status as BillStatus,
      notes: b.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.supplierName || !form.billNumber || !form.dueDate || !form.amount) {
      addToast("Plotëso të gjitha fushat e detyrueshme.", "error");
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount < 0) {
      addToast("Shuma duhet të jetë e vlefshme.", "error");
      return;
    }
    try {
      const payload = {
        supplierName: form.supplierName,
        billNumber: form.billNumber,
        description: form.description || undefined,
        amount,
        dueDate: new Date(form.dueDate),
        issueDate: form.issueDate ? new Date(form.issueDate) : undefined,
        category: form.category || undefined,
        status: form.status,
        notes: form.notes || undefined,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Shpenzimi u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Shpenzimi u shtua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Fshi shpenzimin "${num}"?`)) return;
    try {
      await remove(id);
      addToast(`Shpenzimi u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const markPaid = async (id: string) => {
    try {
      await update(id, { status: "paid" });
      addToast("Shpenzimi u shënua si i paguar!", "success");
    } catch {
      addToast("Gabim.", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Shpenzimet (Bills)</h1>
          <p className="text-body-sm font-body text-neutral-500">{filtered.length} shpenzim/e</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Shto Shpenzim
        </Button>
      </div>

      {/* Alert: bills due soon */}
      {soonDue.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          <Warning size={18} weight="fill" />
          <span className="text-body-sm font-body">
            {soonDue.length} shpenzim skadon brenda 7 ditëve:&nbsp;
            {soonDue.map((b) => <strong key={b.id}>{b.supplierName}</strong>).reduce((acc: React.ReactNode[], el, i) => i === 0 ? [el] : [...acc, ", ", el], [])}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "E paguar", value: totalPaid, color: "text-green-600", bg: "bg-green-50" },
          { label: "Në pritje", value: totalPending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Vonuar", value: totalOverdue, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg} border-0 rounded-lg`}>
            <p className="text-caption font-body text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-h3 font-sans font-medium ${s.color}`}>{fmt(s.value)}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Kërko shpenzime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "paid", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
            >
              {s === "all" ? "Të gjitha" : statusConfig[s as BillStatus]?.label}
            </button>
          ))}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-border bg-white text-body-sm font-body focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">Të gjitha kategorite</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-neutral-100 animate-skeleton-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Receipt size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë shpenzim</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || statusFilter !== "all" ? "Nuk u gjet asnjë shpenzim me këto filtra." : "Shto shpenzimin e parë."}
          </p>
          {!search && statusFilter === "all" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              Shto Shpenzim
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Furnitori</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body hidden sm:table-cell">Nr. Faturës</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body hidden md:table-cell">Kategoria</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Shuma</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Skadon më</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Statusi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => {
                  const isUrgent = b.status === "pending" && (new Date(b.dueDate).getTime() - Date.now()) <= 7 * 24 * 60 * 60 * 1000 && new Date(b.dueDate).getTime() >= Date.now();
                  return (
                    <tr key={b.id} className={`group hover:bg-neutral-50 transition-colors ${isUrgent ? "bg-amber-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isUrgent && <Warning size={14} weight="fill" className="text-amber-500 shrink-0" />}
                          <span className="text-body-sm font-medium text-foreground">{b.supplierName}</span>
                        </div>
                        {b.description && <p className="text-caption text-neutral-400 font-body truncate max-w-[200px]">{b.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-500 font-mono hidden sm:table-cell">{b.billNumber}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {b.category && (
                          <span className="text-caption px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-body">{b.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-body-sm font-medium text-foreground">{fmt(b.amount)}</td>
                      <td className="px-4 py-3 text-body-sm text-neutral-500 font-body">
                        <div className="flex items-center gap-1">
                          <CalendarBlank size={13} className="text-neutral-400" />
                          {new Date(b.dueDate).toLocaleDateString("sq-AL")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-caption px-2.5 py-0.5 rounded-full font-body ${statusConfig[b.status as BillStatus]?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                          {statusConfig[b.status as BillStatus]?.label ?? b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.status !== "paid" && (
                            <button onClick={() => markPaid(b.id)} className="p-1.5 rounded hover:bg-green-50 text-neutral-400 hover:text-green-600 transition-colors cursor-pointer" title="Shëno si paguar">
                              <Check size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                            <PencilSimple size={14} />
                          </button>
                          <button onClick={() => handleDelete(b.id, b.billNumber)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? "Redakto Shpenzimin" : "Shpenzim i Ri"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Furnitori *</label>
                  <input
                    type="text"
                    value={form.supplierName}
                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    placeholder="p.sh. Telekom"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Nr. Faturës *</label>
                  <input
                    type="text"
                    value={form.billNumber}
                    onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                    placeholder="BILL-001"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Përshkrim</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Përshkrim opsional"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shuma *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Kategoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Zgjidh kategorinë...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Data Lëshimit</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Data Skadencës *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Statusi</label>
                <div className="flex gap-2">
                  {(["pending", "paid", "overdue"] as BillStatus[]).map((s) => (
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
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shënime</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Shënime opsionale..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-white">
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
