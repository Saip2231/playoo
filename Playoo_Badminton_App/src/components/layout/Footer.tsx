import React from "react";
import Link from "next/link";
import { Flame, Globe, Activity, MessageSquare, Shield, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-md">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                Playoo
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              Simplifying premium Badminton court reservations and matchmaking. Connect, challenge, and dominate your local arena.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-teal-400 rounded-lg transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors">
                <Activity className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-violet-400 rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/arenas" className="hover:text-teal-400 transition-colors">
                  Find Arenas
                </Link>
              </li>
              <li>
                <Link href="/match" className="hover:text-emerald-400 transition-colors">
                  Matchmaker suggest
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-violet-400 transition-colors">
                  Dashboard Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture info (for team showcase) */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Architecture</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>PostgreSQL (Schedules)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Neo4j (Matchmaking)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>CouchDB (Reviews)</span>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-1.5 hover:text-white transition-colors">
                <Shield className="w-3.5 h-3.5" />
                <a href="#">Privacy Policy</a>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-white transition-colors">
                <FileText className="w-3.5 h-3.5" />
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-8 text-center text-xs text-slate-500 flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} Playoo App. All rights reserved.
          </div>
          <div className="text-slate-500">
            Designed for Student Project & Portfolio Showcase.
          </div>
        </div>
      </div>
    </footer>
  );
}
