import { useAppData, todayStr, formatRupees } from "@/lib/store";
import { cn } from "@/lib/utils";
import { User, Check, X, PlusCircle, Scissors, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function HomeTab({ onNewBill }: { onNewBill: () => void }) {
  const { data, update } = useAppData();
  const today = todayStr();
  const attToday = data.attendance[today] || {};

  const todayBills = data.bills.filter((b) => b.date === today);
  const todayExpenses = data.expenses.filter((e) => e.date === today);

  const cash = todayBills.reduce((s, b) => s + b.cashAmount, 0);
  const gpay = todayBills.reduce((s, b) => s + b.gpayAmount, 0);
  const expTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const net = cash + gpay - expTotal;

  const toggleAtt = (wid: string) => {
    update((d) => {
      const day = { ...(d.attendance[today] || {}) };
      day[wid] = !day[wid];
      return { ...d, attendance: { ...d.attendance, [today]: day } };
    });
  };

  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const presentWorkers = data.workers.filter((w) => attToday[w.id]);



  return (
    <div className="space-y-6 px-4 pb-32 pt-6">
      {/* Header */}
      <header className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {data.shopName || "Look @ Me"}
            </h1>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          </div>
        </div>
      </header>

      {/* Attendance */}
      <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Attendance
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.workers.map((w) => {
            const present = !!attToday[w.id];
            return (
              <button
                key={w.id}
                onClick={() => toggleAtt(w.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95",
                  present
                    ? "bg-success/15 text-success border border-success/30 shadow-[0_0_12px_-3px] shadow-success/20"
                    : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/30",
                )}
              >
                {present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-50" />}
                {w.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Worker stats */}
      {presentWorkers.length > 0 && (
        <section className="space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            Working Today
          </h2>
          {presentWorkers.map((w) => {
            const wb = todayBills.filter((b) => b.workerId === w.id);
            const earn = wb.reduce((s, b) => s + b.amount, 0);
            return (
              <div
                key={w.id}
                className="flex items-center gap-4 rounded-2xl glass-panel p-4 card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{w.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {wb.length} {wb.length === 1 ? "customer" : "customers"}
                  </p>
                </div>
                <p className="text-lg font-bold text-primary">{formatRupees(earn)}</p>
              </div>
            );
          })}
        </section>
      )}

      {/* Totals */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Today's Totals
        </h2>
        <div className="rounded-2xl glass-panel p-5 gold-glow">
          <div className="flex items-baseline justify-between border-b border-border/50 pb-3 mb-3">
            <span className="text-sm text-muted-foreground">Total Bills</span>
            <span className="font-display text-2xl font-bold text-primary">{todayBills.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Cash" value={cash} />
            <Stat label="GPay" value={gpay} />
            <Stat label="Expenses" value={expTotal} tone="danger" />
            <Stat label="Net" value={net} tone="primary" />
          </div>
        </div>
      </section>



      {/* Today's Bills List */}
      <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Today's Bills
        </h2>
        {todayBills.length === 0 ? (
          <p className="rounded-2xl glass-panel p-6 text-center text-sm text-muted-foreground">
            No bills saved today
          </p>
        ) : (
          <ul className="space-y-2">
            {todayBills.map((b) => {
              const worker = data.workers.find((w) => w.id === b.workerId);
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl glass-panel p-4 card-hover"
                >
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">{b.billNo}</span>
                      <span className="text-[10px] text-muted-foreground uppercase bg-muted/50 px-2 py-0.5 rounded border border-border/30">
                        {b.mode}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {b.service || b.services?.map((s) => s.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Served by: <span className="font-medium text-foreground/80">{worker?.name || "Unknown"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-primary">{formatRupees(b.amount)}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete bill ${b.billNo}?`)) {
                          update((d) => ({
                            ...d,
                            bills: d.bills.filter((x) => x.id !== b.id),
                          }));
                          toast.success(`Bill ${b.billNo} deleted`);
                        }
                      }}
                      className="rounded-full p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* FAB */}
      <button
        onClick={onNewBill}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-primary/40 animate-pulse-gold"
        style={{ right: "max(1rem, calc(50% - 260px + 1rem))" }}
      >
        <PlusCircle className="h-5 w-5" />
        New Bill
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "danger";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-lg font-bold",
          tone === "primary" && "text-primary",
          tone === "danger" && "text-destructive",
          !tone && "text-foreground",
        )}
      >
        {formatRupees(value)}
      </p>
    </div>
  );
}
