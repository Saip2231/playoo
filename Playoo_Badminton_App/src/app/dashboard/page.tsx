"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookings, cancelBooking } from "../../services/booking";
import { getChallenges } from "../../services/match";
import { getCurrentUser, User } from "../../services/auth";
import { Booking, Challenge, Player } from "../../types";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Flame,
  UserCheck,
  CalendarDays,
  XCircle,
  Activity,
  PlusCircle,
  TrendingUp,
  Award,
  Database
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  // States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation feedback state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    
    // Auth Guard - Redirect to login if user is not authenticated
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent("/dashboard"));
      return;
    }
    
    setCurrentUser(user);

    async function loadDashboardData(activeUser: User) {
      try {
        setLoading(true);
        // Load PostgreSQL upcoming bookings
        const userBookings = await getBookings(activeUser.id);
        setBookings(userBookings);

        // Load Neo4j matchmaking challenges
        const challengeData = await getChallenges(activeUser.id);
        setChallenges(challengeData);
      } catch (err) {
        console.error("Failed to load dashboard logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData(user);
  }, []);

  const handleCancelReservation = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation slot?")) return;

    try {
      setCancellingId(bookingId);
      const success = await cancelBooking(bookingId);
      if (success) {
        // Update local list (change status to Cancelled or remove)
        setBookings(bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" as const } : b
        ));
      }
    } catch (err) {
      console.error("Cancellation error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const getSkillBadgeClass = (skill: string) => {
    switch (skill) {
      case "Pro":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Advanced":
        return "bg-violet-500/10 border-violet-500/20 text-violet-400";
      case "Intermediate":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading your player dashboard parameters...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  // Split bookings into Active (Confirmed/Pending) vs Cancelled
  const activeBookings = bookings.filter((b) => b.status !== "Cancelled");
  const pastBookings = bookings.filter((b) => b.status === "Cancelled");

  // Confirmed matches from matchmaking challenges
  const activeChallenges = challenges.filter((c) => c.status === "Accepted");

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      
      {/* 1. Header Hero Panel */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-900 bg-gradient-to-br from-slate-900/40 via-slate-950 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        {/* Spotlights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px]" />

        <div className="flex items-center space-x-4 relative z-10">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentUser.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${getSkillBadgeClass(currentUser.skillLevel)}`}>
                {currentUser.skillLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Player Hub • Registered {currentUser.joinedDate}
            </p>
            <span className="inline-flex items-center space-x-1 text-xs text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              <Activity className="w-3.5 h-3.5" />
              <span>Preferred: {currentUser.preferredSport}</span>
            </span>
          </div>
        </div>

        {/* Dashboard quick CTA */}
        <div className="flex gap-2.5 w-full md:w-auto relative z-10">
          <button
            onClick={() => router.push("/arenas")}
            className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-500/10 cursor-pointer flex items-center justify-center space-x-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book a Court</span>
          </button>
          <button
            onClick={() => router.push("/match")}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
          >
            <Trophy className="w-4 h-4 text-violet-400" />
            <span>Find Matches</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Grid Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: ELO */}
        <div className="glass-card rounded-2xl p-5 border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-violet-400">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Elo Rating</span>
            <Trophy className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
              {currentUser.elo}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top 12% in Local Graph</span>
            </div>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="glass-card rounded-2xl p-5 border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
              68.5%
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-1 font-semibold">
              <span>W-L: 28 - 14 matches</span>
            </div>
          </div>
        </div>

        {/* Card 3: Matches Played */}
        <div className="glass-card rounded-2xl p-5 border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-teal-400">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matches</span>
            <Flame className="w-5 h-5 text-teal-500 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
              42
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-1 font-semibold">
              <span>9 Challenges pending</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active bookings */}
        <div className="glass-card rounded-2xl p-5 border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-sky-400">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reservations</span>
            <CalendarDays className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
              {activeBookings.length}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-1 font-semibold">
              <span>PostgreSQL Bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Double Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Reservations */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <span>Court Bookings (PostgreSQL)</span>
          </h2>

          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="p-10 bg-slate-900/20 border border-slate-900 rounded-2xl text-center space-y-4">
                <CalendarDays className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-300">No Active Reservations</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto">
                  Reserve private slots on premium arenas and track your schedules securely.
                </p>
                <button
                  onClick={() => router.push("/arenas")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Schedule a Court
                </button>
              </div>
            ) : (
              activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-card rounded-2xl border border-slate-900 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-teal-500/10 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 bg-teal-500 text-white font-bold text-[10px] rounded-lg shadow-sm">
                        {booking.sport}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">
                        {booking.arenaName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{booking.courtName}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{booking.date}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center space-x-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 border-t border-slate-900 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] text-slate-500 uppercase font-semibold">Amount Paid</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">
                        ${booking.amountPaid.toFixed(2)}
                      </span>
                    </div>

                    <button
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelReservation(booking.id)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{cancellingId === booking.id ? "Voiding..." : "Cancel"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Past Bookings Row */}
          {pastBookings.length > 0 && (
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                Voided / Cancelled Bookings ({pastBookings.length})
              </h4>
              <div className="space-y-2.5 opacity-60">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs sm:text-sm text-slate-500"
                  >
                    <div>
                      <span className="font-bold line-clamp-1">{booking.arenaName}</span>
                      <span className="text-[10px] block mt-0.5">{booking.date} at {booking.startTime}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cancelled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Confirmed matchmaking games */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-violet-400 animate-pulse" />
            <span>Social Matches (Neo4j)</span>
          </h2>

          <div className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="p-8 bg-slate-900/20 border border-slate-900 rounded-2xl text-center space-y-3">
                <Flame className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-300">No Confirmed Matches</h3>
                <p className="text-slate-500 text-xs">
                  Challenge suggested opponents to map games in your player network!
                </p>
                <button
                  onClick={() => router.push("/match")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-800"
                >
                  Browse Players
                </button>
              </div>
            ) : (
              activeChallenges.map((challenge) => {
                const opponentName = challenge.senderId === currentUser.id ? challenge.receiverName : challenge.senderName;
                return (
                  <div
                    key={challenge.id}
                    className="glass-card rounded-2xl border border-slate-900 p-4.5 space-y-4 hover:border-violet-500/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {challenge.sport} Matchup
                          </h4>
                          <span className="text-sm font-bold text-slate-100 block mt-0.5">
                            Vs {opponentName}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        Accepted
                      </span>
                    </div>

                    {/* Schedule detail bar */}
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{challenge.date}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{challenge.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
