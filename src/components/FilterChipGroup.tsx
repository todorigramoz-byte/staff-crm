import React from "react";

interface FilterChipGroupProps<T extends string> {
  options: { label: string; value: T }[];
  selected: T;
  onChange: (value: T) => void;
}

export default function FilterChipGroup<T extends string>({
  options,
  selected,
  onChange,
}: FilterChipGroupProps<T>) {
  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      role="group"
      aria-label="Filter options"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-body-sm font-body transition-all duration-200 cursor-pointer border ${
            selected === opt.value
              ? "bg-primary text-primary-foreground border-primary font-medium"
              : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"
          }`}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
