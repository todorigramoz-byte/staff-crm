import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] max-w-sm ${
              toast.type === "success"
                ? "bg-white border-success/30 text-foreground"
                : toast.type === "error"
                  ? "bg-white border-error/30 text-foreground"
                  : "bg-white border-primary/30 text-foreground"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle
                size={20}
                weight="fill"
                className="text-success shrink-0"
              />
            )}
            {toast.type === "error" && (
              <XCircle
                size={20}
                weight="fill"
                className="text-error shrink-0"
              />
            )}
            {toast.type === "info" && (
              <Info size={20} weight="fill" className="text-primary shrink-0" />
            )}
            <span className="flex-1 text-body-sm font-body text-foreground">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X size={14} weight="regular" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
