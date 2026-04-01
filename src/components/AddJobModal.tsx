import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddJobModal({ open, onClose }: AddJobModalProps) {
  const { addJob, addToast } = useApp();
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time" as "full-time" | "part-time" | "contract" | "remote",
    status: "draft" as "active" | "closed" | "draft",
    description: "",
    salary: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.department) return;
    addJob(form);
    addToast(`Job "${form.title}" created successfully!`, "success");
    setForm({
      title: "",
      department: "",
      location: "",
      type: "full-time",
      status: "draft",
      description: "",
      salary: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border border-border rounded-xl shadow-xl max-w-lg w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-h4 font-sans font-medium text-foreground">
            Create New Job
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Job Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Senior Developer"
                required
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Department *
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="e.g. Engineering"
                required
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Remote"
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Salary Range
              </label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salary: e.target.value }))
                }
                placeholder="e.g. $80k - $120k"
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as typeof form.type,
                  }))
                }
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as typeof form.status,
                  }))
                }
                className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent text-neutral-600 border-border hover:bg-neutral-50 hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal"
            >
              Create Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
