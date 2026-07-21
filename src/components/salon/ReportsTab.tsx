import { useState, useMemo } from "react";
import { useAppData, formatRupees, todayStr } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BarChart3, ArrowLeft } from "lucide-react";

type Period = "week" | "month";

export function ReportsTab({ onBack }: { onBack?: () => void }) {
  const { data } = useAppData();
  const [period, setPeriod] = useState<Period>("week");

  const { days, revenue, cash, gpay, expenses, net, perWorker } = useMemo(() => {
    const today = new Date();
    const n = period === "week" ? 7 : 30;
    const days: { date: string; label: string; total: number }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        date: todayStr(d),
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        total: 0,
      });
    }
    const range = new Set(days.map((d) => d.date));
    const bills = data.bills.filter((b) => range.has(b.date));
    const exps = data.expenses.filter((e) => range.has(e.date));
    for (const b of bills) {
      const d = days.find((x) => x.date === b.date);
      if (d) d.total += b.amount;
    }
    const cash = bills.reduce((s, b) => s + b.cashAmount, 0);
    const gpay = bills.reduce((s, b) => s + b.gpayAmount, 0);
    const revenue = cash + gpay;
    const expenses = exps.reduce((s, e) => s + e.amount, 0);
    const net = revenue - expenses;
    const perWorker = data.workers.map((w) => {
      const wb = bills.filter((b) => b.workerId === w.id);
      return {
        name: w.name,
        count: wb.length,
        total: wb.reduce((s, b) => s + b.amount, 0),
      };
    });
    return { days, revenue, cash, gpay, expenses, net, perWorker };
  }, [data, period]);

  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="space-y-6 px-4 pb-32 pt-6">
      <header className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:scale-95 mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Reports</h1>
        </div>
        <div className="flex rounded-full bg-muted/50 p-1 border border-border">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold uppercase transition-all duration-200",
                period === p
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <StatCard label="Revenue" value={revenue} tone="primary" />
        <StatCard label="Expenses" value={expenses} tone="danger" />
        <StatCard label="Cash" value={cash} />
        <StatCard label="GPay" value={gpay} />
      </div>

      <div className="rounded-2xl glass-panel p-5 gold-glow animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Net Profit</span>
          <span className="font-display text-2xl font-bold text-primary">{formatRupees(net)}</span>
        </div>
      </div>

      {/* Chart */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Daily Revenue
        </h2>
        <div className="rounded-2xl glass-panel p-4">
          <div className="flex h-40 items-end gap-1">
            {days.map((d) => (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all duration-300"
                    style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1 text-[9px] text-muted-foreground">
            {days.map((d, i) => (
              <div key={d.date} className="flex-1 truncate text-center">
                {period === "week" || i % 5 === 0 ? d.label : ""}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per worker */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          By Worker
        </h2>
        <div className="space-y-2">
          {perWorker.map((w) => (
            <div
              key={w.name}
              className="flex items-center justify-between rounded-2xl glass-panel p-4 card-hover"
            >
              <div>
                <p className="font-semibold text-foreground">{w.name}</p>
                <p className="text-sm text-muted-foreground">{w.count} customers</p>
              </div>
              <p className="text-lg font-bold text-primary">{formatRupees(w.total)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "danger";
}) {
  return (
    <div className="rounded-2xl glass-panel p-4 card-hover">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold",
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
