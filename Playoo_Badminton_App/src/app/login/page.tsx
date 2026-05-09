"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, signup, getCurrentUser } from "../../services/auth";
import { Flame, Lock, Mail, User, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";

const SPORTS = ["Tennis", "Badminton", "Basketball", "Soccer", "Pickleball"];
const SKILLS = ["Beginner", "Intermediate", "Advanced", "Pro"];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active Tab: "signin" or "signup"
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Form Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferredSport, setPreferredSport] = useState("Tennis");
  const [skillLevel, setSkillLevel] = useState("Intermediate");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If already logged in, send immediately to target route
    if (getCurrentUser()) {
      router.replace(redirectUrl);
    }
  }, [redirectUrl, router]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setErrorMsg("");
      setLoading(true);
      await login(email);
      
      // Navigate to target route
      startTransition(() => {
        router.replace(redirectUrl);
        router.refresh();
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to authorize. Please double check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    try {
      setErrorMsg("");
      setLoading(true);
      
      // Custom user node
      const eloBase = skillLevel === "Pro" ? 1750 : skillLevel === "Advanced" ? 1500 : skillLevel === "Intermediate" ? 1250 : 950;
      const payload = {
        name,
        email,
        preferredSport,
        skillLevel: skillLevel as any,
        elo: eloBase,
      };

      await signup(payload);

      startTransition(() => {
        router.replace(redirectUrl);
        router.refresh();
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during account creation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[85vh] py-16 flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative Spotlights */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-violet-500/5 rounded-full blur-[70px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand logo */}
        <div className="text-center space-y-3">
          <div className="p-3 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-2xl w-fit mx-auto shadow-md">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">
            Access Playoo Hub
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Mock sandbox profile authorization gateway.
          </p>
        </div>

        {/* Tab Selector pills */}
        <div className="flex bg-slate-900 border border-slate-850 rounded-xl p-1 font-semibold text-xs sm:text-sm">
          <button
            onClick={() => {
              setErrorMsg("");
              setActiveTab("signin");
              setTab("signin");
            }}
            className={`flex-1 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "signin"
                ? "bg-slate-950 text-teal-400 border border-slate-800"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In (Instant access)
          </button>
          <button
            onClick={() => {
              setErrorMsg("");
              setActiveTab("signup");
              setTab("signup");
            }}
            className={`flex-1 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "signup"
                ? "bg-slate-950 text-teal-400 border border-slate-800"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Matchmaker Node
          </button>
        </div>

        {/* Error Dialog wrapper */}
        {errorMsg && (
          <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center space-x-2 animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Forms */}
        <div className="glass-card rounded-2xl border border-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
          {activeTab === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    placeholder="alex.rover@matchmaker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-200 outline-none transition-all placeholder-slate-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Type any email address to generate or log into your local profile sandbox.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Secret Password
                  </label>
                  <span className="text-[10px] text-teal-500 font-semibold italic">
                    Password-free enabled
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-4.5 h-4.5" />
                  <input
                    type="password"
                    placeholder="••••••••••••••"
                    disabled
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>{loading ? "Authorizing..." : "Authorize Sandbox Profile"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Display Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder="Alex Rover"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-200 outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    placeholder="alex.rover@matchmaker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-200 outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Preferred Sport & Skill level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Preferred Sport
                  </label>
                  <select
                    value={preferredSport}
                    onChange={(e) => setPreferredSport(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-3 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    {SPORTS.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-3 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    {SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-violet-500/5 rounded-xl border border-violet-500/10 text-[10px] text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span>Creating a node inserts ELO benchmarks in local graphs automatically.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>{loading ? "Spinning Node..." : "Join Network (Create Node)"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading access portal...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

// Support changing tabs programmatically or from props
function setTab(tabName: "signin" | "signup") {
  // Client side URL update without full reloading
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabName);
    window.history.pushState({}, "", url.toString());
    
    // Trigger state change via custom event or let state manage it
    const event = new CustomEvent("tabChange", { detail: tabName });
    window.dispatchEvent(event);
  }
}

// Listen to custom tab events inside component hook
function useTabState(initial: "signin" | "signup") {
  const [tab, setTabState] = useState<"signin" | "signup">(initial);
  
  useEffect(() => {
    const handler = (e: any) => {
      setTabState(e.detail);
    };
    window.addEventListener("tabChange", handler);
    return () => window.removeEventListener("tabChange", handler);
  }, []);
  
  return [tab, setTabState] as const;
}
