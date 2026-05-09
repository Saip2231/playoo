"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSlotDetails } from "../../../services/arena";
import { postBooking } from "../../../services/booking";
import { getCurrentUser } from "../../../services/auth";
import { Arena, Court, Slot } from "../../../types";
import {
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Database,
  Lock
} from "lucide-react";

interface PageProps {
  params: Promise<{ slotId: string }>;
}

export default function BookingPage({ params }: PageProps) {
  const router = useRouter();
  
  // Resolve dynamic slotId params
  const { slotId } = use(params);

  // States
  const [slotData, setSlotData] = useState<{ slot: Slot; court: Court; arena: Arena } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paying, setPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Error State
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!slotId) return;

    async function loadSlot() {
      try {
        setLoading(true);
        const data = await getSlotDetails(slotId);
        setSlotData(data);
        
        const user = getCurrentUser();
        setCurrentUser(user);
        if (user) {
          setCardName(user.name);
        }
      } catch (err) {
        console.error("Failed to load slot:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSlot();
  }, [slotId]);

  // Handle billing payment details submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotData) return;

    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/book/${slotId}`)}`);
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setErrorMsg("Please enter a valid 16-digit credit card number.");
      return;
    }
    if (expiry.length !== 5 || !expiry.includes("/")) {
      setErrorMsg("Enter card expiration in MM/YY format.");
      return;
    }
    if (cvc.length !== 3) {
      setErrorMsg("Enter a valid 3-digit CVC code.");
      return;
    }

    try {
      setErrorMsg("");
      setPaying(true);
      
      const payload = {
        userId: currentUser.id,
        slotId: slotData.slot.id,
        courtId: slotData.court.id,
        courtName: slotData.court.name,
        arenaId: slotData.arena.id,
        arenaName: slotData.arena.name,
        sport: slotData.arena.sport,
        startTime: slotData.slot.startTime,
        endTime: slotData.slot.endTime,
        date: slotData.slot.date,
        amountPaid: slotData.slot.price,
      };

      const result = await postBooking(payload);
      setBookingId(result.id);
      setIsSuccess(true);
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg("Payment transaction failed. Try again.");
    } finally {
      setPaying(false);
    }
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    // Format card number with spaces (1234 5678 1234 5678)
    const formatted = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCvc(value);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Securing your reservation slot details...</p>
      </div>
    );
  }

  if (!slotData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Slot Unavailable</h2>
        <p className="text-slate-400 mt-2">The selected time slot is either invalid, booked, or expired.</p>
        <button
          onClick={() => router.push("/arenas")}
          className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
        >
          Back to Arenas
        </button>
      </div>
    );
  }

  const { slot, court, arena } = slotData;
  const taxFee = 2.50; // Standard booking/maintenance fee
  const finalTotal = slot.price + taxFee;

  // Booking Success State Render
  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center w-full">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-900 bg-gradient-to-br from-slate-900/40 via-slate-950 to-slate-900/40 space-y-6 relative overflow-hidden shadow-2xl">
          {/* Confetti-like glowing spotlight */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

          <div className="mx-auto p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-fit">
            <CheckCircle className="w-14 h-14 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Court Secured Successfully
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Booking Confirmed!
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Your court at <span className="text-teal-400 font-bold">{arena.name}</span> has been locked into the PostgreSQL scheduler. Your booking reference is <span className="text-slate-200 font-bold font-mono">{bookingId}</span>.
            </p>
          </div>

          {/* Reserved court info details card */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl max-w-md mx-auto text-left space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-semibold">Arena:</span>
              <span className="text-slate-100 font-bold">{arena.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-semibold">Court:</span>
              <span className="text-slate-100 font-bold">{court.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-semibold">Date:</span>
              <span className="text-slate-100 font-bold">{slot.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-semibold">Time:</span>
              <span className="text-slate-100 font-bold">{slot.startTime} - {slot.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Amount Paid:</span>
              <span className="text-emerald-400 font-extrabold">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Neo4j Matchmaker Prompt CTA */}
          <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-2xl max-w-md mx-auto text-center space-y-3">
            <h4 className="text-sm font-bold text-violet-300 flex items-center justify-center space-x-1.5">
              <span>Looking for a Match Partner?</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              We can match you with local <span className="text-violet-400 font-bold">{arena.sport}</span> players of similar Elo rating for a challenge match on your newly booked court!
            </p>
            <button
              onClick={() => router.push(`/match?sport=${encodeURIComponent(arena.sport)}&date=${slot.date}&time=${slot.startTime}&court=${encodeURIComponent(court.name)}`)}
              className="w-full py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-violet-500/15 cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>Find Opponents on Matchmaker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/arenas")}
              className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl"
            >
              Book Another Court
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Title & Back link */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 mb-3 flex items-center space-x-1"
        >
          <span>← Back to Court Details</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Secure Court Booking
        </h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm">
          Please complete your details below to finalize the hourly court booking (PostgreSQL Schema).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Payment Card form) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmitBooking} className="glass-card rounded-2xl border border-slate-900 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-teal-400" />
              <span>Credit Card Payment</span>
            </h2>

            {errorMsg && (
              <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Glowing Graphic Credit Card Representation */}
            <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-5 overflow-hidden text-white flex flex-col justify-between shadow-2xl bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 border border-teal-500/20">
              {/* Subtle ambient light bubble inside card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-[30px] pointer-events-none" />

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest">
                    Playoo Premium
                  </span>
                  <div className="text-sm font-bold mt-1">Mock Wallet</div>
                </div>
                <div className="font-black text-slate-400 italic text-sm">VISA</div>
              </div>

              <div className="space-y-4">
                {/* Visual Number */}
                <div className="text-lg sm:text-xl font-bold tracking-[0.25em] font-mono text-slate-100">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase">
                  <div>
                    <span className="block text-[8px] text-slate-500">Cardholder</span>
                    <span>{cardName || "Alex Rover"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-500">Expires</span>
                    <span>{expiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Rover"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-200 outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Expiration Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-200 outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Security CVC
                </label>
                <input
                  type="text"
                  placeholder="3-Digit CVC"
                  value={cvc}
                  onChange={handleCvcChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-200 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Secure Checkout Alert */}
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900/80 text-xs text-slate-400 flex items-start space-x-3">
              <Lock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">256-bit SSL Cryptography Encrypted</span>
                <p>This is a simulated secure transaction channel for student database presentation. No actual currency transaction occurs.</p>
              </div>
            </div>

            {/* Pay Button */}
            {currentUser ? (
              <button
                type="submit"
                disabled={paying}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/15 cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{paying ? "Authorizing transaction..." : `Pay and Confirm Court ($${finalTotal.toFixed(2)})`}</span>
              </button>
            ) : (
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900/80 text-center">
                <p className="text-slate-400 text-xs sm:text-sm">
                  You must be signed in to submit court bookings.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/book/${slotId}`)}`)}
                  className="mt-3 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-all"
                >
                  Sign In to Check out
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Checkout Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl border border-slate-900 p-6 sticky top-24 space-y-6 shadow-xl shadow-slate-950">
            <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3">
              Booking Summary
            </h3>

            {/* Visual Mini Preview of the arena */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-900">
                <img
                  src={arena.imageUrl}
                  alt={arena.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {arena.name}
                  </h4>
                  <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                    {arena.sport} Facility
                  </span>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{arena.location}</span>
                  </div>
                </div>
              </div>

              {/* Court schedule breakdowns */}
              <div className="space-y-3.5 border-b border-slate-900 pb-4 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-slate-500" />
                    <span>Selected Court:</span>
                  </span>
                  <span className="text-slate-100 font-bold">{court.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Date:</span>
                  </span>
                  <span className="text-slate-100 font-bold">{slot.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Time Duration:</span>
                  </span>
                  <span className="text-slate-100 font-bold">
                    {slot.startTime} - {slot.endTime} (1 hr)
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 border-b border-slate-900 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Court Hourly Rate:</span>
                  <span className="text-slate-100 font-bold">${slot.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking & Tax Fee:</span>
                  <span className="text-slate-100 font-bold">${taxFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-sm text-slate-400 font-bold">Total Due:</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
