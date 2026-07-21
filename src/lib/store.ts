import { useEffect, useState, useCallback } from "react";

export type PaymentMode = "cash" | "gpay" | "split";

export type BillService = {
  name: string;
  price: number;
};

export type Bill = {
  id: string;
  billNo: string;
  workerId: string;
  services: BillService[]; // multiple services per bill
  service: string;         // kept for backward compat (joined names)
  amount: number;
  mode: PaymentMode;
  cashAmount: number;
  gpayAmount: number;
  date: string; // yyyy-mm-dd
  createdAt: number;
};

export type Expense = {
  id: string;
  amount: number;
  note: string;
  date: string;
  createdAt: number;
};

export type Worker = {
  id: string;
  name: string;
};

export type Service = {
  name: string;
  price: number;
};

export type Attendance = Record<string, Record<string, boolean>>; // date -> workerId -> present

export type AppData = {
  shopName: string;
  workers: Worker[];
  services: Service[];
  bills: Bill[];
  expenses: Expense[];
  attendance: Attendance;
};

const KEY = "lookatme-salon-v1";

const DEFAULTS: AppData = {
  shopName: "Look @ Me",
  workers: [
    { id: "w1", name: "DHARMA" },
    { id: "w2", name: "GUNA" },
    { id: "w3", name: "MUKILAN" },
  ],
  services: [
    { name: "Haircut", price: 120 },
    { name: "Shave", price: 80 },
    { name: "Trim", price: 80 },
    { name: "Haircut + Trim", price: 180 }, // combo service
    { name: "Children Haircut", price: 100 },
    { name: "Hair Dye", price: 200 },
    { name: "Oil Massage", price: 150 },
    { name: "Detan", price: 500 },
    { name: "Bleach", price: 500 },
    { name: "Face Cleanup", price: 300 },
    { name: "Facial (Basic)", price: 700 },
    { name: "Facial (Classic)", price: 1200 },
    { name: "Facial (Premium)", price: 2000 },
    { name: "Hair Wash", price: 50 },
  ],
  bills: [],
  expenses: [],
  attendance: {},
};

// Migrate from old storage keys so no bills are lost
const OLD_KEYS = ["salon-app-v1", "salon-app-v2"];

function migrateOldData(): string | null {
  for (const oldKey of OLD_KEYS) {
    const raw = localStorage.getItem(oldKey);
    if (raw) {
      // Move data to new key and remove old key
      localStorage.setItem(KEY, raw);
      localStorage.removeItem(oldKey);
      return raw;
    }
  }
  return null;
}

function load(): AppData {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    let raw = localStorage.getItem(KEY);
    // If nothing under new key, try migrating from old keys
    if (!raw) raw = migrateOldData();
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    
    // Auto-inject missing combo service if needed
    if (parsed.services) {
      const hasCombo = parsed.services.some((s) => s.name === "Haircut + Trim");
      if (!hasCombo) {
        parsed.services = [...parsed.services, { name: "Haircut + Trim", price: 180 }];
      }
    }

    // Migrate old bills (single service string) to new multi-service format
    if (parsed.bills) {
      parsed.bills = parsed.bills.map((b: Bill) => ({
        ...b,
        services: b.services ?? [{ name: b.service ?? "", price: b.amount }],
      }));
    }
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function save(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// Simple pub-sub so all components stay in sync
const listeners = new Set<() => void>();
let cache: AppData | null = null;

function get(): AppData {
  if (!cache) cache = load();
  return cache;
}

function set(updater: (d: AppData) => AppData) {
  cache = updater(get());
  save(cache);
  listeners.forEach((l) => l());
}

export function useAppData() {
  const [, tick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    cache = load();
    setHydrated(true);
    const l = () => tick((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    data: hydrated ? get() : DEFAULTS,
    hydrated,
    update: useCallback((updater: (d: AppData) => AppData) => set(updater), []),
    replace: useCallback((d: AppData) => set(() => d), []),
  };
}

export function todayStr(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nextBillNo(bills: Bill[], date: string) {
  const todayBills = bills.filter((b) => b.date === date);
  const n = todayBills.length + 1;
  return `LAM-${String(n).padStart(3, "0")}`;
}

export function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
