import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-border p-6 animate-pulse">
      <div className="skeleton h-4 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border animate-pulse">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-4 w-12 rounded ml-auto" />
    </div>
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}
