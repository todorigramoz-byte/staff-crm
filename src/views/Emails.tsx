import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useApp } from "../context/AppContext";
import {
  Plus,
  Trash,
  X,
  PaperPlaneRight,
  MagnifyingGlass,
  EnvelopeSimple,
  EnvelopeOpen,
  User,
  Clock,
  ArrowCounterClockwise,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendEmail, isEmailConfigured, EMAIL_TEMPLATES, type EmailTemplate } from "@/lib/emailService";

const emptyForm = {
  toClientId: "",
  toEmail: "",
  subject: "",
  body: "",
};

export default function Emails() {
  const { addToast } = useApp();
  const { data: emails, isPending } = useQuery("Email" as any, { orderBy: { createdAt: "desc" } } as any);
  const { data: clients } = useQuery("Client");
  const { create, remove, isPending: mutating } = useMutation("Email" as any);

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [previewEmail, setPreviewEmail] = useState<any>(null);

  const clientMap = Object.fromEntries((clients ?? []).map((c: any) => [c.id, c]));

  // Auto-open compose if navigated from Clients view
  useEffect(() => {
    const preselectedClientId = sessionStorage.getItem("compose_clientId");
    if (preselectedClientId) {
      sessionStorage.removeItem("compose_clientId");
      const client = (clients ?? []).find((c: any) => c.id === preselectedClientId);
      if (client) {
        setForm({
          toClientId: (client as any).id,
          toEmail: (client as any).email,
          subject: "",
          body: "",
        });
        setComposeOpen(true);
      }
    }
  }, [clients]);

  const emailList: any[] = (emails as any) ?? [];

  const filtered = emailList.filter((e: any) => {
    const client = clientMap[e.toClientId];
    const matchSearch =
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.toEmail.toLowerCase().includes(search.toLowerCase()) ||
      ((client as any)?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchClient = clientFilter === "all" || e.toClientId === clientFilter;
    return matchSearch && matchClient;
  });

  const openCompose = (clientId?: string) => {
    const client: any = clientId ? clientMap[clientId] : null;
    setSelectedTemplate(EMAIL_TEMPLATES[0]);
    setForm({
      toClientId: clientId ?? "",
      toEmail: client?.email ?? "",
      subject: "",
      body: "",
    });
    setComposeOpen(true);
  };

  const applyTemplate = (template: EmailTemplate, clientName: string) => {
    setSelectedTemplate(template);
    if (template.id === "custom") {
      // Don't override subject/body when switching to custom
      setForm((f) => ({ ...f }));
      return;
    }
    const body = template.defaultBody.replace(/\{\{to_name\}\}/g, clientName || "klienti");
    setForm((f) => ({
      ...f,
      subject: template.defaultSubject,
      body,
    }));
  };

  const handleClientChange = (clientId: string) => {
    const client: any = clientMap[clientId];
    const newForm = {
      ...form,
      toClientId: clientId,
      toEmail: client?.email ?? "",
    };
    setForm(newForm);
    // Re-apply current template with new client name if a template is selected
    if (selectedTemplate.id !== "custom" && clientId) {
      const body = selectedTemplate.defaultBody.replace(/\{\{to_name\}\}/g, client?.name ?? "klienti");
      setForm({
        ...newForm,
        subject: selectedTemplate.defaultSubject,
        body,
      });
    }
  };

  const handleSend = async () => {
    if (!form.toClientId || !form.toEmail.trim() || !form.subject.trim() || !form.body.trim()) {
      addToast("Plotëso të gjitha fushat e detyrueshme.", "error");
      return;
    }

    try {
      const client: any = clientMap[form.toClientId];
      await sendEmail({
        toEmail: form.toEmail,
        toName: client?.name ?? form.toEmail,
        subject: form.subject,
        message: form.body,
        fromName: "CRM",
        templateId: selectedTemplate.templateId,
      });

      await (create as any)({
        toClientId: form.toClientId,
        toEmail: form.toEmail,
        subject: form.subject,
        body: form.body,
        status: "sent",
        sentAt: new Date(),
      });

      if (isEmailConfigured()) {
        addToast("Email-i u dërgua me sukses!", "success");
      } else {
        addToast("Hapet klienti juaj i emailit — klikoni Dërgo aty.", "info");
      }
      setComposeOpen(false);
      setForm(emptyForm);
      setSelectedTemplate(EMAIL_TEMPLATES[0]);
    } catch (err: any) {
      addToast(`Gabim gjatë dërgimit: ${err?.text ?? err?.message ?? "error i panjohur"}`, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Fshi këtë email nga historia?")) return;
    try {
      await (remove as any)(id);
      addToast("Email-i u fshi.", "info");
    } catch {
      addToast("Gabim gjatë fshirjes.", "error");
    }
  };

  const sentCount = emailList.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-sans font-medium text-foreground">Emailet</h1>
          <p className="text-body-sm font-body text-neutral-500">
            {sentCount} email{sentCount !== 1 ? "e" : ""} të dërguar
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => openCompose()}
            className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2"
          >
            <Plus size={18} />
            Kompozo Email
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Kërko emaile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex-1 max-w-xs">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">Të gjithë klientët</option>
            {(clients ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* EmailJS status banner */}
      {!isEmailConfigured() && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
          <Warning size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-amber-800">EmailJS nuk është konfiguruar</p>
            <p className="text-caption text-amber-700 font-body mt-0.5">
              Emailet hapen me klientin tuaj lokal (mailto). Për dërgim të drejtpërdrejtë, plotëso <code className="bg-amber-100 px-1 rounded text-xs">.env</code> me kredencialet e EmailJS.
            </p>
            <a
              href="https://emailjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-amber-600 underline hover:text-amber-800 transition-colors mt-1 block"
            >
              Regjistrohu falas te emailjs.com →
            </a>
          </div>
        </div>
      )}
      {isEmailConfigured() && (
        <div className="mb-5 flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <p className="text-caption text-green-700 font-body">EmailJS i konfiguruar — emailet dërgohen drejtpërdrejt.</p>
        </div>
      )}

      {/* Email list */}
      {isPending ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-neutral-100 animate-skeleton-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <EnvelopeSimple size={32} className="text-primary" />
          </div>
          <h2 className="text-h3 font-sans font-medium text-foreground mb-2">Asnjë email</h2>
          <p className="text-body text-neutral-500 font-body mb-6 text-center max-w-sm">
            {search || clientFilter !== "all"
              ? "Nuk u gjet asnjë email me këto filtra."
              : "Dërgoni emailin e parë tek një klient."}
          </p>
          {!search && clientFilter === "all" && (
            <Button
              onClick={() => openCompose()}
              className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2"
            >
              <Plus size={18} />
              Kompozo Email
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((email: any) => {
            const client: any = clientMap[email.toClientId];
            return (
              <Card
                key={email.id}
                className="p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-all duration-200 group cursor-pointer"
                onClick={() => setPreviewEmail(email)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <EnvelopeSimple size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-body-sm font-medium text-foreground truncate">
                          {email.subject}
                        </span>
                        <span className="text-caption px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                          Dërguar
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-caption text-neutral-500 font-body">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {client?.name ?? email.toClientId}
                        </span>
                        <span className="truncate">{email.toEmail}</span>
                      </div>
                      <p className="text-caption text-neutral-400 font-body line-clamp-1 mt-1">
                        {email.body}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-caption text-neutral-400 font-body whitespace-nowrap">
                      {new Date(email.createdAt).toLocaleDateString("sq-AL")}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedTemplate(EMAIL_TEMPLATES[0]);
                          setForm({
                            toClientId: email.toClientId,
                            toEmail: email.toEmail,
                            subject: `Re: ${email.subject}`,
                            body: `\n\n---\nNga emaili i ${new Date(email.createdAt).toLocaleDateString("sq-AL")}:\n${email.body}`,
                          });
                          setComposeOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-primary/10 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                        title="Përgjigju"
                      >
                        <ArrowCounterClockwise size={14} />
                      </button>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleDelete(email.id);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
                        title="Fshi"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compose Modal */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          onClick={() => setComposeOpen(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div
            className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-neutral-900 rounded-t-xl">
              <span className="text-body-sm font-medium text-white flex items-center gap-2">
                <EnvelopeSimple size={16} className="text-white/70" />
                Email i Ri
              </span>
              <button
                onClick={() => setComposeOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-0">
              {/* Tek: */}
              <div className="flex items-center gap-3 border-b border-border py-3">
                <span className="text-caption font-medium text-neutral-500 font-body w-16 shrink-0">Tek:</span>
                <select
                  value={form.toClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="flex-1 h-9 px-2 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">Zgjidh klientin...</option>
                  {(clients ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                  ))}
                </select>
              </div>

              {/* Email: */}
              <div className="flex items-center gap-3 border-b border-border py-3">
                <span className="text-caption font-medium text-neutral-500 font-body w-16 shrink-0">Email:</span>
                <input
                  type="email"
                  value={form.toEmail}
                  onChange={(e) => setForm({ ...form, toEmail: e.target.value })}
                  placeholder="email@klienti.com"
                  className="flex-1 h-9 px-2 rounded-md border border-border bg-white text-body-sm text-foreground font-body focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Template selector */}
              <div className="border-b border-border py-3">
                <p className="text-caption font-medium text-neutral-500 font-body mb-2">Zgjidh template-in:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EMAIL_TEMPLATES.map((tpl) => {
                    const clientObj: any = form.toClientId ? clientMap[form.toClientId] : null;
                    const isActive = selectedTemplate.id === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl, clientObj?.name ?? "")}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-body border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temë: */}
              <div className="flex items-center gap-3 border-b border-border py-3">
                <span className="text-caption font-medium text-neutral-500 font-body w-16 shrink-0">Temë:</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Subjekti i emailit..."
                  className="flex-1 h-9 px-2 border-0 bg-transparent text-body-sm text-foreground font-body focus:outline-none"
                />
              </div>

              {/* Body */}
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Shkruaj mesazhin..."
                rows={9}
                className="w-full pt-3 px-1 border-0 bg-transparent text-body text-foreground font-body focus:outline-none resize-none"
              />
            </div>

            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => setComposeOpen(false)}
                className="text-caption text-neutral-400 hover:text-neutral-600 cursor-pointer font-body transition-colors"
              >
                Anulo
              </button>
              <Button
                onClick={handleSend}
                disabled={mutating}
                className="bg-gradient-primary text-white hover:opacity-90 font-normal flex items-center gap-2"
              >
                <PaperPlaneRight size={16} />
                {mutating ? "Duke dërguar..." : "Dërgo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setPreviewEmail(null)}
        >
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div
            className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-2xl animate-fade-in max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <EnvelopeOpen size={18} className="text-primary" />
                <span className="text-body-sm font-medium text-foreground">{previewEmail.subject}</span>
              </div>
              <button onClick={() => setPreviewEmail(null)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="space-y-1 mb-4 text-caption text-neutral-500 font-body">
                <div>
                  <span className="font-medium">Tek: </span>
                  {(clientMap[previewEmail.toClientId] as any)?.name ?? "—"} &lt;{previewEmail.toEmail}&gt;
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(previewEmail.createdAt).toLocaleString("sq-AL")}
                </div>
              </div>
              <div className="text-body text-foreground font-body whitespace-pre-wrap bg-neutral-50 rounded-lg p-4 border border-border">
                {previewEmail.body}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-transparent text-neutral-600 border-border hover:bg-neutral-50 font-normal flex items-center gap-2"
                onClick={() => {
                  setSelectedTemplate(EMAIL_TEMPLATES[0]);
                  setForm({
                    toClientId: previewEmail.toClientId,
                    toEmail: previewEmail.toEmail,
                    subject: `Re: ${previewEmail.subject}`,
                    body: `\n\n---\nNga emaili i ${new Date(previewEmail.createdAt).toLocaleDateString("sq-AL")}:\n${previewEmail.body}`,
                  });
                  setPreviewEmail(null);
                  setComposeOpen(true);
                }}
              >
                <ArrowCounterClockwise size={14} />
                Përgjigju
              </Button>
              <Button
                onClick={() => setPreviewEmail(null)}
                className="bg-gradient-primary text-white hover:opacity-90 font-normal"
              >
                Mbyll
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
