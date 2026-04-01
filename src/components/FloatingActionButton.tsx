import React from "react";
import { Plus } from "@phosphor-icons/react";
import { useApp } from "../context/AppContext";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingActionButton({
  onClick,
  label = "Add Job",
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-30 flex items-center gap-2 px-5 py-3 rounded-full gradient-primary-bg text-primary-foreground font-medium text-body shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 cursor-pointer"
      aria-label={label}
    >
      <Plus size={20} weight="regular" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
