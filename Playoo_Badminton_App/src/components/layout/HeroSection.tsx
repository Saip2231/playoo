"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, MapPin, Calendar, Activity, ChevronRight, Navigation } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [geoState, setGeoState] = useState<"idle" | "loading" | "success" | "denied">("idle");
  const [userLocationName, setUserLocationName] = useState<string>("");

  useEffect(() => {
    // Attempt automatic soft geolocation fetch on mount
    if (typeof window !== "undefined" && navigator.geolocation) {
      const storedLat = localStorage.getItem("playoo_latitude");
      if (storedLat) {
        setGeoState("success");
        setUserLocationName("Saved Coords Active");
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/arenas?search=${encodeURIComponent(searchQuery)}`);
  };

  const requestGeolocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem("playoo_latitude", position.coords.latitude.toString());
        localStorage.setItem("playoo_longitude", position.coords.longitude.toString());
        setGeoState("success");
        setUserLocationName("Real Coordinates Detected");
        // Trigger page refresh event or let dynamic list query read state
        const geoEvent = new CustomEvent("playooGeoChange");
        window.dispatchEvent(geoEvent);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeoState("denied");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 pt-20 pb-24 md:pt-28 md:pb-36 border-b border-slate-900">
      {/* Dynamic Glowing Spotlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-glow pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-violet-500/10 rounded-full blur-[90px] animate-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Pitch Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs sm:text-sm font-semibold tracking-wide mb-6">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>Badminton-Only Matching Platform • Postgres + Neo4j + CouchDB</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Smash. Match. Dominate. <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
            Playoo: Premium Badminton Matchmaker
          </span>
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Book professional wooden & carpet court slots instantly, match with local players matching your ELO skill rating, and coordinate real-time matches near you.
        </p>

        {/* Dynamic Search Bar */}
        <div className="max-w-3xl mx-auto space-y-4">
          <form
            onSubmit={handleSearch}
            className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-slate-950/50 flex flex-col sm:flex-row gap-3 items-stretch"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search premium courts, synthetic carpets, halls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestGeolocation}
                className={`px-4 rounded-xl border flex items-center justify-center space-x-1.5 text-xs font-bold transition-all ${
                  geoState === "success"
                    ? "bg-teal-500/10 border-teal-500 text-teal-400"
                    : geoState === "loading"
                    ? "bg-slate-900 border-slate-800 text-slate-400 animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
                title="Detect Current Geolocation"
              >
                <Navigation className={`w-4 h-4 ${geoState === "loading" ? "animate-spin" : ""}`} />
                <span>
                  {geoState === "success"
                    ? "📍 Near You"
                    : geoState === "loading"
                    ? "Locating..."
                    : "Use Location"}
                </span>
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm px-6 rounded-xl transition-all shadow-md shadow-teal-500/10 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Find Courts</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Dynamic Geo Feedback status row */}
          {geoState === "success" && (
            <div className="text-xs text-teal-400 flex items-center justify-center space-x-1.5 animate-fade-in font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>HTML5 Geolocation Enabled: Nearest courts & players sorted by precise kilometer proximity.</span>
            </div>
          )}
          {geoState === "denied" && (
            <div className="text-xs text-rose-400 flex items-center justify-center space-x-1 animate-fade-in">
              <span>📍 Location permission declined. Using default NYC Midtown baselines for distance indexes.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
