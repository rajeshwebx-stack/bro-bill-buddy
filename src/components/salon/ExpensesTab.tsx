import { useState } from "react";
import { useAppData, todayStr, formatRupees } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Receipt, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ExpensesTab({ onBack }: { onBack?: () => void }) {
  const { data, update } = useAppData();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const today = todayStr();

  const add = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    update((d) => ({
      ...d,
      expenses: [
        ...d.expenses,
        {
          id: crypto.randomUUID(),
          amount: amt,
          note: note.trim(),
          date: today,
          createdAt: Date.now(),
        },
      ],
    }));
    setAmount("");
    setNote("");
    toast.success(`Expense ${formatRupees(amt)} added`);
  };

  const remove = (id: string) => {
    update((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  };

  const todayExp = data.expenses.filter((e) => e.date === today).sort((a, b) => b.createdAt - a.createdAt);
  const total = todayExp.reduce((s, e) => s + e.amount, 0);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
            <Receipt className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground">Today · {formatRupees(total)}</p>
          </div>
        </div>
      </header>

      <div className="space-y-3 rounded-2xl glass-panel p-4 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            Amount
          </span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 h-14 rounded-xl border-border bg-muted/50 text-2xl font-bold text-foreground"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            Note
          </span>
          <Input
            placeholder="e.g. Shampoo, tea, rent"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 h-12 rounded-xl border-border bg-muted/50 text-foreground"
          />
        </label>
        <button
          onClick={add}
          disabled={!amount || Number(amount) <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 font-semibold text-primary-foreground transition-all duration-200 active:scale-[0.98] disabled:from-muted disabled:to-muted disabled:text-muted-foreground"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          Today's Expenses
        </h2>
        {todayExp.length === 0 ? (
          <p className="rounded-2xl glass-panel p-6 text-center text-sm text-muted-foreground">
            No expenses yet
          </p>
        ) : (
          <ul className="space-y-2">
            {todayExp.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl glass-panel p-4 card-hover"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{formatRupees(e.amount)}</p>
                  {e.note && <p className="text-sm text-muted-foreground">{e.note}</p>}
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="rounded-full p-2 text-destructive/70 hover:text-destructive transition-colors active:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
