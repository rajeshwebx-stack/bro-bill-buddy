import { useAppData } from "@/lib/store";
import { Scissors, Sparkles, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export function SplashScreen({ onStart }: { onStart: () => void }) {
  const { data } = useAppData();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animation shortly after mount
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-background">
      {/* Background Image with Parallax & Ken Burns Effect */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out scale-105"
        style={{
          backgroundImage: "url('/salon_splash_bg.png')",
          transform: animate ? "scale(1.15) translate(1%, 1%)" : "scale(1.05)",
        }}
      />

      {/* Luxury Gradient Dark Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-background/95" />
      <div className="absolute inset-0 z-10 backdrop-blur-[2px]" />

      {/* Top Header Section */}
      <div className={`relative z-20 px-6 pt-16 text-center transition-all duration-1000 ease-out ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-2">
          {dateLabel}
        </p>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-glow backdrop-blur-md mb-4">
          <Scissors className="h-7 w-7 text-primary animate-pulse" />
        </div>
      </div>

      {/* Middle Core Branding Section */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center px-6 text-center">
        <div className={`transition-all duration-1000 delay-300 ease-out ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground drop-shadow-lg mb-3">
            {data.shopName || "Look @ Me"}
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-4" />
          <p className="text-lg md:text-xl text-primary font-medium tracking-wide">
            Let's start the day.
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2">
            Click below to open the digital ledger & dashboard.
          </p>
        </div>
      </div>

      {/* Bottom Start Button Section */}
      <div className={`relative z-20 px-6 pb-20 text-center transition-all duration-1000 delay-500 ease-out ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        <button
          onClick={onStart}
          className="group relative w-full max-w-sm mx-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-98 overflow-hidden"
        >
          {/* Subtle Button Shine */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <Sparkles className="h-5 w-5 text-primary-foreground/90 group-hover:rotate-12 transition-transform" />
          <span className="tracking-wide">Open Salon Dashboard</span>
          <LogIn className="h-4 w-4 ml-1 opacity-80 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="mt-4 text-[10px] text-muted-foreground/60 tracking-wider uppercase">
          Client Ledger &bull; Expense Tracker &bull; Attendance
        </p>
      </div>
    </div>
  );
}
