import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav, type TabKey } from "@/components/salon/BottomNav";
import { HomeTab } from "@/components/salon/HomeTab";
import { NewBillSheet } from "@/components/salon/NewBillSheet";
import { ExpensesTab } from "@/components/salon/ExpensesTab";
import { ReportsTab } from "@/components/salon/ReportsTab";
import { SettingsTab } from "@/components/salon/SettingsTab";
import { SplashScreen } from "@/components/salon/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Look @ Me — Daily Billing" },
      {
        name: "description",
        content: "Daily billing and expense tracker for Look @ Me salon.",
      },
      { property: "og:title", content: "Look @ Me" },
      {
        property: "og:description",
        content: "Daily billing and expense tracker for Look @ Me salon.",
      },
    ],
  }),
  component: Index,
});

import { useAppData } from "@/lib/store";
import { useEffect } from "react";

function Index() {
  const [tab, setTab] = useState<TabKey>("home");
  const [billOpen, setBillOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const { data } = useAppData();

  useEffect(() => {
    document.title = `${data.shopName || "Look @ Me"} — Daily Billing`;
  }, [data.shopName]);

  const handleStart = () => {
    setIsSlidingOut(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 500); // match duration-500
  };

  const openBill = () => setBillOpen(true);

  return (
    <div className="min-h-screen bg-background">
      {showSplash && (
        <div className={`transition-all duration-500 ${
          isSlidingOut ? "opacity-0 pointer-events-none scale-102 blur-[2px]" : "opacity-100"
        }`}>
          <SplashScreen onStart={handleStart} />
        </div>
      )}

      {tab === "home" && <HomeTab onNewBill={openBill} />}
      {tab === "bill" && <HomeTab onNewBill={openBill} />}
      {tab === "expenses" && <ExpensesTab onBack={() => setTab("home")} />}
      {tab === "reports" && <ReportsTab onBack={() => setTab("home")} />}
      {tab === "settings" && <SettingsTab onBack={() => setTab("home")} />}

      <BottomNav
        active={tab}
        onChange={(k) => {
          if (k === "bill") {
            openBill();
          } else {
            setTab(k);
          }
        }}
      />

      <NewBillSheet open={billOpen} onOpenChange={setBillOpen} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
