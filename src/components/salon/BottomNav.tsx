import { Home, PlusCircle, Receipt, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "home" | "bill" | "expenses" | "reports" | "settings";

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "bill", label: "New Bill", Icon: PlusCircle },
  { key: "expenses", label: "Expenses", Icon: Receipt },
  { key: "reports", label: "Reports", Icon: BarChart3 },
  { key: "settings", label: "Settings", Icon: Settings },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[520px] glass-panel border-t-0 safe-bottom"
      style={{
        borderTop: "1px solid oklch(0.35 0.015 70 / 0.2)",
      }}
    >
      <div className="grid grid-cols-5">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-1 h-1 w-6 rounded-full bg-gradient-to-r from-primary to-accent" />
              )}
              <Icon
                className={cn("h-5 w-5 transition-all duration-200", isActive && "scale-110 drop-shadow-[0_0_6px_oklch(0.78_0.14_70/0.5)]")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn(isActive && "font-semibold")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
