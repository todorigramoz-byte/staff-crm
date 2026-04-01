import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LangProvider } from "./context/LangContext";
import TopNavBar from "./components/TopNavBar";
import CommandPalette from "./components/CommandPalette";
import ToastContainer from "./components/ToastContainer";
import Dashboard from "./views/Dashboard";
import Clients from "./views/Clients";
import Invoices from "./views/Invoices";
import Tasks from "./views/Tasks";
import Leads from "./views/Leads";
import Products from "./views/Products";
import Emails from "./views/Emails";
import Bills from "./views/Bills";
import Settings from "./views/Settings";
import Login from "./views/Login";
import "./index.css";

function AppShell() {
  const { currentView } = useApp();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  // Not authenticated → show login page
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-body-sm"
      >
        Skip to content
      </a>

      <TopNavBar />
      <CommandPalette />

      <main id="main-content" className="pt-[72px] min-h-screen" tabIndex={-1}>
        <div className="max-w-app mx-auto px-4 sm:px-6 py-8">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "leads" && <Leads />}
          {currentView === "clients" && <Clients />}
          {currentView === "invoices" && <Invoices />}
          {currentView === "bills" && <Bills />}
          {currentView === "tasks" && <Tasks />}
          {currentView === "products" && <Products />}
          {currentView === "emails" && <Emails />}
          {currentView === "settings" && <Settings />}
        </div>
      </main>

      <footer className="hidden md:flex items-center justify-between px-6 py-3 border-t border-border bg-white text-caption text-neutral-400 font-body">
        <span>CRM v2.0</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          <span>All systems operational</span>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </LangProvider>
  );
}
