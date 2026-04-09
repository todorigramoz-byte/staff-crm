import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { UserCircle } from "@phosphor-icons/react";
import { useApp } from "../context/AppContext";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash,
  X,
  Check,
  CheckSquare,
  Square,
  PencilSimple,
  Flag,
  DotsSixVertical,
  Eye,
  CalendarBlank,
  ArrowRight,
  UserCircleGear,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Priority = "high" | "medium" | "low";
type Column = "todo" | "inprogress" | "done";

const priorityConfig: Record<Priority, { label: string; className: string; dot: string }> = {
  high: { label: "E lartë", className: "bg-red-100 text-red-700", dot: "bg-red-500" },
  medium: { label: "Mesatare", className: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  low: { label: "E ulët", className: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
};

const columnConfig: Record<Column, { label: string; headerClass: string; dotClass: string }> = {
  todo: { label: "Të bëra", headerClass: "bg-neutral-100 text-neutral-600", dotClass: "bg-neutral-400" },
  inprogress: { label: "Në progres", headerClass: "bg-blue-50 text-blue-700", dotClass: "bg-blue-500" },
  done: { label: "Të kryera", headerClass: "bg-green-50 text-green-700", dotClass: "bg-green-500" },
};

const COLUMN_IDS: Column[] = ["todo", "inprogress", "done"];

const STAFF_LIST = ["Erjoni Besimi", "Albani"];

const emptyForm = { title: "", description: "", dueDate: "", priority: "medium" as Priority, column: "todo" as Column, clientId: "", assignedTo: "" };

// ──────────────────────────────────────────
// Task Preview Modal
// ──────────────────────────────────────────
function TaskPreviewModal({
  task,
  columnLabel,
  clientName,
  onClose,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: any;
  columnLabel: string;
  clientName?: string;
  onClose: () => void;
  onEdit: (t: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  const staffInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const staffColor: Record<string, string> = {
    "Erjoni Besimi": "bg-violet-100 text-violet-700",
    "Albani": "bg-emerald-100 text-emerald-700",
  };
  const pri = priorityConfig[task.priority as Priority];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-neutral-900/60" />
      <div
        className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => onToggle(task.id, task.isCompleted)}
              className="mt-0.5 shrink-0 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            >
              {task.isCompleted ? (
                <CheckSquare size={22} weight="fill" className="text-success" />
              ) : (
                <Square size={22} />
              )}
            </button>
            <h2
              className={`text-h4 font-sans font-medium leading-snug ${
                task.isCompleted ? "line-through text-neutral-400" : "text-foreground"
              }`}
            >
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          {task.description ? (
            <div>
              <p className="text-caption text-neutral-400 font-body uppercase tracking-wide mb-1">Përshkrimi</p>
              <p className="text-body font-body text-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-body-sm font-body italic">Nuk ka përshkrim.</span>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Priority */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1 flex items-center gap-1">
                <Flag size={11} weight="fill" /> Prioriteti
              </p>
              <span className={`text-body-sm px-2 py-0.5 rounded-full font-body inline-flex items-center gap-1 ${pri?.className ?? "bg-neutral-100 text-neutral-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pri?.dot ?? "bg-neutral-400"}`} />
                {pri?.label ?? task.priority}
              </span>
            </div>

            {/* Due date */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1 flex items-center gap-1">
                <CalendarBlank size={11} weight="fill" /> Afati
              </p>
              {task.dueDate ? (
                <span className="text-body-sm font-body text-foreground">
                  {new Date(task.dueDate).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              ) : (
                <span className="text-body-sm font-body text-neutral-400 italic">Pa afat</span>
              )}
            </div>

            {/* Client */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1 flex items-center gap-1">
                <UserCircle size={11} weight="fill" /> Klienti
              </p>
              {clientName ? (
                <span className="text-body-sm font-body text-foreground">{clientName}</span>
              ) : (
                <span className="text-body-sm font-body text-neutral-400 italic">Pa klient</span>
              )}
            </div>

            {/* Assigned To */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1 flex items-center gap-1">
                <UserCircleGear size={11} weight="fill" /> Caktuar
              </p>
              {task.assignedTo ? (
                <span className={`text-body-sm font-body inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${staffColor[task.assignedTo] ?? "bg-neutral-100 text-neutral-600"}`}>
                  <span className="w-4 h-4 rounded-full bg-white/60 flex items-center justify-center text-[9px] font-bold">{staffInitials(task.assignedTo)}</span>
                  {task.assignedTo}
                </span>
              ) : (
                <span className="text-body-sm font-body text-neutral-400 italic">Pa caktuar</span>
              )}
            </div>

            {/* Column */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1 flex items-center gap-1">
                <ArrowRight size={11} weight="bold" /> Kolona
              </p>
              <span className="text-body-sm font-body text-foreground">{columnLabel}</span>
            </div>

            {/* Created */}
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-caption text-neutral-400 font-body mb-1">Krijuar</p>
              <span className="text-body-sm font-body text-foreground">
                {new Date(task.createdAt).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex gap-2 justify-end">
          <button
            onClick={() => { onDelete(task.id, task.title); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-body-sm font-body text-error hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            <Trash size={14} />
            Fshi
          </button>
          <button
            onClick={() => { onClose(); onEdit(task); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-body-sm font-body bg-gradient-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <PencilSimple size={14} />
            Redakto
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Sortable Task Card
// ──────────────────────────────────────────
function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
  onPreview,
}: {
  task: any;
  onEdit: (t: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggle: (id: string, current: boolean) => void;
  onPreview: (t: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: "relative",
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="group touch-none">
      <Card className="p-3 bg-white border border-border rounded-lg flex items-start gap-2 hover:shadow-md transition-all duration-200">
        {/* Drag handle — listeners only here */}
        <button
          {...attributes}
          {...listeners}
          tabIndex={0}
          className="mt-0.5 shrink-0 p-1 rounded text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 cursor-grab active:cursor-grabbing touch-none transition-colors"
          aria-label="Tërhiq"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <button
          onClick={() => onToggle(task.id, task.isCompleted)}
          className="shrink-0 mt-0.5 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
        >
          {task.isCompleted ? (
            <CheckSquare size={18} weight="fill" className="text-success" />
          ) : (
            <Square size={18} />
          )}
        </button>

          <div className="flex-1 min-w-0">
          <p
            onClick={() => onPreview(task)}
            className={`text-body-sm font-medium leading-snug cursor-pointer hover:text-primary transition-colors ${
              task.isCompleted ? "line-through text-neutral-400 hover:text-neutral-400" : "text-foreground"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-caption text-neutral-400 font-body mt-0.5 leading-snug line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-caption px-1.5 py-0.5 rounded-full font-body flex items-center gap-1 ${
                priorityConfig[task.priority as Priority]?.className ?? "bg-neutral-100 text-neutral-500"
              }`}
            >
              <Flag size={9} weight="fill" />
              {priorityConfig[task.priority as Priority]?.label ?? task.priority}
            </span>
            {task.dueDate && (
              <span className="text-caption text-neutral-400 font-body">
                {new Date(task.dueDate).toLocaleDateString("sq-AL")}
              </span>
            )}
            {task.clientId && clientMap[task.clientId] && (
              <span className="text-caption text-blue-600 font-body flex items-center gap-0.5">
                <UserCircle size={10} weight="fill" />
                {clientMap[task.clientId]}
              </span>
            )}
            {task.assignedTo && (
              <span className={`text-caption font-body flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${task.assignedTo === "Erjoni Besimi" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                <UserCircleGear size={10} weight="fill" />
                {task.assignedTo.split(" ")[0]}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onPreview(task)}
            className="p-1.5 rounded hover:bg-purple-50 text-neutral-400 hover:text-purple-600 transition-colors cursor-pointer"
            title="Shiko detajet"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            title="Redakto"
          >
            <PencilSimple size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id, task.title)}
            className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
            title="Fshi"
          >
            <Trash size={13} />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────
// Static preview card (used in DragOverlay)
// ──────────────────────────────────────────
function StaticTaskCard({ task }: { task: any }) {
  return (
    <Card className="p-3 bg-white border border-primary shadow-2xl rounded-lg flex items-start gap-2 rotate-1 w-72 opacity-95">
      <div className="mt-0.5 p-1 text-neutral-400">
        <DotsSixVertical size={16} weight="bold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-foreground leading-snug">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-caption px-1.5 py-0.5 rounded-full font-body flex items-center gap-1 ${
              priorityConfig[task.priority as Priority]?.className ?? "bg-neutral-100 text-neutral-500"
            }`}
          >
            <Flag size={9} weight="fill" />
            {priorityConfig[task.priority as Priority]?.label ?? task.priority}
          </span>
          {task.dueDate && (
            <span className="text-caption text-neutral-400 font-body">
              {new Date(task.dueDate).toLocaleDateString("sq-AL")}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────
// Droppable Column wrapper
// ──────────────────────────────────────────
function DroppableColumn({
  col,
  tasks,
  isOver,
  onEdit,
  onDelete,
  onToggle,
  onAddInColumn,
  onPreview,
}: {
  col: Column;
  tasks: any[];
  isOver: boolean;
  onEdit: (t: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggle: (id: string, current: boolean) => void;
  onAddInColumn: (col: Column) => void;
  onPreview: (t: any) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col });
  const cfg = columnConfig[col];

  return (
    <div className="flex-1 min-w-[260px] max-w-sm flex flex-col gap-2">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${cfg.headerClass}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
          <span className="text-body-sm font-medium font-body">{cfg.label}</span>
          <span className="text-caption font-body bg-white/60 rounded-full px-1.5">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddInColumn(col)}
          className="p-1 rounded hover:bg-white/60 transition-colors cursor-pointer text-current"
          aria-label="Shto detyrë"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Droppable area */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-[120px] rounded-lg transition-colors duration-150 p-1 ${
            isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""
          }`}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onPreview={onPreview}
            />
          ))}
          {tasks.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex items-center justify-center transition-colors ${
                isOver ? "border-primary/40 bg-primary/5" : "border-neutral-200"
              }`}
            >
              <span className="text-caption text-neutral-400 font-body">Zvarrit këtu</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ──────────────────────────────────────────
// Main Tasks Component
// ──────────────────────────────────────────
export default function Tasks() {
  const { addToast } = useApp();
  const { data: tasks, isPending } = useQuery("Task", { orderBy: { createdAt: "asc" } });
  const { data: clients } = useQuery("Client", { orderBy: { name: "asc" } });
  const { create, update, remove, isPending: mutating } = useMutation("Task");
  const clientMap: Record<string, string> = Object.fromEntries(
    (clients ?? []).map((c) => [c.id, c.name])
  );

  const staffColor: Record<string, string> = {
    "Erjoni Besimi": "bg-violet-100 text-violet-700 border-violet-200",
    "Albani": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const [columnMap, setColumnMap] = useState<Record<string, Column>>({});
  const [orderedIds, setOrderedIds] = useState<Record<Column, string[]>>({
    todo: [],
    inprogress: [],
    done: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColId, setOverColId] = useState<Column | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewTask, setPreviewTask] = useState<any | null>(null);

  // Three separate sensors — pointer for desktop, mouse as fallback, touch for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    })
  );

  // Sync orderedIds when tasks load/change
  useEffect(() => {
    if (!tasks) return;

    setColumnMap((prev) => {
      const next = { ...prev };
      tasks.forEach((t) => {
        if (!next[t.id]) {
          next[t.id] = t.isCompleted ? "done" : "todo";
        }
      });
      return next;
    });

    setOrderedIds((prev) => {
      const validIds = new Set(tasks.map((t) => t.id));
      const cols: Record<Column, string[]> = { todo: [], inprogress: [], done: [] };

      COLUMN_IDS.forEach((col) => {
        // keep existing ordered IDs that still exist
        cols[col] = prev[col].filter((id) => validIds.has(id));
      });

      // append brand-new IDs not yet placed
      const placed = new Set([...cols.todo, ...cols.inprogress, ...cols.done]);
      tasks.forEach((t) => {
        if (!placed.has(t.id)) {
          const c: Column = columnMap[t.id] ?? (t.isCompleted ? "done" : "todo");
          cols[c].push(t.id);
        }
      });

      return cols;
    });
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const taskMap: Record<string, any> = Object.fromEntries(
    (tasks ?? []).map((t) => [t.id, t])
  );

  const columns: Record<Column, any[]> = {
    todo: orderedIds.todo.map((id) => taskMap[id]).filter(Boolean),
    inprogress: orderedIds.inprogress.map((id) => taskMap[id]).filter(Boolean),
    done: orderedIds.done.map((id) => taskMap[id]).filter(Boolean),
  };

  const activeTask = activeId ? taskMap[activeId] : null;

  const findColumn = (id: string): Column | null => {
    for (const col of COLUMN_IDS) {
      if (orderedIds[col].includes(id)) return col;
    }
    return null;
  };

  // ── Drag handlers ──────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) { setOverColId(null); return; }

    const overId = over.id as string;
    // over a column droppable directly?
    if (COLUMN_IDS.includes(overId as Column)) {
      setOverColId(overId as Column);
      return;
    }
    // over another card — use its column
    const col = findColumn(overId);
    setOverColId(col);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverColId(null);
    if (!over) return;

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    const sourceCol = findColumn(activeIdStr);

    // Determine destination column
    let destCol: Column;
    if (COLUMN_IDS.includes(overId as Column)) {
      destCol = overId as Column;
    } else {
      destCol = findColumn(overId) ?? sourceCol!;
    }

    if (!sourceCol) return;

    if (sourceCol === destCol) {
      // Reorder within column
      if (overId === activeIdStr || COLUMN_IDS.includes(overId as Column)) return;
      setOrderedIds((prev) => {
        const col = [...prev[sourceCol]];
        const oldIdx = col.indexOf(activeIdStr);
        const newIdx = col.indexOf(overId);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return { ...prev, [sourceCol]: arrayMove(col, oldIdx, newIdx) };
      });
    } else {
      // Cross-column move
      setColumnMap((prev) => ({ ...prev, [activeIdStr]: destCol }));
      setOrderedIds((prev) => {
        const src = prev[sourceCol].filter((id) => id !== activeIdStr);
        const dst = [...prev[destCol]];
        const overIdx = dst.indexOf(overId);
        if (overIdx >= 0) {
          dst.splice(overIdx, 0, activeIdStr);
        } else {
          dst.push(activeIdStr);
        }
        return { ...prev, [sourceCol]: src, [destCol]: dst };
      });

      const isCompleted = destCol === "done";
      try {
        await update(activeIdStr, { isCompleted });
      } catch {
        addToast("Gabim gjatë përditësimit.", "error");
      }
    }
  };

  // ── CRUD helpers ───────────────────────────
  const openCreate = (col: Column = "todo") => {
    setEditId(null);
    setForm({ ...emptyForm, column: col });
    setModalOpen(true);
  };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      title: t.title,
      description: t.description ?? "",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
      priority: t.priority as Priority,
      column: (columnMap[t.id] ?? (t.isCompleted ? "done" : "todo")) as Column,
      clientId: t.clientId ?? "",
      assignedTo: t.assignedTo ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      addToast("Titulli është i detyrueshëm.", "error");
      return;
    }
    try {
      const isCompleted = form.column === "done";
      const payload = {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        priority: form.priority,
        isCompleted,
        clientId: form.clientId || undefined,
        assignedTo: form.assignedTo || undefined,
      };
      if (editId) {
        await update(editId, payload);
        setColumnMap((prev) => ({ ...prev, [editId]: form.column }));
        setOrderedIds((prev) => {
          const prevCol = findColumn(editId);
          if (!prevCol || prevCol === form.column) return prev;
          const src = prev[prevCol].filter((id) => id !== editId);
          const dst = [...prev[form.column], editId];
          return { ...prev, [prevCol]: src, [form.column]: dst };
        });
        addToast("Detyra u përditësua!", "success");
      } else {
        const newTask = await create(payload);
        setColumnMap((prev) => ({ ...prev, [newTask.id]: form.column }));
        setOrderedIds((prev) => ({
          ...prev,
          [form.column]: [...prev[form.column], newTask.id],
        }));
        addToast("Detyra u shtua!", "success");
      }
      setModalOpen(false);
    } catch {
      addToast("Gabim gjatë ruajtjes.", "error");
    }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    const isCompleted = !current;
    const destCol: Column = isCompleted ? "done" : "todo";
    setColumnMap((prev) => ({ ...prev, [id]: destCol }));
    setOrderedIds((prev) => {
      const srcCol = findColumn(id);
      if (!srcCol || srcCol === destCol) return prev;
      return {
        ...prev,
        [srcCol]: prev[srcCol].filter((x) => x !== id),
        [destCol]: [...prev[destCol], id],
      };
    });
    try {
      await update(id, { isCompleted });
    } catch {
      addToast("Gabim.", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Fshi detyrën "${title}"?`)) return;
    setOrderedIds((prev) => {
      const col = findColumn(id);
      if (!col) return prev;
      return { ...prev, [col]: prev[col].filter((x) => x !== id) };
    });
    try {
      await remove(id);
      addToast(`"${title}" u fshi.`, "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const totalOpen = (tasks ?? []).filter((t) => !t.isCompleted).length;
  const totalDone = (tasks ?? []).filter((t) => t.isCompleted).length;

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Detyrat</h1>
          <p className="text-body-sm font-body text-neutral-500">
            {totalOpen} të hapura · {totalDone} të kryera
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Detyrë e Re
        </Button>
      </div>

      {/* Board */}
      {isPending ? (
        <div className="flex gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="h-10 rounded-lg bg-neutral-100 animate-skeleton-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 rounded-lg bg-neutral-100 animate-skeleton-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start overflow-x-auto pb-4">
            {COLUMN_IDS.map((col) => (
              <DroppableColumn
                key={col}
                col={col}
                tasks={columns[col]}
                isOver={overColId === col}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={toggleComplete}
                onAddInColumn={openCreate}
                onPreview={(t) => setPreviewTask(t)}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {activeTask ? <StaticTaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Preview Modal */}
      {previewTask && (
        <TaskPreviewModal
          task={previewTask}
          columnLabel={columnConfig[columnMap[previewTask.id] ?? (previewTask.isCompleted ? "done" : "todo")]?.label ?? "—"}
          clientName={previewTask.clientId ? clientMap[previewTask.clientId] : undefined}
          onClose={() => setPreviewTask(null)}
          onEdit={(t) => { setPreviewTask(null); openEdit(t); }}
          onDelete={(id, title) => { setPreviewTask(null); handleDelete(id, title); }}
          onToggle={(id, cur) => { toggleComplete(id, cur); setPreviewTask((prev: any) => prev ? { ...prev, isCompleted: !cur } : null); }}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setModalOpen(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div
            className="relative w-full max-w-md bg-white rounded-xl border border-border shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                {editId ? "Redakto Detyrën" : "Detyrë e Re"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Titulli *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Çfarë duhet bërë?"
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Përshkrimi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detaje shtesë (opsionale)..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2 font-body">
                  Kolona
                </label>
                <div className="flex gap-2">
                  {COLUMN_IDS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, column: c })}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        form.column === c
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-neutral-600 border-border hover:border-primary"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          form.column === c ? "bg-white" : columnConfig[c].dotClass
                        }`}
                      />
                      {columnConfig[c].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Cakto stafit (opsionale)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, assignedTo: "" })}
                    className={`flex-1 py-2 px-3 rounded-md text-body-sm font-body border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.assignedTo === ""
                        ? "bg-neutral-100 text-neutral-600 border-neutral-300"
                        : "bg-white text-neutral-400 border-border hover:border-neutral-400"
                    }`}
                  >
                    Pa caktuar
                  </button>
                  {STAFF_LIST.map((staff) => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setForm({ ...form, assignedTo: form.assignedTo === staff ? "" : staff })}
                      className={`flex-1 py-2 px-3 rounded-md text-body-sm font-body border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        form.assignedTo === staff
                          ? staff === "Erjoni Besimi"
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-emerald-600 text-white border-emerald-600"
                          : staffColor[staff] + " border"
                      }`}
                    >
                      <UserCircleGear size={14} weight="fill" />
                      {staff.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Klienti (opsionale)
                </label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">— Pa klient —</option>
                  {(clients ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Afati
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2 font-body">
                  Prioriteti
                </label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2 rounded-md text-body-sm font-body border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        form.priority === p
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-neutral-600 border-border hover:border-primary"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          form.priority === p ? "bg-white" : priorityConfig[p].dot
                        }`}
                      />
                      {priorityConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="bg-transparent border-border text-neutral-600 hover:bg-neutral-50 font-normal"
              >
                Anulo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={mutating}
                className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2"
              >
                <Check size={16} />
                {mutating ? "Duke ruajtur..." : editId ? "Përditëso" : "Shto"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
