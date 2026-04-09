import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Currency } from "../context/AppContext";
import {
  Buildings,
  Users,
  Plugs,
  Globe,
  Plus,
  Trash,
  Check,
  LockKey,
  ShieldCheck,
  Eye,
  EyeSlash,
  Warning,
  CurrencyEur,
  X,
  UserCirclePlus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";

const COLOR_OPTIONS = [
  { value: "violet", label: "Violet", bg: "bg-violet-600" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-600" },
  { value: "blue", label: "Blue", bg: "bg-blue-600" },
  { value: "rose", label: "Rose", bg: "bg-rose-600" },
  { value: "amber", label: "Amber", bg: "bg-amber-500" },
  { value: "cyan", label: "Cyan", bg: "bg-cyan-600" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function colorToBg(color?: string) {
  const map: Record<string, string> = {
    violet: "bg-violet-600",
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    rose: "bg-rose-600",
    amber: "bg-amber-500",
    cyan: "bg-cyan-600",
  };
  return map[color ?? ""] ?? "bg-neutral-400";
}

const integrations = [
  {
    id: "1",
    name: "Slack",
    description: "Get notifications in Slack channels",
    connected: true,
  },
  {
    id: "2",
    name: "Google Calendar",
    description: "Sync interviews to your calendar",
    connected: true,
  },
  {
    id: "3",
    name: "LinkedIn",
    description: "Import candidates from LinkedIn",
    connected: false,
  },
  {
    id: "4",
    name: "Greenhouse",
    description: "Sync with Greenhouse ATS",
    connected: false,
  },
];

export default function Settings() {
  const { addToast, currency, setCurrency } = useApp();

  // Staff from DB
  const { data: staffList, isPending: staffPending, error: staffError } = useQuery("StaffMember");
  const { create: createStaff, remove: removeStaff } = useMutation("StaffMember");

  console.log("__ANIMA_DBG__ staffPending=", staffPending, "staffList=", staffList, "staffError=", staffError);

  // Add staff modal
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newColor, setNewColor] = useState("violet");
  const [staffSaving, setStaffSaving] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setStaffSaving(true);
    try {
      await createStaff({ name: newName.trim(), email: newEmail.trim(), color: newColor, isActive: true });
      addToast(`${newName} u shtua në ekip!`, "success");
      setNewName(""); setNewEmail(""); setNewColor("violet");
      setShowAddStaff(false);
    } catch {
      addToast("Gabim gjatë shtimit.", "error");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleRemoveStaff = async (id: string, name: string) => {
    try {
      await removeStaff(id);
      addToast(`${name} u hoq nga ekipi.`, "info");
    } catch {
      addToast("Gabim gjatë heqjes.", "error");
    }
  };

  const [companyName, setCompanyName] = useState("Acme Corp");
  const [companyWebsite, setCompanyWebsite] = useState("https://acme.com");
  const [companyEmail, setCompanyEmail] = useState("hr@acme.com");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [autoReject, setAutoReject] = useState(false);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    const stored = localStorage.getItem("crmAdminPassword") || "admin123";
    if (currentPw !== stored) {
      setPwError("Fjalëkalimi aktual është i gabuar.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Fjalëkalimet e reja nuk përputhen.");
      return;
    }
    localStorage.setItem("crmAdminPassword", newPw);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwSuccess(true);
    addToast("Fjalëkalimi u ndryshua me sukses!", "success");
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-h2 font-sans font-medium text-foreground mb-1">
          Settings
        </h1>
        <p className="text-body-sm font-body text-neutral-500">
          Manage your company, team, and integrations
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="flex gap-1 bg-neutral-100 p-1 rounded-lg mb-6 w-full sm:w-auto overflow-x-auto">
          {[
            {
              value: "company",
              label: "Company",
              icon: <Buildings size={16} weight="regular" />,
            },
            {
              value: "team",
              label: "Team",
              icon: <Users size={16} weight="regular" />,
            },
            {
              value: "integrations",
              label: "Integrations",
              icon: <Plugs size={16} weight="regular" />,
            },
            {
              value: "jobboard",
              label: "Job Board",
              icon: <Globe size={16} weight="regular" />,
            },
            {
              value: "account",
              label: "Llogaria",
              icon: <LockKey size={16} weight="regular" />,
            },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-body rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:font-medium text-neutral-600 transition-all whitespace-nowrap"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company">
          <Card className="p-6 bg-white border border-border rounded-lg space-y-5">
            <div>
              <h2 className="text-h4 font-sans font-medium text-foreground mb-4">
                Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                    HR Email
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-body text-foreground font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

              <div className="border-t border-border pt-5">
              <h3 className="text-body font-medium text-foreground mb-3 font-sans flex items-center gap-2">
                <CurrencyEur size={16} className="text-primary" />
                Monedha
              </h3>
              <div className="flex gap-2 mb-5">
                {(["EUR", "ALL"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c); addToast(`Monedha u ndryshua në ${c}`, "success"); }}
                    className={`flex-1 py-2.5 rounded-lg text-body-sm font-body border-2 transition-all cursor-pointer font-medium ${currency === c ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-border hover:border-primary hover:text-primary"}`}
                  >
                    {c === "EUR" ? "🇪🇺 Euro (€)" : "🇦🇱 Lekë (L)"}
                  </button>
                ))}
              </div>
              </div>
              <div className="border-t border-border pt-5">
              <h3 className="text-body font-medium text-foreground mb-4 font-sans">
                Notifications
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Email notifications for new applications",
                    value: emailNotifs,
                    onChange: setEmailNotifs,
                  },
                  {
                    label: "Slack notifications for stage changes",
                    value: slackNotifs,
                    onChange: setSlackNotifs,
                  },
                  {
                    label: "Auto-reject unqualified applicants",
                    value: autoReject,
                    onChange: setAutoReject,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-body-sm font-body text-neutral-700">
                      {item.label}
                    </span>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => addToast("Company settings saved!", "success")}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2"
              >
                <Check size={16} weight="regular" />
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team">
          <Card className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-h4 font-sans font-medium text-foreground">
                Ekipi
              </h2>
              <Button
                onClick={() => setShowAddStaff(true)}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2 text-body-sm"
              >
                <Plus size={16} weight="regular" />
                Shto Anëtar
              </Button>
            </div>

            {/* Add Staff Modal */}
            {showAddStaff && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
                  <button
                    onClick={() => setShowAddStaff(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                      <UserCirclePlus size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-sans font-medium text-foreground">Shto Anëtar</h3>
                      <p className="text-caption text-neutral-500 font-body">Anëtar i ri i ekipit</p>
                    </div>
                  </div>
                  <form onSubmit={handleAddStaff} className="space-y-4">
                    <div>
                      <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Emri i plotë *</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        placeholder="p.sh. Erjoni Besimi"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-neutral-50 text-body-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-foreground mb-1 font-body">Email</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="p.sh. erjoni@firma.al"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-neutral-50 text-body-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-foreground mb-2 font-body">Ngjyra</label>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setNewColor(c.value)}
                            className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-all ${newColor === c.value ? "ring-2 ring-offset-2 ring-neutral-400 scale-110" : "opacity-70 hover:opacity-100"}`}
                            title={c.label}
                          >
                            {newColor === c.value && <Check size={14} weight="bold" className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)} className="flex-1 border-border text-neutral-600 hover:bg-neutral-50 font-normal">
                        Anulo
                      </Button>
                      <Button type="submit" disabled={staffSaving || !newName.trim()} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal">
                        {staffSaving ? "Duke shtuar..." : "Shto"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="divide-y divide-border">
              {staffPending ? (
                <div className="px-6 py-8 text-center text-neutral-400 text-body-sm font-body">Duke ngarkuar...</div>
              ) : staffError ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-body-sm text-red-500 font-body">Gabim: {staffError.message}</p>
                </div>
              ) : !staffList || staffList.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Users size={32} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-body-sm text-neutral-500 font-body">Nuk ka anëtarë akoma.</p>
                  <p className="text-caption text-neutral-400 font-body mt-1">Kliko "Shto Anëtar" dhe shto anëtarin e parë — të dhënat ruhen per-user.</p>
                </div>
              ) : (
                staffList.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorToBg(member.color)}`}>
                      <span className="text-body-sm font-medium text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-caption text-neutral-500 font-body">{member.email || "—"}</p>
                    </div>
                    <span className={`text-caption px-2.5 py-0.5 rounded-full font-body border ${member.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
                      {member.isActive ? "Aktiv" : "Joaktiv"}
                    </span>
                    <button
                      onClick={() => handleRemoveStaff(member.id, member.name)}
                      className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-error transition-colors cursor-pointer"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash size={16} weight="regular" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-border">
              <img
                src="https://c.animaapp.com/mmxvhhd9r1vVgQ/img/ai_4.png"
                alt="team settings illustration"
                className="w-full h-32 object-cover rounded-lg opacity-80"
                loading="lazy"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-3">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className="p-5 bg-white border border-border rounded-lg flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                  <Plugs
                    size={20}
                    weight="regular"
                    className="text-neutral-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-foreground">
                    {integration.name}
                  </p>
                  <p className="text-caption text-neutral-500 font-body">
                    {integration.description}
                  </p>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() =>
                    addToast(
                      `${integration.connected ? "Disconnected from" : "Connected to"} ${integration.name}`,
                      integration.connected ? "info" : "success",
                    )
                  }
                  className={
                    integration.connected
                      ? "bg-transparent text-neutral-600 border-border hover:bg-neutral-50 hover:text-foreground font-normal text-body-sm"
                      : "bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal text-body-sm"
                  }
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Account / Password */}
        <TabsContent value="account">
          <Card className="p-6 bg-white border border-border rounded-lg space-y-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <h2 className="text-h4 font-sans font-medium text-foreground">Ndrysho Fjalëkalimin</h2>
                <p className="text-caption text-neutral-500 font-body">Përdoruesi: <strong>admin</strong></p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              {/* Current password */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1.5 font-body">
                  Fjalëkalimi aktual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <LockKey size={16} weight="regular" />
                  </span>
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    placeholder="Fjalëkalimi aktual"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-neutral-50 text-body-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  >
                    {showCurrentPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1.5 font-body">
                  Fjalëkalimi i ri
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <LockKey size={16} weight="regular" />
                  </span>
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    placeholder="Minimum 6 karaktere"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-neutral-50 text-body-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  >
                    {showNewPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1.5 font-body">
                  Konfirmo fjalëkalimin e ri
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  placeholder="Përsërit fjalëkalimin e ri"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-neutral-50 text-body-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>

              {/* Error */}
              {pwError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-error text-body-sm font-body">
                  <Warning size={15} weight="fill" className="shrink-0" />
                  {pwError}
                </div>
              )}

              {/* Success */}
              {pwSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-success text-body-sm font-body">
                  <Check size={15} weight="fill" className="shrink-0" />
                  Fjalëkalimi u ndryshua me sukses!
                </div>
              )}

              <div className="pt-1">
                <Button
                  type="submit"
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2"
                >
                  <ShieldCheck size={16} weight="regular" />
                  Ndrysho Fjalëkalimin
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Job Board */}
        <TabsContent value="jobboard">
          <Card className="p-6 bg-white border border-border rounded-lg space-y-5">
            <h2 className="text-h4 font-sans font-medium text-foreground">
              Job Board Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-1 font-body">
                  Public Job Board URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="https://jobs.acme.com"
                    readOnly
                    className="flex-1 h-11 px-3 rounded-md border border-border bg-neutral-50 text-body text-neutral-600 font-body font-mono focus:outline-none"
                  />
                  <Button
                    onClick={() =>
                      addToast("URL copied to clipboard!", "success")
                    }
                    variant="outline"
                    className="bg-transparent text-neutral-600 border-border hover:bg-neutral-50 hover:text-foreground font-normal"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Show company logo on job board",
                  "Allow candidates to apply without account",
                  "Enable application tracking for candidates",
                  "Show salary ranges publicly",
                ].map((setting, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-body-sm font-body text-neutral-700">
                      {setting}
                    </span>
                    <Switch
                      defaultChecked={i < 2}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => addToast("Job board settings saved!", "success")}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-normal flex items-center gap-2"
              >
                <Check size={16} weight="regular" />
                Save Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
