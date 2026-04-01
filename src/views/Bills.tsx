import React, { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LangContext";
import {
  Plus,
  Trash,
  X,
  Check,
  Invoice,
  MagnifyingGlass,
  PencilSimple,
  Warning,
  Buildings,
  Tag,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BillStatus = "pending" | "paid" | "overdue";

const CATEGORIES = ["Qiraja", "Utilities", "Furnitor", "Tatim", "Pagat", "Marketing", "Transport", "Tjetër"];

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

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Bills() {
  const { addToast, fmt } = useApp();
  const { t } = useLang();
  const { data: bills, isPending } = useQuery("Bill", { orderBy: { dueDate: "asc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Bill");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BillStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const statusConfig: Record<BillStatus, { label: string; className: string }> = {
    pending: { label: t("bills_pending"), className: "bg-amber-100 text-amber-700" },
    paid: { label: t("bills_paid"), className: "bg-green-100 text-green-700" },
    overdue: { label: t("bills_overdue"), className: "bg-red-100 text-red-700" },
  };

  const filtered = (bills ?? []).filter((b) => {
    const matchSearch =
      b.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchCat = categoryFilter === "all" || b.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const totalPaid = (bills ?? []).filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const totalPending = (bills ?? []).filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0);
  const totalOverdue = (bills ?? []).filter((b) => b.status === "overdue").reduce((s, b) => s + b.amount, 0);
  const dueSoon = (bills ?? []).filter((b) => b.status === "pending" && daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).length;

  const openCreate = () => {
    setEditId(null);
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 30);
    setForm({ ...emptyForm, issueDate: today.toISOString().split("T")[0], dueDate: due.toISOString().split("T")[0] });
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
    if (!form.supplierName.trim() || !form.billNumber.trim() || !form.dueDate || !form.amount) {
      addToast(t("bills_required"), "error");
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt < 0) {
      addToast(t("bills_required"), "error");
      return;
    }
    try {
      const payload: any = {
        supplierName: form.supplierName.trim(),
        billNumber: form.billNumber.trim(),
        description: form.description.trim() || undefined,
        amount: amt,
        dueDate: new Date(form.dueDate),
        issueDate: form.issueDate ? new Date(form.issueDate) : undefined,
        category: form.category || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };

      if (editId) {
        await update(editId, payload);
        addToast(t("bills_saved"), "success");
      } else {
        await create(payload);
        addToast(t("bills_created"), "success");
      }
      setModalOpen(false);
    } catch {
      addToast(t("error_save"), "error");
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`${t("delete")} "${num}"?`)) return;
    try {
      await remove(id);
      addToast(`"${num}" ${t("leads_deleted")}`, "info");
    } catch {
      addToast(t("error_delete"), "error");
    }
  };

  const markPaid = async (id: string) => {
    try {
      await update(id, { status: "paid" });
      addToast(t("bills_marked_paid"), "success");
    } catch {
      addToast(t("error_save"), "error");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">{t("bills_title")}</h1>
          <p className="text-body-sm font-body text-neutral-500">{filtered.length} {t("bills_subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          {t("bills_add")}
        </Button>
      </div>

      {/* Due Soon Alert */}
      {dueSoon > 0 && (
        <div className="flex items-center gap-3 p-3 mb-5 bg-amber-50 border border-amber-200 rounded-lg">
          <Warning size={20} className="text-amber-600 shrink-0" />
          <p className="text-body-sm font-body text-amber-800">
            <span className="font-medium">{dueSoon}</span> {t("bills_due_soon")}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t("bills_paid"), value: totalPaid, color: "text-green-600", bg: "bg-green-50" },
          { label: t("bills_pending"), value: totalPending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t("bills_overdue"), value: totalOverdue, color: "text-red-600", bg: "bg-red-50" },
          { label: t("bills_unpaid_total"), value: totalPending + totalOverdue, color: "text-foreground", bg: "bg-neutral-50" },
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
            placeholder={t("bills_search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "paid", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
            >
              {s === "all" ? t("all") : statusConfig[s as BillStatus]?.label}
            </button>
          ))}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">{t("bills_all_categories")}</option>
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
            <Invoice size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">{t("bills_none")}</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || statusFilter !== "all" || categoryFilter !== "all"
              ? t("bills_none_filter")
              : t("bills_none_empty")}
          </p>
          {!search && statusFilter === "all" && categoryFilter === "all" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              {t("bills_add")}
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">{t("bills_col_supplier")}</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">{t("bills_col_nr")}</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body hidden md:table-cell">{t("bills_col_category")}</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">{t("bills_col_amount")}</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">{t("bills_col_due")}</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">{t("bills_col_status")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((bill) => {
                  const days = daysUntil(bill.dueDate);
                  const isUrgent = bill.status === "pending" && days <= 7 && days >= 0;
                  return (
                    <tr key={bill.id} className="group hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Buildings size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-body-sm font-medium text-foreground font-body">{bill.supplierName}</p>
                            {bill.description && <p className="text-caption text-neutral-400 font-body truncate max-w-[160px]">{bill.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body-sm font-medium text-foreground font-mono">{bill.billNumber}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {bill.category ? (
                          <span className="flex items-center gap-1.5 text-caption text-neutral-500 font-body">
                            <Tag size={12} />
                            {bill.category}
                          </span>
                        ) : <span className="text-caption text-neutral-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-body-sm font-medium text-foreground">{fmt(bill.amount)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`text-body-sm font-body ${isUrgent ? "text-amber-600 font-medium" : "text-neutral-500"}`}>
                            {new Date(bill.dueDate).toLocaleDateString("sq-AL")}
                          </p>
                          {isUrgent && (
                            <p className="text-caption text-amber-500 font-body">
                              {days === 0 ? t("bills_today") : `${days} ${t("bills_days")}`}
                            </p>
                          )}
                          {bill.status === "overdue" && (
                            <p className="text-caption text-red-500 font-body">{Math.abs(days)} {t("bills_days_delay")}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-caption px-2.5 py-0.5 rounded-full font-body ${statusConfig[bill.status as BillStatus]?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                          {statusConfig[bill.status as BillStatus]?.label ?? bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bill.status !== "paid" && (
                            <button onClick={() => markPaid(bill.id)} className="p-1.5 rounded hover:bg-green-50 text-neutral-400 hover:text-green-600 transition-colors cursor-pointer" title={t("bills_mark_paid")}>
                              <Check size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(bill)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                            <PencilSimple size={14} />
                          </button>
                          <button onClick={() => handleDelete(bill.id, bill.billNumber)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
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
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? t("bills_edit_title") : t("bills_add_title")}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Supplier + Nr */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_supplier")}</label>
                  <input
                    type="text"
                    value={form.supplierName}
                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    placeholder={t("bills_col_supplier")}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_nr")}</label>
                  <input
                    type="text"
                    value={form.billNumber}
                    onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                    placeholder="BILL-001"
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_description")}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="p.sh. Qiraja Janar 2025"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Amount + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_amount")}</label>
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
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_category")}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">{t("bills_select_cat")}</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_issue_date")}</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_due_date")}</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_status")}</label>
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

              {/* Notes */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">{t("bills_notes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("notes")}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal">{t("cancel")}</Button>
              <Button onClick={handleSubmit} disabled={mutating} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
                <Check size={16} />
                {mutating ? t("saving") : editId ? t("update") : t("add")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
