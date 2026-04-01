import React from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LangContext";
import { useQuery } from "@animaapp/playground-react-sdk";
import {
  Users,
  Receipt,
  CalendarCheck,
  CheckSquare,
  ArrowRight,
  TrendUp,
  WarningCircle,
  Clock,
  Funnel,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { setCurrentView, fmt } = useApp();
  const { t } = useLang();

  const { data: leads, isPending: loadingLeads } = useQuery("Lead");
  const { data: clients, isPending: loadingClients } = useQuery("Client");
  const { data: invoices, isPending: loadingInvoices } = useQuery("Invoice");
  const { data: appointments, isPending: loadingAppts } = useQuery("Appointment");
  const { data: tasks, isPending: loadingTasks } = useQuery("Task");

  const totalLeads = leads?.length ?? 0;
  const activeLeads = leads?.filter((l) => l.stage !== "converted").length ?? 0;

  const totalClients = clients?.length ?? 0;
  const activeClients = clients?.filter((c) => c.status === "active").length ?? 0;

  const pendingInvoices = invoices?.filter((i) => i.status === "pending").length ?? 0;
  const overdueInvoices = invoices?.filter((i) => i.status === "overdue").length ?? 0;
  const totalRevenue = invoices
    ?.filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0) ?? 0;

  const now = new Date();
  const upcomingAppts = appointments?.filter(
    (a) => new Date(a.scheduledAt) >= now,
  ).length ?? 0;

  const openTasks = tasks?.filter((t) => !t.isCompleted).length ?? 0;
  const highPriorityTasks = tasks?.filter(
    (t) => !t.isCompleted && t.priority === "high",
  ).length ?? 0;

  const stats = [
    {
      label: t("dash_leads_active"),
      value: loadingLeads ? "—" : activeLeads,
      sub: `${totalLeads} ${t("dash_total_leads")}`,
      icon: <Funnel size={22} weight="regular" className="text-violet-600" />,
      bg: "bg-violet-50",
      view: "leads" as const,
    },
    {
      label: t("dash_clients_total"),
      value: loadingClients ? "—" : totalClients,
      sub: `${activeClients} ${t("dash_active")}`,
      icon: <Users size={22} weight="regular" className="text-primary" />,
      bg: "bg-primary/8",
      view: "clients" as const,
    },
    {
      label: t("dash_invoices_pending"),
      value: loadingInvoices ? "—" : pendingInvoices,
      sub: overdueInvoices > 0 ? `${overdueInvoices} ${t("dash_overdue")}` : `${fmt(totalRevenue)} ${t("dash_collected")}`,
      icon: <Receipt size={22} weight="regular" className="text-tertiary" />,
      bg: "bg-tertiary/8",
      view: "invoices" as const,
    },
    {
      label: t("dash_appts_upcoming"),
      value: loadingAppts ? "—" : upcomingAppts,
      sub: t("dash_appts_planned"),
      icon: <CalendarCheck size={22} weight="regular" className="text-accent" />,
      bg: "bg-accent/8",
      view: "leads" as const,
    },
    {
      label: t("dash_tasks_open"),
      value: loadingTasks ? "—" : openTasks,
      sub: `${highPriorityTasks} ${t("dash_high_priority")}`,
      icon: <CheckSquare size={22} weight="regular" className="text-success" />,
      bg: "bg-success/8",
      view: "tasks" as const,
    },
  ];

  const recentClients = [...(clients ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentInvoices = [...(invoices ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingApptList = [...(appointments ?? [])]
    .filter((a) => new Date(a.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  const pendingTaskList = [...(tasks ?? [])]
    .filter((task) => !task.isCompleted)
    .sort((a, b) => {
      const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
    })
    .slice(0, 4);

  const invoiceStatusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  };

  const clientStatusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    lead: "bg-blue-100 text-blue-700",
    inactive: "bg-neutral-100 text-neutral-500",
  };

  const priorityColor: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative rounded-xl overflow-hidden mb-8 border border-border">
        <div className="bg-gradient-primary p-8">
          <h1 className="text-h2 font-sans font-medium text-white mb-1">
            {t("dash_welcome")}
          </h1>
          <p className="text-body-sm text-white/80 font-body">
            {t("dash_subtitle")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card
            key={i}
            onClick={() => setCurrentView(stat.view)}
            className="p-5 bg-white border border-border rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-h2 font-sans font-medium text-foreground">{stat.value}</p>
            <p className="text-body-sm font-body text-neutral-600 mb-1">{stat.label}</p>
            <p className="text-caption font-body text-neutral-400 flex items-center gap-1">
              <TrendUp size={12} className="text-success" />
              {stat.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Alerts row */}
      {overdueInvoices > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <WarningCircle size={20} className="text-red-600 shrink-0" />
          <p className="text-body-sm text-red-700 font-body">
            {t("dash_overdue_alert")} <strong>{overdueInvoices}</strong> {t("dash_overdue_alert2")}{" "}
            <button onClick={() => setCurrentView("invoices")} className="underline cursor-pointer">
              {t("dash_view_invoices")}
            </button>
          </p>
        </div>
      )}

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Clients */}
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-h4 font-sans font-medium text-foreground">{t("dash_recent_clients")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("clients")}
              className="text-primary bg-transparent hover:bg-primary/5 text-body-sm font-body flex items-center gap-1">
              {t("view_all")} <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loadingClients ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400 font-body">{t("loading")}</div>
            ) : recentClients.length === 0 ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400 font-body">{t("dash_no_clients")}</div>
            ) : (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-caption font-medium text-white">
                      {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-caption text-neutral-400 font-body truncate">{client.email}</p>
                  </div>
                  <span className={`text-caption px-2 py-0.5 rounded-full font-body ${clientStatusColor[client.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {client.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Invoices */}
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-h4 font-sans font-medium text-foreground">{t("dash_recent_invoices")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("invoices")}
              className="text-primary bg-transparent hover:bg-primary/5 text-body-sm font-body flex items-center gap-1">
              {t("view_all")} <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loadingInvoices ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400 font-body">{t("loading")}</div>
            ) : recentInvoices.length === 0 ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400 font-body">{t("dash_no_invoices")}</div>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-foreground">{inv.invoiceNumber}</p>
                    <p className="text-caption text-neutral-400 font-body">
                      {t("dash_due")} {new Date(inv.dueDate).toLocaleDateString("sq-AL")}
                    </p>
                  </div>
                  <p className="text-body-sm font-medium text-foreground shrink-0">{fmt(inv.amount)}</p>
                  <span className={`text-caption px-2 py-0.5 rounded-full font-body shrink-0 ${invoiceStatusColor[inv.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {inv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row — Tasks (full width) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pending Tasks */}
        <Card className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-h4 font-sans font-medium text-foreground">{t("dash_open_tasks")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("tasks")}
              className="text-primary bg-transparent hover:bg-primary/5 text-body-sm font-body flex items-center gap-1">
              {t("view_all")} <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loadingTasks ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400">{t("loading")}</div>
            ) : pendingTaskList.length === 0 ? (
              <div className="px-5 py-8 text-center text-body-sm text-neutral-400 font-body">{t("dash_no_tasks")}</div>
            ) : (
              pendingTaskList.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <CheckSquare size={16} className="text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-foreground truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-caption text-neutral-400 font-body">
                        {t("dash_deadline")} {new Date(task.dueDate).toLocaleDateString("sq-AL")}
                      </p>
                    )}
                  </div>
                  <span className={`text-caption px-2 py-0.5 rounded-full font-body shrink-0 ${priorityColor[task.priority] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
