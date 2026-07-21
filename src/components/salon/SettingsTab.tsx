import { useRef, useState } from "react";
import { useAppData } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  Download,
  Upload,
  Sparkles,
  Pencil,
  Check,
  Settings as SettingsIcon,
  ArrowLeft,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsTab({ onBack }: { onBack?: () => void }) {
  const { data, update, replace } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingWorker, setEditingWorker] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // New states for adding workers and services
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.shopName || "salon").toLowerCase().replace(/[^a-z0-9]/g, "-")}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (!parsed.workers || !parsed.bills) throw new Error("Invalid file");
        replace(parsed);
        toast.success("Backup restored successfully");
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const updateShopName = (shopName: string) => {
    update((d) => ({ ...d, shopName }));
  };

  const addWorker = () => {
    const name = newWorkerName.trim();
    if (!name) return;
    update((d) => ({
      ...d,
      workers: [...d.workers, { id: "w_" + Date.now(), name }],
    }));
    setNewWorkerName("");
    toast.success(`Worker "${name}" added`);
  };

  const deleteWorker = (id: string) => {
    const worker = data.workers.find((w) => w.id === id);
    if (!worker) return;
    if (confirm(`Are you sure you want to delete worker "${worker.name}"?`)) {
      update((d) => ({
        ...d,
        workers: d.workers.filter((w) => w.id !== id),
      }));
      toast.success(`Worker "${worker.name}" deleted`);
    }
  };

  const saveWorker = (id: string) => {
    if (!editName.trim()) return;
    update((d) => ({
      ...d,
      workers: d.workers.map((w) => (w.id === id ? { ...w, name: editName.trim() } : w)),
    }));
    setEditingWorker(null);
  };

  const addService = () => {
    const name = newServiceName.trim();
    const price = Number(newServicePrice);
    if (!name || isNaN(price) || price < 0) {
      toast.error("Please enter a valid service name and price");
      return;
    }
    if (data.services.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`Service "${name}" already exists`);
      return;
    }
    update((d) => ({
      ...d,
      services: [...d.services, { name, price }],
    }));
    setNewServiceName("");
    setNewServicePrice("");
    toast.success(`Service "${name}" added`);
  };

  const deleteService = (name: string) => {
    if (confirm(`Are you sure you want to delete service "${name}"?`)) {
      update((d) => ({
        ...d,
        services: d.services.filter((s) => s.name !== name),
      }));
      toast.success(`Service "${name}" deleted`);
    }
  };

  const updateServicePrice = (name: string, price: number) => {
    update((d) => ({
      ...d,
      services: d.services.map((s) => (s.name === name ? { ...s, price } : s)),
    }));
  };

  return (
    <div className="space-y-6 px-4 pb-32 pt-6">
      <header className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:scale-95 mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        </div>
      </header>

      {/* Salon Profile (SaaS feature) */}
      <section className="animate-fade-up" style={{ animationDelay: "0.02s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Salon Profile
        </h2>
        <div className="rounded-2xl glass-panel p-4 space-y-2.5">
          <label className="text-xs font-medium text-muted-foreground">Salon / Shop Name</label>
          <Input
            value={data.shopName || ""}
            onChange={(e) => updateShopName(e.target.value)}
            placeholder="e.g. Look @ Me"
            className="h-11 bg-muted/30 border-border text-foreground font-semibold"
          />
        </div>
      </section>

      {/* Workers */}
      <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Workers
        </h2>
        <ul className="space-y-2 mb-3">
          {data.workers.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-2xl glass-panel p-4 card-hover"
            >
              {editingWorker === w.id ? (
                <>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 bg-muted/50 text-foreground"
                  />
                  <button
                    onClick={() => saveWorker(w.id)}
                    className="rounded-full bg-gradient-to-r from-primary to-accent p-2 text-primary-foreground"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-semibold text-foreground">{w.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingWorker(w.id);
                        setEditName(w.name);
                      }}
                      className="rounded-full p-2 text-muted-foreground hover:text-primary transition-colors active:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteWorker(w.id)}
                      className="rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors active:bg-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {/* Add Worker Inline */}
        <div className="flex gap-2 rounded-2xl border border-dashed border-border/60 p-3">
          <Input
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
            placeholder="Add new worker name..."
            className="h-10 flex-1 bg-muted/20 border-border text-foreground text-sm"
          />
          <button
            onClick={addWorker}
            className="flex h-10 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground active:scale-95 transition-all duration-150"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Services & Prices
        </h2>
        <ul className="space-y-2 mb-3">
          {data.services.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 rounded-2xl glass-panel p-3 card-hover"
            >
              <span className="flex-1 font-medium text-foreground text-sm pl-1">{s.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-primary text-sm font-bold">₹</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={s.price}
                    onChange={(e) => updateServicePrice(s.name, Number(e.target.value) || 0)}
                    className="h-9 w-20 text-right font-bold bg-muted/50 border-border text-foreground"
                  />
                </div>
                <button
                  onClick={() => deleteService(s.name)}
                  className="rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors active:bg-muted"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {/* Add Service Inline */}
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border/60 p-3">
          <p className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">Add New Service</p>
          <div className="flex gap-2">
            <Input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Service name..."
              className="h-10 flex-1 bg-muted/20 border-border text-foreground text-sm"
            />
            <div className="flex items-center gap-1 w-24">
              <span className="text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                inputMode="numeric"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="Price"
                className="h-10 w-full text-right bg-muted/20 border-border text-foreground text-sm"
              />
            </div>
            <button
              onClick={addService}
              className="flex h-10 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground active:scale-95 transition-all duration-150"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </section>

      {/* Backup */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Backup
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 rounded-2xl glass-panel p-4 font-medium text-foreground transition-all duration-200 active:scale-95 hover:border-primary/30"
          >
            <Download className="h-4 w-4 text-primary" /> Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl glass-panel p-4 font-medium text-foreground transition-all duration-200 active:scale-95 hover:border-primary/30"
          >
            <Upload className="h-4 w-4 text-primary" /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="animate-fade-up" style={{ animationDelay: "0.22s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-destructive/70">
          Danger Zone
        </h2>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Delete all saved bills, expenses, and attendance records to start fresh. This cannot be undone.
          </p>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete all bills and start fresh?")) {
                update((d) => ({
                  ...d,
                  bills: [],
                  expenses: [],
                  attendance: {},
                }));
                toast.success("Database cleared successfully");
              }
            }}
            className="w-full rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/20 py-2.5 text-sm font-semibold text-destructive transition-colors duration-200"
          >
            Clear All Bills & Expenses
          </button>
        </div>
      </section>

      {/* AI stub */}
      <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          AI Assistant
        </h2>
        <div className="rounded-2xl border border-dashed border-primary/20 glass-panel p-5 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 font-semibold text-foreground">AI Chatbot</p>
          <p className="text-sm text-muted-foreground">
            Ask questions about your business. Coming soon.
          </p>
        </div>
      </section>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        {data.shopName || "Look @ Me"} · Data stored on this device
      </p>
    </div>
  );
}
