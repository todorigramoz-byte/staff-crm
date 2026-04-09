import React, { useState, useRef, useEffect } from "react";
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
  TrendUp,
  CurrencyEur,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InvoiceStatus = "pending" | "paid" | "overdue";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  pending: { label: "Në pritje", className: "bg-amber-100 text-amber-700" },
  paid: { label: "Paguar", className: "bg-green-100 text-green-700" },
  overdue: { label: "Vonuar", className: "bg-red-100 text-red-700" },
};

const EUR_TO_ALL = 100; // 1 EUR = 100 ALL

type InvoiceLine = {
  productId: string;
  qty: number;
  unitPrice: number; // always stored in EUR
};

type PaymentMethod = "bank" | "cash" | "stripe" | "";

const paymentMethodConfig: Record<string, { label: string; icon: string }> = {
  bank: { label: "Bankë", icon: "🏦" },
  cash: { label: "Cash", icon: "💵" },
  stripe: { label: "Stripe", icon: "💳" },
};

const emptyForm = {
  clientId: "",
  invoiceNumber: "",
  amount: "",
  dueDate: "",
  status: "pending" as InvoiceStatus,
  paymentMethod: "" as PaymentMethod,
};

export default function Invoices() {
  const { addToast, fmt, currency, setCurrency } = useApp();
  const { data: invoices, isPending } = useQuery("Invoice", { orderBy: { createdAt: "desc" } });
  const { data: clients } = useQuery("Client");
  const { data: products } = useQuery("Product", { where: { isActive: true } });
  const { create, update, remove, isPending: mutating } = useMutation("Invoice");

  // Generate invoice number: DDMM-NNN (day+month + sequential for today)
  const generateInvoiceNumber = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const prefix = `${dd}${mm}`;
    const todayStr = today.toISOString().split("T")[0];
    const todayInvoices = (invoices ?? []).filter((inv) => {
      const invDate = new Date(inv.createdAt).toISOString().split("T")[0];
      return invDate === todayStr;
    });
    const seq = String(todayInvoices.length + 1).padStart(3, "0");
    return `${prefix}-${seq}`;
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [invoiceCurrency, setInvoiceCurrency] = useState<"EUR" | "ALL">("EUR");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]));

  const filtered = (invoices ?? []).filter((inv) => {
    const clientName = clientMap[inv.clientId] ?? "";
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Daily stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayInvoices = (invoices ?? []).filter(
    (inv) => new Date(inv.createdAt).toISOString().split("T")[0] === todayStr
  );
  const todayCount = todayInvoices.length;
  const todayEur = todayInvoices.filter((i) => (i.currency ?? "EUR") === "EUR").reduce((s, i) => s + i.amount, 0);
  const todayAll = todayInvoices.filter((i) => i.currency === "ALL").reduce((s, i) => s + i.amount, 0);

  // For summary cards: group totals by currency keeping native amounts
  const sumByCurrency = (status: string) => {
    const items = (invoices ?? []).filter((i) => i.status === status);
    const eur = items.filter((i) => (i.currency ?? "EUR") === "EUR").reduce((s, i) => s + i.amount, 0);
    const all = items.filter((i) => i.currency === "ALL").reduce((s, i) => s + i.amount, 0);
    return { eur, all };
  };
  const paidTotals = sumByCurrency("paid");
  const pendingTotals = sumByCurrency("pending");
  const overdueTotals = sumByCurrency("overdue");

  // Monthly chart data — last 6 months
  const monthlyData = (() => {
    const now = new Date();
    const months: { label: string; eur: number; all: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleString("sq-AL", { month: "short" });
      const items = (invoices ?? []).filter((inv) => {
        const cd = new Date(inv.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      });
      const eur = items.filter((i) => (i.currency ?? "EUR") === "EUR").reduce((s, i) => s + i.amount, 0);
      const all = items.filter((i) => i.currency === "ALL").reduce((s, i) => s + i.amount, 0);
      months.push({ label, eur, all, count: items.length });
    }
    return months;
  })();

  const maxMonthlyEur = Math.max(...monthlyData.map((m) => m.eur), 1);

  // Total invoices count
  const totalCount = (invoices ?? []).length;
  const totalEur = (invoices ?? []).filter((i) => (i.currency ?? "EUR") === "EUR").reduce((s, i) => s + i.amount, 0);

  // linesTotal is in EUR (unit prices from products are in EUR)
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

  const filteredClients = (clients ?? []).filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClientName = form.clientId ? (clientMap[form.clientId] ?? "") : "";

  const openCreate = () => {
    setEditId(null);
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 10);
    setForm({ ...emptyForm, dueDate: due.toISOString().split("T")[0], invoiceNumber: generateInvoiceNumber() });
    setLines([]);
    setInvoiceCurrency("EUR");
    setPaymentMethod("");
    setClientSearch("");
    setClientDropdownOpen(false);
    setModalOpen(true);
  };

  const openEdit = (inv: any) => {
    setEditId(inv.id);
    const editCurrency = (inv.currency as "EUR" | "ALL") || currency;
    setInvoiceCurrency(editCurrency);
    setForm({
      clientId: inv.clientId,
      invoiceNumber: inv.invoiceNumber,
      amount: String(inv.amount),
      dueDate: new Date(inv.dueDate).toISOString().split("T")[0],
      status: inv.status as InvoiceStatus,
      paymentMethod: (inv.paymentMethod as PaymentMethod) ?? "",
    });
    setLines([]);
    setPaymentMethod((inv.paymentMethod as PaymentMethod) ?? "");
    setClientSearch("");
    setClientDropdownOpen(false);
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
      // Save amount as-is in the invoice's own currency (no conversion)
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
        currency: invoiceCurrency,
        dueDate: dueDateObj,
        status: autoStatus,
        paymentMethod: paymentMethod || undefined,
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

      {/* Extended Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Total invoices */}
        <Card className="p-4 bg-white border border-border rounded-lg flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Receipt size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-caption font-body text-neutral-400 mb-0.5">Gjithsej</p>
            <p className="text-h3 font-sans font-semibold text-foreground">{totalCount}</p>
            <p className="text-caption text-neutral-400 font-body">fatura</p>
          </div>
        </Card>
        {/* Paid */}
        <Card className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <CurrencyEur size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-caption font-body text-neutral-500 mb-0.5">E paguar</p>
            {paidTotals.eur > 0 && (
              <p className="text-h3 font-sans font-semibold text-green-700">
                €{paidTotals.eur.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {paidTotals.all > 0 && (
              <p className={`font-sans font-semibold text-green-700 ${paidTotals.eur > 0 ? "text-caption opacity-80" : "text-h3"}`}>
                {paidTotals.all.toLocaleString("sq-AL", { maximumFractionDigits: 0 })} L
              </p>
            )}
            {paidTotals.eur === 0 && paidTotals.all === 0 && <p className="text-h3 font-sans font-semibold text-green-700">—</p>}
          </div>
        </Card>
        {/* Pending */}
        <Card className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-caption font-body text-neutral-500 mb-0.5">Në pritje</p>
            {pendingTotals.eur > 0 && (
              <p className="text-h3 font-sans font-semibold text-amber-700">
                €{pendingTotals.eur.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {pendingTotals.all > 0 && (
              <p className={`font-sans font-semibold text-amber-700 ${pendingTotals.eur > 0 ? "text-caption opacity-80" : "text-h3"}`}>
                {pendingTotals.all.toLocaleString("sq-AL", { maximumFractionDigits: 0 })} L
              </p>
            )}
            {pendingTotals.eur === 0 && pendingTotals.all === 0 && <p className="text-h3 font-sans font-semibold text-amber-700">—</p>}
          </div>
        </Card>
        {/* Overdue */}
        <Card className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <WarningCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-caption font-body text-neutral-500 mb-0.5">Vonuar</p>
            {overdueTotals.eur > 0 && (
              <p className="text-h3 font-sans font-semibold text-red-700">
                €{overdueTotals.eur.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {overdueTotals.all > 0 && (
              <p className={`font-sans font-semibold text-red-700 ${overdueTotals.eur > 0 ? "text-caption opacity-80" : "text-h3"}`}>
                {overdueTotals.all.toLocaleString("sq-AL", { maximumFractionDigits: 0 })} L
              </p>
            )}
            {overdueTotals.eur === 0 && overdueTotals.all === 0 && <p className="text-h3 font-sans font-semibold text-red-700">—</p>}
          </div>
        </Card>
      </div>

      {/* Monthly Chart + Daily Stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly bar chart */}
        <Card className="lg:col-span-2 p-5 bg-white border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-5">
            <TrendUp size={18} className="text-primary" />
            <h3 className="text-body-sm font-sans font-semibold text-foreground">Faturat mujore (6 muajt e fundit)</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyData.map((m, i) => {
              const heightPct = maxMonthlyEur > 0 ? Math.max((m.eur / maxMonthlyEur) * 100, m.eur > 0 ? 4 : 0) : 0;
              const isCurrentMonth = i === monthlyData.length - 1;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-caption rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-body">
                    {m.count} faturë/a
                    {m.eur > 0 && <><br />€{m.eur.toLocaleString("sq-AL", { minimumFractionDigits: 2 })}</>}
                    {m.all > 0 && <><br />{m.all.toLocaleString("sq-AL")} L</>}
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isCurrentMonth ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/40"}`}
                    style={{ height: `${heightPct}%`, minHeight: m.count > 0 ? "4px" : "0px" }}
                  />
                  <span className={`text-caption font-body ${isCurrentMonth ? "text-primary font-semibold" : "text-neutral-400"}`}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Daily stats panel */}
        <Card className="p-5 bg-white border border-border rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-body-sm font-sans font-semibold text-foreground">Sot</h3>
              <span className="ml-auto text-caption text-neutral-400 font-body">
                {new Date().toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            {todayCount === 0 ? (
              <p className="text-caption text-neutral-400 font-body italic">Asnjë faturë e krijuar sot.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-neutral-500 font-body">Fatura</span>
                  <span className="text-body-sm font-semibold text-foreground font-sans">{todayCount}</span>
                </div>
                {todayEur > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-neutral-500 font-body">Shuma EUR</span>
                    <span className="text-body-sm font-semibold text-blue-700 font-sans">
                      €{todayEur.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {todayAll > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-neutral-500 font-body">Shuma ALL</span>
                    <span className="text-body-sm font-semibold text-blue-700 font-sans">
                      {todayAll.toLocaleString("sq-AL", { maximumFractionDigits: 0 })} L
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-caption text-neutral-400 font-body">Të gjitha EUR</span>
              <span className="text-caption font-semibold text-neutral-600 font-body">
                €{totalEur.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
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
                  <th className="text-right px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Vlera</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body hidden lg:table-cell">Krijuar</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Skadenca</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body hidden md:table-cell">Mënyra</th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">Statusi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  return (
                    <tr key={inv.id} className="group hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-body-sm font-medium text-foreground font-mono">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-body-sm text-neutral-600 font-body">{clientMap[inv.clientId] ?? "—"}</td>
                      <td className="px-4 py-3 text-body-sm font-medium text-foreground text-right tabular-nums">
                        {(inv.currency ?? "EUR") === "EUR"
                          ? `€${inv.amount.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `${inv.amount.toLocaleString("sq-AL", { maximumFractionDigits: 0 })} L`}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-400 font-body hidden lg:table-cell">
                        {new Date(inv.createdAt).toLocaleDateString("sq-AL")}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-500 font-body">{new Date(inv.dueDate).toLocaleDateString("sq-AL")}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {inv.paymentMethod ? (
                          <span className="inline-flex items-center gap-1 text-caption px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-body">
                            <span>{paymentMethodConfig[inv.paymentMethod]?.icon}</span>
                            <span>{paymentMethodConfig[inv.paymentMethod]?.label ?? inv.paymentMethod}</span>
                          </span>
                        ) : (
                          <span className="text-caption text-neutral-300 font-body">—</span>
                        )}
                      </td>
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
          <div className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">{editId ? "Redakto Faturën" : "Faturë e Re"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div ref={clientSearchRef} className="relative">
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Klienti *</label>
                <div
                  className={`w-full h-11 px-3 flex items-center gap-2 rounded-md border bg-white text-body font-body cursor-pointer transition-all ${clientDropdownOpen ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-neutral-400"}`}
                  onClick={() => {
                    setClientDropdownOpen(true);
                    setClientSearch("");
                  }}
                >
                  {form.clientId && !clientDropdownOpen ? (
                    <span className="flex-1 text-foreground truncate">{selectedClientName}</span>
                  ) : clientDropdownOpen ? (
                    <input
                      autoFocus
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Kërko klient..."
                      className="flex-1 outline-none bg-transparent text-foreground placeholder-neutral-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-neutral-400">Zgjidh klientin...</span>
                  )}
                  {form.clientId && !clientDropdownOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm({ ...form, clientId: "" });
                        setClientSearch("");
                      }}
                      className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {!form.clientId && !clientDropdownOpen && (
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
                {clientDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="px-3 py-3 text-body-sm text-neutral-400 font-body text-center">Asnjë klient</div>
                    ) : (
                      filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, clientId: c.id });
                            setClientSearch("");
                            setClientDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-body-sm font-body hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer ${form.clientId === c.id ? "bg-primary/5 text-primary font-medium" : "text-foreground"}`}
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
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
                    <div className="flex justify-end pt-1 flex-col items-end gap-0.5">
                      <span className="text-body-sm font-medium text-foreground">
                        Totali: {invoiceCurrency === "EUR" ? `€${linesTotal.toLocaleString("sq-AL", { minimumFractionDigits: 2 })}` : `${linesTotal.toLocaleString("sq-AL")} L`}
                      </span>
                      <span className="text-caption text-neutral-400 font-body">
                        {invoiceCurrency === "EUR"
                          ? `≈ ${(linesTotal * EUR_TO_ALL).toLocaleString("sq-AL")} L`
                          : `≈ €${(linesTotal / EUR_TO_ALL).toLocaleString("sq-AL", { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-caption text-neutral-400 font-body italic">
                    Nuk ka zëra — shuma do të vendoset manualisht.
                  </p>
                )}
              </div>

              {/* Manual amount — shown only when no lines — ABOVE currency selector so value exists on toggle */}
              {lines.length === 0 && (
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                    Shuma ({invoiceCurrency === "EUR" ? "€ EUR" : "L ALL"}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step={invoiceCurrency === "EUR" ? "0.01" : "1"}
                      className="w-full h-11 px-3 pr-24 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {form.amount && parseFloat(form.amount) > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-neutral-400 font-body pointer-events-none">
                        ≈ {invoiceCurrency === "EUR"
                          ? `${(parseFloat(form.amount) * EUR_TO_ALL).toLocaleString("sq-AL")} L`
                          : `€${(parseFloat(form.amount) / EUR_TO_ALL).toLocaleString("sq-AL", { minimumFractionDigits: 2 })}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Monedha */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Monedha</label>
                <div className="flex gap-2">
                  {(["EUR", "ALL"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (c === invoiceCurrency) return;
                        const current = parseFloat(form.amount);
                        if (!isNaN(current) && current > 0) {
                          if (c === "ALL") {
                            setForm((f) => ({ ...f, amount: String(Math.round(current * EUR_TO_ALL)) }));
                          } else {
                            setForm((f) => ({ ...f, amount: String(parseFloat((current / EUR_TO_ALL).toFixed(2))) }));
                          }
                        }
                        setInvoiceCurrency(c);
                      }}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer ${invoiceCurrency === c ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                    >
                      {c === "EUR" ? "€ Euro" : "L Lekë"}
                    </button>
                  ))}
                </div>
                <p className="text-caption text-neutral-400 font-body mt-1">Kursi: 1 EUR = {EUR_TO_ALL} ALL</p>
              </div>
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
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Mënyra e Pagesës</label>
                <div className="flex gap-2">
                  {(["bank", "cash", "stripe"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(paymentMethod === m ? "" : m)}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${paymentMethod === m ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary"}`}
                    >
                      <span>{paymentMethodConfig[m].icon}</span>
                      <span>{paymentMethodConfig[m].label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-caption text-neutral-400 font-body mt-1">Opsionale — kliko për të zgjedhur ose çzgjedhur.</p>
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
