import React, { useState } from "react";
import { useAuth, useUser, useQuery } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import { View } from "../types";
import {
  MagnifyingGlass,
  SquaresFour,
  Users,
  Receipt,
  CalendarCheck,
  CheckSquare,
  Gear,
  SignOut,
  List,
  X,
  Command,
  Funnel,
  Package,
  EnvelopeSimple,
  FolderOpen,
  CurrencyDollar,
  Bell,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NOTIF_STORAGE_KEY = "crm_read_notifications";

function getReadIdsSet(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function NotificationBellButton() {
  const { currentView, setCurrentView } = useApp();
  const { data: invoices } = useQuery("Invoice");
  const { data: tasks } = useQuery("Task");
  const { data: appointments } = useQuery("Appointment");

  const readIds = getReadIdsSet();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in3Days = new Date(today.getTime() + 3 * 86400000);

  let unread = 0;

  (invoices || []).forEach((inv: any) => {
    if (inv.status === "paid") return;
    const due = new Date(inv.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueDay < today && !readIds.has(`inv_overdue_${inv.id}`)) unread++;
    else if (dueDay <= in3Days && dueDay >= today && !readIds.has(`inv_soon_${inv.id}`)) unread++;
  });

  (tasks || []).forEach((task: any) => {
    if (task.isCompleted || !task.dueDate) return;
    const due = new Date(task.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueDay < today && !readIds.has(`task_overdue_${task.id}`)) unread++;
    else if (dueDay <= tomorrow && dueDay >= today && !readIds.has(`task_soon_${task.id}`)) unread++;
  });

  (appointments || []).forEach((appt: any) => {
    const scheduled = new Date(appt.scheduledAt);
    const schedDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate());
    if (schedDay.getTime() === today.getTime() && !readIds.has(`appt_today_${appt.id}`)) unread++;
    else if (schedDay.getTime() === tomorrow.getTime() && !readIds.has(`appt_soon_${appt.id}`)) unread++;
  });

  const isActive = currentView === "notifications";

  return (
    <button
      onClick={() => setCurrentView("notifications")}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
        isActive ? "bg-primary/10 text-primary" : "text-neutral-600 hover:bg-neutral-100 hover:text-primary"
      }`}
      aria-label="Njoftimet"
    >
      <span className={`relative ${isActive ? "text-primary" : "text-neutral-400"}`}>
        <Bell size={20} weight="regular" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </span>
      Njoftimet
      {unread > 0 && (
        <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {unread}
        </span>
      )}
    </button>
  );
}

const navItems: { label: string; view: View; icon: React.ReactNode }[] = [
  { label: "Dashboard", view: "dashboard", icon: <SquaresFour size={20} weight="regular" /> },
  { label: "Leads", view: "leads", icon: <Funnel size={20} weight="regular" /> },
  { label: "Klientët", view: "clients", icon: <Users size={20} weight="regular" /> },
  { label: "Faturat", view: "invoices", icon: <Receipt size={20} weight="regular" /> },
  { label: "Shpenzimet", view: "bills", icon: <CurrencyDollar size={20} weight="regular" /> },
  { label: "Takimet", view: "appointments", icon: <CalendarCheck size={20} weight="regular" /> },
  { label: "Detyrat", view: "tasks", icon: <CheckSquare size={20} weight="regular" /> },
  { label: "Produkte", view: "products", icon: <Package size={20} weight="regular" /> },
  { label: "Emailet", view: "emails", icon: <EnvelopeSimple size={20} weight="regular" /> },
  { label: "CV Tracker", view: "cvtracker", icon: <FolderOpen size={20} weight="regular" /> },
  { label: "Settings", view: "settings", icon: <Gear size={20} weight="regular" /> },
];

export default function TopNavBar() {
  const { currentView, setCurrentView, setCommandPaletteOpen } = useApp();
  const { logout } = useAuth();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 z-40 flex-col bg-white border-r border-border">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-4 py-5 cursor-pointer select-none shrink-0"
          onClick={() => setCurrentView("dashboard")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-neutral-800">
            My <span className="text-blue-600">CRM</span>
          </span>
        </div>

        {/* Search */}
        <div className="px-3 pb-3 shrink-0">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-neutral-50 text-neutral-500 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer text-sm"
            aria-label="Open command palette"
          >
            <MagnifyingGlass size={15} weight="regular" />
            <span className="flex-1 text-left text-neutral-400 text-sm">Kërko...</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500 font-mono border border-border">
              <Command size={10} weight="regular" />K
            </kbd>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-primary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={isActive ? "text-primary" : "text-neutral-400"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Notifications above user footer */}
        <div className="px-2 pb-1 shrink-0">
          <NotificationBellButton />
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-neutral-800 truncate">{userName}</p>
                  <p className="text-xs text-neutral-500 truncate">{userEmail}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48 bg-white border border-border shadow-lg rounded-lg">
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); handleLogout(); }}
                className="flex items-center gap-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 px-3 py-2"
              >
                <SignOut size={16} weight="regular" className="text-red-500" />
                Dilni (Logout)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-border h-[60px] flex items-center px-4 md:hidden">
        <div className="flex items-center justify-between w-full">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView("dashboard")}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="text-base font-bold text-neutral-800">My <span className="text-blue-600">CRM</span></span>
          </div>
          <button
            className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Mbyll menunë" : "Hap menunë"}
          >
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <nav
            className="absolute top-[60px] left-0 right-0 bg-white border-b border-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => { setCurrentView(item.view); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors duration-200 cursor-pointer border-l-4 ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                  }`}
                >
                  <span className={isActive ? "text-primary" : "text-neutral-400"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
            <div className="px-6 py-3 border-t border-border">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600">
                <SignOut size={16} /> Dilni (Logout)
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
