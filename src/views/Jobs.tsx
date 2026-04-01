import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Job, JobStatus } from "../types";
import {
  Plus,
  PencilSimple,
  Copy,
  Archive,
  Briefcase,
  MapPin,
  Clock,
  Users,
  X,
  Check,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterChipGroup from "../components/FilterChipGroup";
import FloatingActionButton from "../components/FloatingActionButton";
import StageBadge from "../components/StageBadge";
import AddJobModal from "../components/AddJobModal";

type FilterType = "all" | JobStatus;

const filterOptions: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
  { label: "Draft", value: "draft" },
];

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  closed: {
    label: "Closed",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function Jobs() {
  const {
    jobs,
    applications,
    selectedJobId,
    setSelectedJobId,
    deleteJob,
    updateJob,
    addToast,
  } = useApp();
  const [filter, setFilter] = useState<FilterType>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sortField, setSortField] = useState<
    "title" | "datePosted" | "applicantsCount"
  >("datePosted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredJobs = jobs
    .filter((j) => filter === "all" || j.status === filter)
    .sort((a, b) => {
      let av: string | number = a[sortField];
      let bv: string | number = b[sortField];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const jobApplications = applications.filter((a) => a.jobId === selectedJobId);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field)
      return (
        <CaretDown size={12} weight="regular" className="text-neutral-300" />
      );
    return sortDir === "asc" ? (
      <CaretUp size={12} weight="regular" className="text-primary" />
    ) : (
      <CaretDown size={12} weight="regular" className="text-primary" />
    );
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <img
          src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_1.png"
          alt="no jobs illustration"
          className="w-64 h-48 object-contain mb-6"
          loading="lazy"
        />
        <h2 className="text-h3 font-sans font-medium text-foreground mb-2">
          No Jobs Yet
        </h2>
        <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
          Create your first job posting to start attracting great candidates.
        </p>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2"
        >
          <Plus size={18} weight="regular" />
          Create Job
        </Button>
        <AddJobModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">
            Jobs
          </h1>
          <p className="text-body-sm font-body text-neutral-500">
            {filteredJobs.length} position{filteredJobs.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} weight="regular" />
          Add Job
        </Button>
      </div>

      <FilterChipGroup
        options={filterOptions}
        selected={filter}
        onChange={setFilter}
      />

      <div
        className={`mt-6 flex gap-6 ${selectedJob ? "flex-col xl:flex-row" : ""}`}
      >
        {/* Jobs Table */}
        <div className={`${selectedJob ? "xl:flex-1" : "w-full"}`}>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-4 py-3">
                    <button
                      onClick={() => handleSort("title")}
                      className="flex items-center gap-1 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body cursor-pointer hover:text-primary transition-colors"
                    >
                      Job Title <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">
                    Status
                  </th>
                  <th className="text-left px-4 py-3">
                    <button
                      onClick={() => handleSort("applicantsCount")}
                      className="flex items-center gap-1 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body cursor-pointer hover:text-primary transition-colors"
                    >
                      Applicants <SortIcon field="applicantsCount" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button
                      onClick={() => handleSort("datePosted")}
                      className="flex items-center gap-1 text-caption font-medium text-neutral-500 uppercase tracking-wider font-body cursor-pointer hover:text-primary transition-colors"
                    >
                      Posted <SortIcon field="datePosted" />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.map((job, i) => (
                  <tr
                    key={job.id}
                    onClick={() =>
                      setSelectedJobId(selectedJobId === job.id ? null : job.id)
                    }
                    className={`group cursor-pointer transition-colors duration-150 ${selectedJobId === job.id ? "bg-primary/5" : "hover:bg-neutral-50"}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Briefcase
                            size={16}
                            weight="regular"
                            className="text-primary"
                          />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-foreground">
                            {job.title}
                          </p>
                          <p className="text-caption text-neutral-400 font-body">
                            {job.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 font-body">
                      {job.department}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium border ${statusConfig[job.status].className}`}
                      >
                        {statusConfig[job.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 font-body">
                      <div className="flex items-center gap-1">
                        <Users
                          size={14}
                          weight="regular"
                          className="text-neutral-400"
                        />
                        {job.applicantsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-neutral-500 font-body">
                      {job.datePosted}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToast(`Editing "${job.title}"`, "info");
                          }}
                          className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                          aria-label="Edit job"
                        >
                          <PencilSimple size={14} weight="regular" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToast(`Duplicated "${job.title}"`, "success");
                          }}
                          className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                          aria-label="Duplicate job"
                        >
                          <Copy size={14} weight="regular" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateJob(job.id, { status: "closed" });
                            addToast(`Archived "${job.title}"`, "info");
                          }}
                          className="p-1.5 rounded hover:bg-amber-50 text-neutral-400 hover:text-amber-600 transition-colors cursor-pointer"
                          aria-label="Archive job"
                        >
                          <Archive size={14} weight="regular" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job.id);
                            addToast(`Deleted "${job.title}"`, "error");
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
                          aria-label="Delete job"
                        >
                          <X size={14} weight="regular" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                onClick={() =>
                  setSelectedJobId(selectedJobId === job.id ? null : job.id)
                }
                className={`p-4 bg-white border border-border rounded-lg cursor-pointer transition-all duration-200 ${selectedJobId === job.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-body-sm font-medium text-foreground">
                      {job.title}
                    </p>
                    <p className="text-caption text-neutral-500 font-body">
                      {job.department}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium border shrink-0 ${statusConfig[job.status].className}`}
                  >
                    {statusConfig[job.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-caption text-neutral-500 font-body">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} weight="regular" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} weight="regular" />
                    {job.applicantsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} weight="regular" />
                    {job.datePosted}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Job Details Drawer */}
        {selectedJob && (
          <div className="xl:w-96 bg-white rounded-lg border border-border overflow-hidden animate-slide-in-right">
            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3">
              <div>
                <h2 className="text-h4 font-sans font-medium text-foreground">
                  {selectedJob.title}
                </h2>
                <p className="text-body-sm text-neutral-500 font-body">
                  {selectedJob.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobId(null)}
                className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer shrink-0"
                aria-label="Close details"
              >
                <X size={18} weight="regular" />
              </button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border bg-neutral-50 px-4 justify-start gap-0 h-auto p-0">
                {["overview", "applicants", "settings"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="capitalize px-4 py-3 text-body-sm font-body rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-neutral-500 hover:text-foreground transition-colors"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium border ${statusConfig[selectedJob.status].className}`}
                  >
                    {statusConfig[selectedJob.status].label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium border bg-blue-50 text-blue-700 border-blue-200">
                    {selectedJob.type}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-body-sm font-body text-neutral-600">
                    <MapPin
                      size={16}
                      weight="regular"
                      className="text-neutral-400"
                    />
                    {selectedJob.location}
                  </div>
                  {selectedJob.salary && (
                    <div className="flex items-center gap-2 text-body-sm font-body text-neutral-600">
                      <Check
                        size={16}
                        weight="regular"
                        className="text-success"
                      />
                      {selectedJob.salary}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-body-sm font-body text-neutral-600">
                    <Clock
                      size={16}
                      weight="regular"
                      className="text-neutral-400"
                    />
                    Posted {selectedJob.datePosted}
                  </div>
                </div>
                <div>
                  <h3 className="text-body-sm font-medium text-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-body-sm font-body text-neutral-600 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="applicants" className="p-4">
                {jobApplications.length === 0 ? (
                  <div className="py-8 text-center">
                    <img
                      src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_2.png"
                      alt="no applications illustration"
                      className="w-32 h-24 object-contain mx-auto mb-3"
                      loading="lazy"
                    />
                    <p className="text-body-sm text-neutral-500 font-body">
                      No applications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full gradient-primary-bg flex items-center justify-center shrink-0">
                          <span className="text-caption font-medium text-white">
                            {app.candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-foreground truncate">
                            {app.candidate.name}
                          </p>
                          <p className="text-caption text-neutral-400 font-body">
                            {app.appliedDate}
                          </p>
                        </div>
                        <StageBadge stage={app.stage} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="p-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-caption font-medium text-neutral-500 uppercase tracking-wider font-body block mb-1">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {(["active", "closed", "draft"] as JobStatus[]).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => {
                              updateJob(selectedJob.id, { status: s });
                              addToast(`Job status updated to ${s}`, "success");
                            }}
                            className={`px-3 py-1.5 rounded-md text-body-sm font-body border transition-colors cursor-pointer ${selectedJob.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteJob(selectedJob.id);
                      setSelectedJobId(null);
                      addToast("Job deleted", "error");
                    }}
                    className="bg-error text-error-foreground hover:bg-red-600 font-normal"
                  >
                    Delete Job
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setAddModalOpen(true)} />
      <AddJobModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
