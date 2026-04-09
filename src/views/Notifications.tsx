import React, { useState } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Bell,
  Receipt,
  CheckSquare,
  CalendarCheck,
  Clock,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";

type NotifType =
  | "invoice_overdue"
  | "invoice_due_soon"
  | "task_overdue"
  | "task_due_soon"
  | "appointment_today"
  | "appointment_soon";

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  read: boolean;
  view?: string;
};

const STORAGE_KEY = "crm_read_notifications";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Tani";
  if (mins < 60) return `${mins} min më parë`;
  if (hours < 24) return `${hours} orë më parë`;
  return `${days} ditë më parë`;
}

const urgencyOrder: Record<string, number> = {
  invoice_overdue: 0,
  task_overdue: 1,
  appointment_today: 2,
  invoice_due_soon: 3,
  task_due_soon: 4,
  appointment_soon: 5,
};

const FILTER_LABELS: { key: string; label: string }[] = [
  { key: "all", label: "Të gjitha" },
  { key: "invoice_overdue", label: "Fatura vonuara" },
  { key: "invoice_due_soon", label: "Fatura afër skadencës" },
  { key: "task_overdue", label: "Detyra vonuara" },
  { key: "task_due_soon", label: "Detyra nesër" },
  { key: "appointment_today", label: "Takime sot" },
  { key: "appointment_soon", label: "Takime nesër" },
];

export default function Notifications() {
  const { setCurrentView } = useApp();
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const [filter, setFilter] = useState("all");

  const { data: invoices } = useQuery("Invoice");
  const { data: tasks } = useQuery("Task");
  const { data: appointments } = useQuery("Appointment");

  const notifications: Notification[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in3Days = new Date(today.getTime() + 3 * 86400000);

  // --- Invoices ---
  (invoices || []).forEach((inv: any) => {
    if (inv.status === "paid") return;
    const due = new Date(inv.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const id_overdue = `inv_overdue_${inv.id}`;
    const id_soon = `inv_soon_${inv.id}`;
    if (dueDay < today) {
      notifications.push({
        id: id_overdue,
        type: "invoice_overdue",
        title: "Faturë e vonuar",
        description: `#${inv.invoiceNumber} — €${inv.amount} (skadoi ${due.toLocaleDateString("sq-AL")})`,
        time: timeAgo(due),
        icon: <Receipt size={20} weight="bold" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        read: readIds.has(id_overdue),
        view: "invoices",
      });
    } else if (dueDay <= in3Days) {
      notifications.push({
        id: id_soon,
        type: "invoice_due_soon",
        title: "Faturë afër skadencës",
        description: `#${inv.invoiceNumber} — €${inv.amount} (skadon ${due.toLocaleDateString("sq-AL")})`,
        time: timeAgo(inv.createdAt ? new Date(inv.createdAt) : due),
        icon: <Receipt size={20} weight="bold" />,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        read: readIds.has(id_soon),
        view: "invoices",
      });
    }
  });

  // --- Tasks ---
  (tasks || []).forEach((task: any) => {
    if (task.isCompleted || !task.dueDate) return;
    const due = new Date(task.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const id_overdue = `task_overdue_${task.id}`;
    const id_soon = `task_soon_${task.id}`;
    if (dueDay < today) {
      notifications.push({
        id: id_overdue,
        type: "task_overdue",
        title: "Detyrë e vonuar",
        description: task.title,
        time: timeAgo(due),
        icon: <CheckSquare size={20} weight="bold" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        read: readIds.has(id_overdue),
        view: "tasks",
      });
    } else if (dueDay <= tomorrow) {
      notifications.push({
        id: id_soon,
        type: "task_due_soon",
        title: "Detyrë skadon nesër",
        description: task.title,
        time: timeAgo(task.createdAt ? new Date(task.createdAt) : due),
        icon: <Clock size={20} weight="bold" />,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        read: readIds.has(id_soon),
        view: "tasks",
      });
    }
  });

  // --- Appointments ---
  (appointments || []).forEach((appt: any) => {
    const scheduled = new Date(appt.scheduledAt);
    const schedDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate());
    const id_today = `appt_today_${appt.id}`;
    const id_soon = `appt_soon_${appt.id}`;
    if (schedDay.getTime() === today.getTime()) {
      notifications.push({
        id: id_today,
        type: "appointment_today",
        title: "Takim sot",
        description: `${appt.title} — ${scheduled.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`,
        time: timeAgo(scheduled),
        icon: <CalendarCheck size={20} weight="bold" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        read: readIds.has(id_today),
        view: "appointments",
      });
    } else if (schedDay.getTime() === tomorrow.getTime()) {
      notifications.push({
        id: id_soon,
        type: "appointment_soon",
        title: "Takim nesër",
        description: `${appt.title} — ${scheduled.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`,
        time: timeAgo(scheduled),
        icon: <CalendarCheck size={20} weight="bold" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        read: readIds.has(id_soon),
        view: "appointments",
      });
    }
  });

  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return (urgencyOrder[a.type] ?? 9) - (urgencyOrder[b.type] ?? 9);
  });

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const newIds = new Set(readIds);
    notifications.forEach((n) => newIds.add(n.id));
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const markRead = (id: string) => {
    const newIds = new Set(readIds);
    newIds.add(id);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.view) setCurrentView(notif.view as any);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell size={22} weight="bold" className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Njoftimet</h1>
            <p className="text-sm text-neutral-500">
              {unreadCount > 0 ? `${unreadCount} të palexuara` : "Të gjitha janë lexuar"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <CheckCircle size={15} weight="bold" />
            Shëno të gjitha si të lexuara
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTER_LABELS.map((f) => {
          const count = f.key === "all" ? notifications.length : notifications.filter((n) => n.type === f.key).length;
          if (f.key !== "all" && count === 0) return null;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filter === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"
              }`}
            >
              {f.label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400">
            <CheckCircle size={48} weight="light" className="text-green-400" />
            <p className="text-base font-medium text-neutral-600">Gjithçka është në rregull!</p>
            <p className="text-sm text-neutral-400">Nuk ka njoftime të reja</p>
          </div>
        ) : (
          filtered.map((notif, idx) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 ${
                idx < filtered.length - 1 ? "border-b border-border/60" : ""
              } ${notif.read ? "opacity-60" : ""}`}
            >
              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notif.bgColor} ${notif.color}`}>
                {notif.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${notif.read ? "text-neutral-500" : "text-neutral-800"}`}>
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-neutral-400">{notif.time}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-0.5" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5 truncate">{notif.description}</p>
                {notif.view && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    Shko te {notif.view === "invoices" ? "Faturat" : notif.view === "tasks" ? "Detyrat" : "Takimet"} →
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-neutral-400 text-center mt-4">
          {filtered.length} njoftime gjithsej
        </p>
      )}
    </div>
  );
}
