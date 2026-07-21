import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useAppData,
  todayStr,
  nextBillNo,
  formatRupees,
  type PaymentMode,
  type BillService,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { User, Check, Plus, Minus, Trash2, Sparkles, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function NewBillSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data, update } = useAppData();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [cart, setCart] = useState<BillService[]>([]); // multiple services
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [mode, setMode] = useState<PaymentMode>("cash");
  const [cashAmt, setCashAmt] = useState("");
  const [gpayAmt, setGpayAmt] = useState("");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setWorkerId(null);
        setCart([]);
        setCustomName("");
        setCustomPrice("");
        setMode("cash");
        setCashAmt("");
        setGpayAmt("");
      }, 300);
    }
  }, [open]);

  const today = todayStr();
  const billNo = nextBillNo(data.bills, today);
  const total = cart.reduce((s, s2) => s + s2.price, 0);

  // Add a preset service to cart
  const addService = (name: string, price: number) => {
    setCart((prev) => [...prev, { name, price }]);
  };

  // Remove one item from cart by index
  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add custom service
  const addCustom = () => {
    const p = Number(customPrice);
    if (!p || p <= 0) return;
    const name = customName.trim() || "Custom";
    setCart((prev) => [...prev, { name, price: p }]);
    setCustomName("");
    setCustomPrice("");
  };

  const canSave =
    !!workerId &&
    cart.length > 0 &&
    total > 0 &&
    (mode !== "split" ||
      (Number(cashAmt || 0) + Number(gpayAmt || 0) === total &&
        Number(cashAmt || 0) >= 0 &&
        Number(gpayAmt || 0) >= 0));

  const save = () => {
    if (!canSave || !workerId) return;
    const cash =
      mode === "cash" ? total : mode === "gpay" ? 0 : Number(cashAmt || 0);
    const gpay =
      mode === "gpay" ? total : mode === "cash" ? 0 : Number(gpayAmt || 0);
    const serviceNames = cart.map((s) => s.name).join(", ");
    update((d) => ({
      ...d,
      bills: [
        ...d.bills,
        {
          id: crypto.randomUUID(),
          billNo,
          workerId,
          services: cart,
          service: serviceNames, // backward compat
          amount: total,
          mode,
          cashAmount: cash,
          gpayAmount: gpay,
          date: today,
          createdAt: Date.now(),
        },
      ],
    }));
    toast.success(`${billNo} saved · ${formatRupees(total)} · ${cart.length} service${cart.length > 1 ? "s" : ""}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[94vh] overflow-y-auto rounded-t-3xl border-0 p-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.2 0.01 260) 0%, oklch(0.15 0.008 260) 100%)",
        }}
      >
        <SheetHeader className="px-5 pb-2 pt-5 sticky top-0 z-10"
          style={{ background: "oklch(0.2 0.01 260)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:scale-95 mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <SheetTitle className="font-display text-xl text-foreground flex-1 text-left">New Bill</SheetTitle>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mr-4">
              {billNo}
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-5 px-5 pb-8">
          {/* ── STEP 1: Worker ── */}
          <Section title="1. Who served?">
            <div className="grid grid-cols-3 gap-2">
              {data.workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWorkerId(w.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 transition-all duration-200 active:scale-95",
                    workerId === w.id
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_16px_-4px_oklch(0.78_0.14_70/0.4)]"
                      : "border-border bg-card/40 hover:border-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all text-sm font-bold",
                      workerId === w.id
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {w.name[0]}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide",
                      workerId === w.id ? "text-primary" : "text-foreground",
                    )}
                  >
                    {w.name}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* ── STEP 2: Services (multi-select cart) ── */}
          <Section title="2. Services (tap to add)">
            <div className="grid grid-cols-2 gap-2">
              {data.services.map((s) => {
                const count = cart.filter((c) => c.name === s.name).length;
                return (
                  <button
                    key={s.name}
                    onClick={() => addService(s.name, s.price)}
                    className={cn(
                      "relative flex items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-150 active:scale-95",
                      count > 0
                        ? "border-primary/50 bg-primary/8"
                        : "border-border bg-card/40 hover:border-primary/30",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{s.name}</p>
                      <p className="text-xs font-bold text-primary">{formatRupees(s.price)}</p>
                    </div>
                    {count > 0 ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {count}
                      </span>
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom service */}
            <div className="mt-2 flex gap-2 rounded-2xl border border-border bg-card/40 p-3">
              <Input
                placeholder="Service name (opt.)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9 flex-1 border-0 bg-muted/50 text-sm text-foreground focus-visible:ring-0"
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="₹ Price"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="h-9 w-24 border-0 bg-muted/50 text-sm font-semibold text-foreground focus-visible:ring-0"
              />
              <button
                onClick={addCustom}
                disabled={!customPrice || Number(customPrice) <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </Section>

          {/* ── CART: Selected services ── */}
          {cart.length > 0 && (
            <Section title={`Cart · ${cart.length} item${cart.length > 1 ? "s" : ""}`}>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{formatRupees(item.price)}</span>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-destructive/70 hover:bg-destructive/10 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-primary/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">Total</span>
                  <span className="font-display text-xl font-bold text-primary">{formatRupees(total)}</span>
                </div>
              </div>
            </Section>
          )}

          {/* ── STEP 3: Payment ── */}
          <Section title="3. Payment">
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "gpay", "split"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl py-3 text-sm font-semibold uppercase tracking-wide transition-all duration-200 active:scale-95",
                    mode === m
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {mode === "split" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="rounded-xl bg-muted/50 p-3 border border-border">
                  <span className="text-xs text-muted-foreground">Cash ₹</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={cashAmt}
                    onChange={(e) => setCashAmt(e.target.value)}
                    className="h-9 border-0 bg-transparent p-0 text-lg font-bold text-foreground focus-visible:ring-0"
                  />
                </label>
                <label className="rounded-xl bg-muted/50 p-3 border border-border">
                  <span className="text-xs text-muted-foreground">GPay ₹</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={gpayAmt}
                    onChange={(e) => setGpayAmt(e.target.value)}
                    className="h-9 border-0 bg-transparent p-0 text-lg font-bold text-foreground focus-visible:ring-0"
                  />
                </label>
                {total > 0 && (
                  <p
                    className={cn(
                      "col-span-2 text-xs",
                      Number(cashAmt || 0) + Number(gpayAmt || 0) === total
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    Sum must equal {formatRupees(total)} · currently{" "}
                    {formatRupees(Number(cashAmt || 0) + Number(gpayAmt || 0))}
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* ── Save Button ── */}
          <button
            disabled={!canSave}
            onClick={save}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold transition-all duration-200 active:scale-[0.98]",
              canSave
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Sparkles className="h-5 w-5" />
            {cart.length > 0
              ? `Save Bill · ${formatRupees(total)}`
              : "Select services to save"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary/70">
        {title}
      </h3>
      {children}
    </div>
  );
}
