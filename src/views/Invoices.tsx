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
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InvoiceStatus = "pending" | "paid" | "overdue";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  pending: { label: "Në pritje", className: "bg-amber-100 text-amber-700" },
  paid: { label: "Paguar", className: "bg-green-100 text-green-700" },
  overdue: { label: "Vonuar", className: "bg-red-100 text-red-700" },
};

type InvoiceLine = {
  productId: string;
  qty: number;
  unitPrice: number;
};

const emptyForm = {
  clientId: "",
  invoiceNumber: "",
  amount: "",
  dueDate: "",
  status: "pending" as InvoiceStatus,
};

export default function Invoices() {
  const { addToast, fmt, currency, setCurrency } = useApp();
  const { data: invoices, isPending } = useQuery("Invoice", { orderBy: { createdAt: "desc" } });
  const { data: clients } = useQuery("Client");
  const { data: products } = useQuery("Product", { where: { isActive: true } });
  const { create, update, remove, isPending: mutating } = useMutation("Invoice");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]));

  const filtered = (invoices ?? []).filter((inv) => {
    const clientName = clientMap[inv.clientId] ?? "";
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = (invoices ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = (invoices ?? []).filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = (invoices ?? []).filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const linesTotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  const addLine = () => setLines((prev) => [...prev, { productId: "", qty: 1, unitPrice: 0 }]);

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const updateLine = (idx: number, patch: Partial<InvoiceLine>) =>
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, ...patch };
        // auto-fill price when product is selected
        if (patch.productId !== undefined) {
          const prod = (products ?? []).find((p) => p.id === patch.productId);
          if (prod) updated.unitPrice = prod.price;
        }
        return updated;
      })
    );

  const openCreate = () => {
    setEditId(null);
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 10);
    setForm({ ...emptyForm, dueDate: due.toISOString().split("T")[0] });
    setLines([]);
    setModalOpen(true);
  };

  const openEdit = (inv: any) => {
    setEditId(inv.id);
    setForm({
      clientId: inv.clientId,
      invoiceNumber: inv.invoiceNumber,
      amount: String(inv.amount),
      dueDate: new Date(inv.dueDate).toISOString().split("T")[0],
      status: inv.status as InvoiceStatus,
    });
    setLines([]);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const needsManualAmount = lines.length === 0;
    if (!form.clientId || !form.invoiceNumber || !form.dueDate || (needsManualAmount && !form.amount)) {
      addToast("Plotëso të gjitha fushat e detyrueshme.", "error");
      return;
    }
    if (needsManualAmount && (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) < 0)) {
      addToast("Shuma duhet të jetë një numër valid.", "error");
      return;
    }
    try {
      // If there are lines, compute total from lines; otherwise use the manual amount
      const computedAmount = lines.length > 0 ? linesTotal : parseFloat(form.amount);
      const dueDateObj = new Date(form.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const autoStatus: InvoiceStatus =
        form.status === "paid"
          ? "paid"
          : dueDateObj < now
          ? "overdue"
          : "pending";
      const payload = {
        clientId: form.clientId,
        invoiceNumber: form.invoiceNumber,
        amount: computedAmount,
        dueDate: dueDateObj,
        status: autoStatus,
      };
      if (editId) {
        await update(editId, payload);
        addToast("Fatura u përditësua!", "success");
      } else {
        await create(payload);
        addToast("Fatura u krijua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Fshi faturën "${num}"?`)) return;
    try {
      await remove(id);
      addToast(`Fatura "${num}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const markPaid = async (id: string) => {
    try {
      await update(id, { status: "paid" });
      addToast("Fatura u shënua si e paguar!", "success");
    } catch {
      addToast("Gabim.", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Faturat</h1>
          <p className="text-body-sm font-body text-neutral-500">{filtered.length} faturë/a</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Krijo Faturë
        </Button>
      </div>

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
            placeholder="Kërko fatura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "paid", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
            >
              {s === "all" ? "Të gjitha" : statusConfig[s as InvoiceStatus]?.label}
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
            <Receipt size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë faturë</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || statusFilter !== "all" ? "Nuk u gjet asnjë faturë me këto filtra." : "Krijoni faturën e parë."}
          </p>
          {!search && statusFilter === "all" && (
            <Button onClick={openCreate} className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2">
              <Plus size={18} />
              Krijo Faturë
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Nr. Faturës</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Klienti</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Shuma</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Skadenca</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Statusi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-body-sm font-medium text-foreground font-mono">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 font-body">{clientMap[inv.clientId] ?? "—"}</td>
                    <td className="px-4 py-3 text-body-sm font-medium text-foreground">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-500 font-body">{new Date(inv.dueDate).toLocaleDateString("sq-AL")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-caption px-2.5 py-0.5 rounded-full font-body ${statusConfig[inv.status as InvoiceStatus]?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                        {statusConfig[inv.status as InvoiceStatus]?.label ?? inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status !== "paid" && (
                          <button onClick={() => markPaid(inv.id)} className="p-1.5 rounded hover:bg-green-50 text-neutral-400 hover:text-green-600 transition-colors cursor-pointer" title="Shëno si paguar">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(inv)} className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer">
                          <PencilSimple size={14} />
                        </button>
                        <button onClick={() => handleDelete(inv.id, inv.invoiceNumber)} className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer">
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
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? "Redakto Faturën" : "Faturë e Re"}</h2>
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
                  {(clients ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Nr. Faturës *</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  placeholder="INV-001"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              {/* Lines from products */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-body-sm font-medium text-foreground font-body">Zërat (nga produktet)</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-caption text-primary hover:underline cursor-pointer font-body"
                  >
                    + Shto zë
                  </button>
                </div>
                {lines.length > 0 ? (
                  <div className="space-y-2">
                    {lines.map((line, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(idx, { productId: e.target.value })}
                          className="flex-1 h-9 px-2 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all"
                        >
                          <option value="">Zgjidh...</option>
                          {(products ?? []).map((prod) => (
                            <option key={prod.id} value={prod.id}>{prod.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={line.qty}
                          onChange={(e) => updateLine(idx, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                          min="1"
                          className="w-16 h-9 px-2 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all text-center"
                          title="Sasia"
                        />
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-24 h-9 px-2 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all"
                          title="Çmimi"
                        />
                        <button onClick={() => removeLine(idx)} className="p-1.5 text-neutral-400 hover:text-error cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
                      <span className="text-body-sm font-medium text-foreground">
                        Totali: {fmt(linesTotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-caption text-neutral-400 font-body italic">
                    Nuk ka zëra — shuma do të vendoset manualisht.
                  </p>
                )}
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

              {/* Manual amount — shown only when no lines */}
              {lines.length === 0 && (
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Shuma ({currency === "EUR" ? "€" : "L"}) *</label>
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
              )}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Data e Skadencës *</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Statusi</label>
                <div className="flex gap-2">
                  {(["pending", "paid", "overdue"] as InvoiceStatus[]).map((s) => (
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
