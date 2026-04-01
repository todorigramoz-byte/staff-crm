import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Application, ApplicationStage } from "../types";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  CalendarBlank,
  X,
  ArrowRight,
  Note,
  FileText,
  ChatCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterChipGroup from "../components/FilterChipGroup";
import StageBadge from "../components/StageBadge";

type StageFilter =
  | "all"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

const stageFilterOptions: { label: string; value: StageFilter }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const stages: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export default function Applications() {
  const {
    applications,
    selectedApplicationId,
    setSelectedApplicationId,
    updateApplicationStage,
    addToast,
  } = useApp();
  const [filter, setFilter] = useState<StageFilter>("all");

  const filteredApps = applications.filter(
    (a) => filter === "all" || a.stage === filter,
  );
  const selectedApp = applications.find((a) => a.id === selectedApplicationId);

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <img
          src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_2.png"
          alt="no applications illustration"
          className="w-64 h-48 object-contain mb-6"
          loading="lazy"
        />
        <h2 className="text-h3 font-sans font-medium text-foreground mb-2">
          No Applications Yet
        </h2>
        <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
          Share your job listings to start collecting applications from
          candidates.
        </p>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal">
          Share Job Listing
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-h2 font-sans font-medium text-foreground mb-1">
          Applications
        </h1>
        <p className="text-body-sm font-body text-neutral-500">
          {filteredApps.length} application
          {filteredApps.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterChipGroup
          options={stageFilterOptions}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Applications List */}
        <div
          className={`${selectedApp ? "lg:w-80 xl:w-96" : "w-full"} shrink-0`}
        >
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            {filteredApps.length === 0 ? (
              <div className="py-12 text-center">
                <img
                  src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_2.png"
                  alt="no applications illustration"
                  className="w-24 h-18 object-contain mx-auto mb-3"
                  loading="lazy"
                />
                <p className="text-body-sm text-neutral-500 font-body">
                  No applications in this stage
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredApps.map((app, i) => (
                  <button
                    key={app.id}
                    onClick={() =>
                      setSelectedApplicationId(
                        selectedApplicationId === app.id ? null : app.id,
                      )
                    }
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer ${selectedApplicationId === app.id ? "bg-primary/5 border-l-4 border-primary" : "hover:bg-neutral-50 border-l-4 border-transparent"}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="w-9 h-9 rounded-full gradient-primary-bg flex items-center justify-center shrink-0">
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
                      <p className="text-caption text-neutral-500 font-body truncate">
                        {app.job.title}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StageBadge stage={app.stage} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Applicant Profile Panel */}
        {selectedApp ? (
          <ApplicantProfile
            app={selectedApp}
            onClose={() => setSelectedApplicationId(null)}
            onStageChange={(stage) => {
              updateApplicationStage(selectedApp.id, stage);
              addToast(
                `${selectedApp.candidate.name} moved to ${stage}`,
                "success",
              );
            }}
          />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-white rounded-lg border border-border border-dashed py-16">
            <div className="text-center">
              <img
                src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_3.png"
                alt="no interviews illustration"
                className="w-40 h-32 object-contain mx-auto mb-4"
                loading="lazy"
              />
              <p className="text-body text-neutral-500 font-body">
                Select an application to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantProfile({
  app,
  onClose,
  onStageChange,
}: {
  app: Application;
  onClose: () => void;
  onStageChange: (stage: ApplicationStage) => void;
}) {
  const stages: ApplicationStage[] = [
    "applied",
    "screening",
    "interview",
    "offer",
    "hired",
    "rejected",
  ];

  return (
    <div className="flex-1 bg-white rounded-lg border border-border overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary-bg flex items-center justify-center shrink-0">
            <span className="text-body font-medium text-white">
              {app.candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h2 className="text-h4 font-sans font-medium text-foreground">
              {app.candidate.name}
            </h2>
            <p className="text-body-sm text-neutral-500 font-body">
              {app.candidate.currentRole}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer shrink-0"
          aria-label="Close profile"
        >
          <X size={18} weight="regular" />
        </button>
      </div>

      {/* Quick Action Bar */}
      <div className="px-6 py-3 border-b border-border bg-neutral-50 flex items-center gap-2 flex-wrap">
        <span className="text-caption text-neutral-500 font-body mr-1">
          Move to:
        </span>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => onStageChange(stage)}
            className={`px-3 py-1 rounded-full text-caption font-body border transition-all duration-150 cursor-pointer ${app.stage === stage ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-neutral-50 px-4 justify-start gap-0 h-auto p-0">
          {[
            {
              value: "overview",
              label: "Overview",
              icon: <FileText size={14} weight="regular" />,
            },
            {
              value: "resume",
              label: "Resume",
              icon: <Note size={14} weight="regular" />,
            },
            {
              value: "notes",
              label: "Notes",
              icon: <ChatCircle size={14} weight="regular" />,
            },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-4 py-3 text-body-sm font-body rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-neutral-500 hover:text-foreground transition-colors"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">
                Contact
              </h3>
              <div className="flex items-center gap-2 text-body-sm font-body text-neutral-700">
                <EnvelopeSimple
                  size={16}
                  weight="regular"
                  className="text-neutral-400 shrink-0"
                />
                <span className="truncate">{app.candidate.email}</span>
              </div>
              {app.candidate.phone && (
                <div className="flex items-center gap-2 text-body-sm font-body text-neutral-700">
                  <Phone
                    size={16}
                    weight="regular"
                    className="text-neutral-400 shrink-0"
                  />
                  {app.candidate.phone}
                </div>
              )}
              {app.candidate.location && (
                <div className="flex items-center gap-2 text-body-sm font-body text-neutral-700">
                  <MapPin
                    size={16}
                    weight="regular"
                    className="text-neutral-400 shrink-0"
                  />
                  {app.candidate.location}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-caption font-medium text-neutral-500 uppercase tracking-wider font-body">
                Application
              </h3>
              <div className="flex items-center gap-2 text-body-sm font-body text-neutral-700">
                <CalendarBlank
                  size={16}
                  weight="regular"
                  className="text-neutral-400 shrink-0"
                />
                Applied {app.appliedDate}
              </div>
              <div className="flex items-center gap-2 text-body-sm font-body text-neutral-700">
                <ArrowRight
                  size={16}
                  weight="regular"
                  className="text-neutral-400 shrink-0"
                />
                {app.job.title}
              </div>
              <StageBadge stage={app.stage} />
            </div>
          </div>

          <div>
            <h3 className="text-caption font-medium text-neutral-500 uppercase tracking-wider font-body mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {app.candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full text-caption font-body bg-primary/10 text-primary border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {app.interviewDate && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-body-sm font-medium text-purple-700 font-body">
                Interview Scheduled
              </p>
              <p className="text-caption text-purple-600 font-body">
                {app.interviewDate}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resume" className="p-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 border border-border">
              <h3 className="text-body-sm font-medium text-foreground mb-2 font-sans">
                Current Position
              </h3>
              <p className="text-body-sm text-neutral-600 font-body">
                {app.candidate.currentRole || "Not specified"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neutral-50 border border-border">
              <h3 className="text-body-sm font-medium text-foreground mb-2 font-sans">
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {app.candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full text-caption font-body bg-white text-neutral-700 border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-neutral-50 border border-border">
              <p className="text-body-sm text-neutral-500 font-body text-center py-4">
                Full resume document would be displayed here
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="p-6">
          <div className="space-y-4">
            {app.notes ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-body-sm font-medium text-amber-800 mb-1 font-body">
                  Recruiter Notes
                </p>
                <p className="text-body-sm text-amber-700 font-body">
                  {app.notes}
                </p>
              </div>
            ) : (
              <p className="text-body-sm text-neutral-400 font-body text-center py-4">
                No notes yet
              </p>
            )}
            <textarea
              placeholder="Add a note about this candidate..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-body text-foreground placeholder:text-neutral-400 font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal w-full">
              Save Note
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
