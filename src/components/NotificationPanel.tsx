import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Bell,
  X,
  Receipt,
  CheckSquare,
  CalendarCheck,
  Warning,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";

type Notification = {
  id: string;
  type: "invoice_overdue" | "invoice_due_soon" | "task_overdue" | "task_due_soon" | "appointment_today" | "appointment_soon";
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

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const panelRef = useRef<HTMLDivElement>(null);
  const { setCurrentView } = useApp();

  const { data: invoices } = useQuery("Invoice");
  const { data: tasks } = useQuery("Task");
  const { data: appointments } = useQuery("Appointment");

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Build notifications
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
        title: `Faturë e vonuar`,
        description: `#${inv.invoiceNumber} — €${inv.amount} (skadoi ${due.toLocaleDateString("sq-AL")})`,
        time: timeAgo(due),
        icon: <Receipt size={17} weight="bold" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        read: readIds.has(id_overdue),
        view: "invoices",
      });
    } else if (dueDay <= in3Days) {
      notifications.push({
        id: id_soon,
        type: "invoice_due_soon",
        title: `Faturë afër skadencës`,
        description: `#${inv.invoiceNumber} — €${inv.amount} (skadon ${due.toLocaleDateString("sq-AL")})`,
        time: timeAgo(inv.createdAt ? new Date(inv.createdAt) : due),
        icon: <Receipt size={17} weight="bold" />,
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
        title: `Detyrë e vonuar`,
        description: task.title,
        time: timeAgo(due),
        icon: <CheckSquare size={17} weight="bold" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        read: readIds.has(id_overdue),
        view: "tasks",
      });
    } else if (dueDay <= tomorrow) {
      notifications.push({
        id: id_soon,
        type: "task_due_soon",
        title: `Detyrë skadon nesër`,
        description: task.title,
        time: timeAgo(task.createdAt ? new Date(task.createdAt) : due),
        icon: <Clock size={17} weight="bold" />,
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
        title: `Takim sot`,
        description: `${appt.title} — ${scheduled.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`,
        time: timeAgo(scheduled),
        icon: <CalendarCheck size={17} weight="bold" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        read: readIds.has(id_today),
        view: "appointments",
      });
    } else if (schedDay.getTime() === tomorrow.getTime()) {
      notifications.push({
        id: id_soon,
        type: "appointment_soon",
        title: `Takim nesër`,
        description: `${appt.title} — ${scheduled.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`,
        time: timeAgo(scheduled),
        icon: <CalendarCheck size={17} weight="bold" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        read: readIds.has(id_soon),
        view: "appointments",
      });
    }
  });

  // Sort: unread first, then by urgency
  const urgencyOrder: Record<string, number> = {
    invoice_overdue: 0,
    task_overdue: 1,
    appointment_today: 2,
    invoice_due_soon: 3,
    task_due_soon: 4,
    appointment_soon: 5,
  };
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return (urgencyOrder[a.type] ?? 9) - (urgencyOrder[b.type] ?? 9);
  });

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

  const handleNotifClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.view) setCurrentView(notif.view as any);
    setOpen(false);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
          open ? "bg-primary/10 text-primary" : "text-neutral-600 hover:bg-neutral-100 hover:text-primary"
        }`}
        aria-label="Njoftimet"
      >
        <span className={`relative ${open ? "text-primary" : "text-neutral-400"}`}>
          <Bell size={20} weight="regular" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        Njoftimet
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute left-full top-0 ml-2 w-80 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={16} weight="bold" className="text-primary" />
              <span className="font-semibold text-neutral-800 text-sm">Njoftimet</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Shëno të gjitha
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-neutral-100 rounded-md transition-colors">
                <X size={14} className="text-neutral-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-neutral-400">
                <CheckCircle size={32} weight="light" className="text-green-400" />
                <p className="text-sm font-medium">Gjithçka është në rregull!</p>
                <p className="text-xs text-neutral-400">Nuk ka njoftime të reja</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-neutral-50 transition-colors ${
                    notif.read ? "opacity-60" : ""
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${notif.bgColor} ${notif.color}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold ${notif.read ? "text-neutral-500" : "text-neutral-800"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{notif.description}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">{notif.time}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-neutral-50">
              <p className="text-xs text-neutral-400 text-center">
                {notifications.length} njoftime gjithsej
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
