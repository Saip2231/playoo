"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "../components/layout/HeroSection";
import ArenaPreviewCard from "../components/arenas/ArenaPreviewCard";
import { getArenas } from "../services/arena";
import { Arena } from "../types";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, Star, Database } from "lucide-react";

export default function Home() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArenas() {
      try {
        const data = await getArenas();
        // Take top 3 arenas for landing page preview
        setArenas(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load arenas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArenas();
  }, []);

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* Hero Header */}
      <HeroSection />

      {/* Nearby Arenas Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-3">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>PostgreSQL Powered Scheduler</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Nearby Badminton Courts
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              Discover top-rated synthetic, wood, and indoor court setups with real-time slot availability, verified ratings, and custom court prices.
            </p>
          </div>
          <Link
            href="/arenas"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-teal-400 hover:text-teal-300 font-bold transition-colors group"
          >
            <span>View All Arenas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 w-full rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {arenas.map((arena) => (
              <ArenaPreviewCard key={arena.id} arena={arena} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Architecture Matrix Section (Student Project Wow Factor) */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
              Distributed Backend Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
              Designed For High-Performance Matching
            </h2>
            <p className="text-slate-400 mt-3 text-base sm:text-lg">
              This application interfaces directly with a specialized polyglot database model ensuring lightning-fast scheduling and social matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-card rounded-2xl p-6 border border-slate-900 space-y-4 hover:border-teal-500/10 transition-colors">
              <div className="p-3 bg-teal-500/10 rounded-xl w-fit border border-teal-500/20 text-teal-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>PostgreSQL Scheduler</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Manages ACID-compliant multi-user bookings and court schedules. Prevents double-bookings of time slots during high-concurrency tournament weekends.
              </p>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-400 bg-teal-500/5 px-2.5 py-1 rounded-md border border-teal-500/10 w-fit">
                <Database className="w-3.5 h-3.5" />
                <span>SQL Booking Engine</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card rounded-2xl p-6 border border-slate-900 space-y-4 hover:border-violet-500/10 transition-colors">
              <div className="p-3 bg-violet-500/10 rounded-xl w-fit border border-violet-500/20 text-violet-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Neo4j Matchmaking</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Leverages graph relationship queries to recommend local opponents with similar Elo ratings. Analyzes game networks and preferred sports in micro-seconds.
              </p>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-violet-400 bg-violet-500/5 px-2.5 py-1 rounded-md border border-violet-500/10 w-fit">
                <Database className="w-3.5 h-3.5" />
                <span>NoSQL Graph DB</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card rounded-2xl p-6 border border-slate-900 space-y-4 hover:border-emerald-500/10 transition-colors">
              <div className="p-3 bg-emerald-500/10 rounded-xl w-fit border border-emerald-500/20 text-emerald-400">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>CouchDB Reviews</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Provides a distributed, offline-first review logs cluster. Ensures players can share facility ratings, amenities feedback, and court reports smoothly.
              </p>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10 w-fit">
                <Database className="w-3.5 h-3.5" />
                <span>Document Storage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-900 relative">
        <div className="glass-card rounded-3xl p-10 md:p-16 border border-slate-900 text-center relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-xl mx-auto">
            Ready to Dominate Your Local Courts?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Create an account in less than a minute. Pick a court, find a match partner, challenge them and track your scores!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login?tab=signup"
              className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/15 hover:shadow-teal-500/25 cursor-pointer"
            >
              Sign Up Now
            </Link>
            <Link
              href="/arenas"
              className="px-8 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Browse Courts First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
