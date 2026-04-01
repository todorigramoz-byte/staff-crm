import React from "react";
import { ApplicationStage } from "../types";

const stageConfig: Record<
  ApplicationStage,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
  screening: {
    label: "Screening",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  interview: {
    label: "Interview",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  offer: {
    label: "Offer",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  hired: {
    label: "Hired",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function StageBadge({ stage }: { stage: ApplicationStage }) {
  const config = stageConfig[stage];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
