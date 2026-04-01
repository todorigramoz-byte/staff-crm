import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { View } from "../types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export type Currency = "EUR" | "ALL";

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "EUR") {
    return "€" + amount.toLocaleString("sq-AL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  return amount.toLocaleString("sq-AL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " L";
}

interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (amount: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currency, setCurrencyState] = useState<Currency>(
    () => (localStorage.getItem("crmCurrency") as Currency) || "EUR"
  );

  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem("crmCurrency", c);
    setCurrencyState(c);
  }, []);

  const fmt = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
        currency,
        setCurrency,
        fmt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
