"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, clearToken, User } from "../../services/auth";
import { Trophy, Calendar, MapPin, LayoutDashboard, LogOut, Menu, X, Flame } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Poll for auth changes or load on mount
  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]); // Refresh user whenever route changes

  const handleLogout = () => {
    clearToken();
    setUser(null);
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Find Arenas", href: "/arenas", icon: MapPin },
    { name: "Matchmaker", href: "/match", icon: Trophy },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 shadow-lg shadow-teal-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-tr from-teal-500 via-emerald-500 to-violet-500 rounded-lg group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent tracking-wide font-sans">
              Playoo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-slate-900 text-teal-400 border border-teal-500/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section / Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Elo badge */}
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Elo {user.elo}</span>
                </div>
                {/* User profile */}
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 group"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover group-hover:border-teal-400 transition-colors"
                  />
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {user.name}
                  </span>
                </Link>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-lg transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-slate-900 text-teal-400 border border-teal-500/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="border-t border-slate-800 pt-3 mt-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
                    <Trophy className="w-3 h-3" />
                    <span>Elo {user.elo}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center px-4 py-2.5 rounded-lg border border-slate-700 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-base font-medium text-white transition-all shadow-md shadow-teal-500/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
