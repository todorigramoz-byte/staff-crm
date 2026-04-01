import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LangContext";
import { View } from "../types";
import {
  MagnifyingGlass,
  SquaresFour,
  Users,
  Receipt,
  CheckSquare,
  Gear,
  SignOut,
  List,
  X,
  Command,
  Funnel,
  Package,
  EnvelopeSimple,
  Invoice,
  Globe,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TopNavBar() {
  const { currentView, setCurrentView, setCommandPaletteOpen } = useApp();
  const { lang, setLang, t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = localStorage.getItem("userName") || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.dispatchEvent(new Event("authChange"));
  };

  const navItems: { labelKey: string; view: View; icon: React.ReactNode }[] = [
    { labelKey: "nav_dashboard", view: "dashboard", icon: <SquaresFour size={18} weight="regular" /> },
    { labelKey: "nav_leads", view: "leads", icon: <Funnel size={18} weight="regular" /> },
    { labelKey: "nav_clients", view: "clients", icon: <Users size={18} weight="regular" /> },
    { labelKey: "nav_invoices", view: "invoices", icon: <Receipt size={18} weight="regular" /> },
    { labelKey: "nav_bills", view: "bills", icon: <Invoice size={18} weight="regular" /> },
    { labelKey: "nav_tasks", view: "tasks", icon: <CheckSquare size={18} weight="regular" /> },
    { labelKey: "nav_products", view: "products", icon: <Package size={18} weight="regular" /> },
    { labelKey: "nav_emails", view: "emails", icon: <EnvelopeSimple size={18} weight="regular" /> },
    { labelKey: "nav_settings", view: "settings", icon: <Gear size={18} weight="regular" /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-border h-[72px] flex items-center">
        <div className="w-full max-w-app mx-auto px-6 flex items-center justify-between gap-4">
          {/* Logo — clickable → dashboard */}
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Go to Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Users size={18} weight="fill" className="text-white" />
            </div>
            <span className="font-sans font-medium text-h4 text-foreground tracking-tight">
              My CRM
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-body-sm font-body transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-primary"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={isActive ? "text-primary" : "text-neutral-500"}>
                    {item.icon}
                  </span>
                  {t(item.labelKey as any)}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "sq" ? "en" : "sq")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-neutral-50 text-neutral-600 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer text-body-sm font-body"
              title={lang === "sq" ? "Switch to English" : "Kalo në Shqip"}
            >
              <Globe size={15} weight="regular" />
              <span className="font-medium text-caption">{lang === "sq" ? "EN" : "SQ"}</span>
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-neutral-50 text-neutral-500 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer text-body-sm font-body"
              aria-label="Open command palette"
            >
              <MagnifyingGlass size={16} weight="regular" />
              <span className="hidden sm:inline text-body-sm text-neutral-400">{t("nav_search")}</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption bg-neutral-100 text-neutral-500 font-mono border border-border">
                <Command size={10} weight="regular" />K
              </kbd>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
                  aria-label="User menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-white text-caption font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg rounded-lg">
                <div className="px-3 py-2">
                  <p className="text-body-sm font-medium text-foreground">{userName}</p>
                  <p className="text-caption text-neutral-500">{userEmail}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-body-sm text-error cursor-pointer hover:bg-red-50 px-3 py-2"
                >
                  <SignOut size={16} weight="regular" className="text-error" />
                  {t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="md:hidden p-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} weight="regular" /> : <List size={22} weight="regular" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/60" />
          <nav
            className="absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-lg animate-slide-in-bottom"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setCurrentView(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-body font-body transition-colors duration-200 cursor-pointer border-l-4 ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                  }`}
                >
                  <span className={isActive ? "text-primary" : "text-neutral-500"}>{item.icon}</span>
                  {t(item.labelKey as any)}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
