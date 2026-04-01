import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Command } from "cmdk";
import {
  MagnifyingGlass,
  Users,
  Receipt,
  CalendarCheck,
  CheckSquare,
  SquaresFour,
  Gear,
  Plus,
  ArrowRight,
  X,
} from "@phosphor-icons/react";

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentView } = useApp();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const navItems = [
    { label: "Dashboard", view: "dashboard" as const, icon: <SquaresFour size={16} /> },
    { label: "Klientët", view: "clients" as const, icon: <Users size={16} /> },
    { label: "Faturat", view: "invoices" as const, icon: <Receipt size={16} /> },
    { label: "Takimet", view: "appointments" as const, icon: <CalendarCheck size={16} /> },
    { label: "Detyrat", view: "tasks" as const, icon: <CheckSquare size={16} /> },
    { label: "Cilësimet", view: "settings" as const, icon: <Gear size={16} /> },
  ];

  const filtered = navItems.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase()),
  );

  const quickActions = [
    { label: "Shto Klient", view: "clients" as const, icon: <Plus size={16} className="text-primary" /> },
    { label: "Krijo Faturë", view: "invoices" as const, icon: <Plus size={16} className="text-tertiary" /> },
    { label: "Takim i Ri", view: "appointments" as const, icon: <Plus size={16} className="text-accent" /> },
    { label: "Detyrë e Re", view: "tasks" as const, icon: <Plus size={16} className="text-success" /> },
  ].filter((a) => a.label.toLowerCase().includes(search.toLowerCase()) || search === "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => setCommandPaletteOpen(false)}>
      <div className="absolute inset-0 bg-neutral-900/60" />
      <div
        className="relative w-full max-w-xl bg-white rounded-xl border border-border shadow-xl animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
      >
        <Command className="w-full" shouldFilter={false}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <MagnifyingGlass size={18} className="text-neutral-400 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Kërko ose navigo..."
              className="flex-1 bg-transparent text-body text-foreground placeholder:text-neutral-400 outline-none font-body"
              autoFocus
            />
            <button onClick={() => setCommandPaletteOpen(false)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto py-2">
            <Command.Empty className="py-8 text-center text-body-sm text-neutral-400 font-body">
              Asnjë rezultat.
            </Command.Empty>

            <Command.Group heading={<span className="px-3 py-1 text-caption text-neutral-400 font-medium uppercase tracking-wider font-body">Navigim</span>}>
              {filtered.map((item) => (
                <Command.Item
                  key={item.view}
                  onSelect={() => { setCurrentView(item.view); setCommandPaletteOpen(false); setSearch(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary/5 text-body-sm text-foreground font-body transition-colors"
                >
                  <span className="text-neutral-500">{item.icon}</span>
                  {item.label}
                  <ArrowRight size={14} className="ml-auto text-neutral-300" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading={<span className="px-3 py-1 text-caption text-neutral-400 font-medium uppercase tracking-wider font-body">Veprime të shpejta</span>}>
              {quickActions.map((action) => (
                <Command.Item
                  key={action.label}
                  onSelect={() => { setCurrentView(action.view); setCommandPaletteOpen(false); setSearch(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary/5 text-body-sm text-foreground font-body transition-colors"
                >
                  {action.icon}
                  {action.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-caption text-neutral-400 font-body">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 border border-border font-mono text-caption">↑↓</kbd> navigo
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 border border-border font-mono text-caption">↵</kbd> zgjidh
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 border border-border font-mono text-caption">Esc</kbd> mbyll
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
