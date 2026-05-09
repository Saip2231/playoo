"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getArena, getArenaSlots } from "../../../services/arena";
import { getReviews, postReview } from "../../../services/review";
import { getCurrentUser } from "../../../services/auth";
import { Arena, Slot, Review } from "../../../types";
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  PlusCircle,
  Sparkles,
  MessageSquare,
  DollarSign
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArenaDetailPage({ params }: PageProps) {
  const router = useRouter();
  
  // Resolve dynamic id params from Next.js 16 Promise
  const { id } = use(params);

  // States
  const [arena, setArena] = useState<Arena | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateList, setDateList] = useState<{ label: string; value: string }[]>([]);

  // Review Form States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [postingReview, setPostingReview] = useState(false);
  const [reviewFormError, setReviewFormError] = useState("");

  // Select Slot State
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Initialize the next 7 days list
  useEffect(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      
      const label = i === 0 
        ? "Today" 
        : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      
      list.push({ label, value: dateStr });
    }
    setDateList(list);
    setSelectedDate(list[0].value); // Default to today
  }, []);

  // Fetch Arena info, slots, and CouchDB reviews
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        const arenaData = await getArena(id);
        setArena(arenaData || null);

        if (selectedDate) {
          const slotData = await getArenaSlots(id, selectedDate);
          setSlots(slotData);
        }

        const reviewData = await getReviews(id);
        setReviews(reviewData);
        
        setCurrentUser(getCurrentUser());
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Clear selected slot when date changes
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.isBooked) return;
    setSelectedSlot(slot);
  };

  const handleBookSlot = () => {
    if (!selectedSlot) return;
    router.push(`/book/${selectedSlot.id}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arena || !id) return;
    if (!currentUser) {
      router.push("/login?redirect=" + encodeURIComponent(`/arenas/${id}`));
      return;
    }

    if (reviewComment.trim().length < 10) {
      setReviewFormError("Your review comments must be at least 10 characters long.");
      return;
    }

    try {
      setReviewFormError("");
      setPostingReview(true);
      const newReview = await postReview({
        arenaId: id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        rating: reviewRating,
        comment: reviewComment,
        sportPlayed: arena.sport,
      });

      // Insert immediately into reviews list
      setReviews([newReview, ...reviews]);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.error("Failed to post review:", err);
      setReviewFormError("Something went wrong while posting your review. Try again.");
    } finally {
      setPostingReview(false);
    }
  };

  // Group slots by Court
  const courtsWithSlots = slots.reduce((acc, slot) => {
    const key = slot.courtId;
    if (!acc[key]) {
      acc[key] = {
        id: slot.courtId,
        name: slot.courtName,
        slots: [] as Slot[],
        price: slot.price
      };
    }
    acc[key].slots.push(slot);
    return acc;
  }, {} as Record<string, { id: string; name: string; slots: Slot[]; price: number }>);

  if (loading && !arena) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading premium court details...</p>
      </div>
    );
  }

  if (!arena) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Arena Not Found</h2>
        <p className="text-slate-400 mt-2">The requested court arena does not exist or has been removed.</p>
        <button
          onClick={() => router.push("/arenas")}
          className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-72 sm:h-96 w-full border border-slate-900 shadow-2xl">
        <img
          src={arena.imageUrl}
          alt={arena.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Banner Details Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-teal-500 rounded-full text-white text-xs font-bold tracking-wider">
              {arena.sport}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
              {arena.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{arena.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-teal-400 font-semibold">
                <span>{arena.distance} away</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl">
            <div className="text-center">
              <div className="flex items-center space-x-1 text-yellow-400 font-bold text-lg">
                <Star className="w-5 h-5 fill-yellow-400" />
                <span>{arena.rating.toFixed(1)}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                {reviews.length} CouchDB reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Content, Right Side Booking Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Courts & Slots Scheduler, Amenities, Reviews) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Scheduling Section */}
          <div className="glass-card rounded-2xl border border-slate-900 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <span>Choose Court & Slot</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Check hourly reservation prices and pick an empty slot (PostgreSQL Scheduler).
                </p>
              </div>
            </div>

            {/* Date Picker Ribbon */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 pr-1">
              {dateList.map((date) => (
                <button
                  key={date.value}
                  onClick={() => handleDateChange(date.value)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedDate === date.value
                      ? "bg-teal-500/10 border-teal-500 text-teal-400"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                  }`}
                >
                  <div className="text-[10px] font-semibold tracking-wide uppercase">
                    {date.label.split(" ")[0]}
                  </div>
                  <div className="text-base font-black mt-1">
                    {date.label.split(" ").slice(1).join(" ") || date.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Scheduler loading spinner */}
            {loading ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                Refreshing slots for {selectedDate}...
              </div>
            ) : Object.keys(courtsWithSlots).length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                No court details found for this date.
              </div>
            ) : (
              <div className="space-y-8">
                {Object.values(courtsWithSlots).map((court) => (
                  <div key={court.id} className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-900">
                      <span className="font-bold text-slate-200 text-sm sm:text-base">
                        {court.name}
                      </span>
                      <span className="flex items-center text-emerald-400 font-extrabold text-xs sm:text-sm">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{court.price}/hr</span>
                      </span>
                    </div>

                    {/* Hourly Slots Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {court.slots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            disabled={slot.isBooked}
                            onClick={() => handleSlotClick(slot)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                              slot.isBooked
                                ? "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-40 line-through"
                                : isSelected
                                ? "bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20 scale-105"
                                : "bg-slate-950 border-slate-850 hover:border-teal-500/30 text-slate-300 hover:text-white cursor-pointer"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.startTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities Details */}
          <div className="glass-card rounded-2xl border border-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Available Amenities</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {arena.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 text-slate-300 text-xs sm:text-sm flex items-center space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CouchDB Reviews Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <span>Player Reviews ({reviews.length})</span>
            </h3>

            {/* Add Review Form */}
            <div className="glass-card rounded-2xl border border-slate-900 p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-200">
                {currentUser ? `Rate your experience, ${currentUser.name}` : "Sign In to review this facility"}
              </h4>
              
              {currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewFormError && (
                    <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                      {reviewFormError}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Your Rating:
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-600 hover:text-yellow-400/50"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      placeholder="Share facility reports, court quality, lighting feedback... (min 10 chars)"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-200 outline-none transition-all placeholder-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postingReview}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-violet-500/10 cursor-pointer flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{postingReview ? "Posting..." : "Post Review (CouchDB logs)"}</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900/80 text-center">
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Only signed in matchmakers can write reports on court conditions.
                  </p>
                  <button
                    onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/arenas/${id}`)}`)}
                    className="mt-3.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Reviews list representation */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 bg-slate-900/10 rounded-2xl border border-slate-900 text-center text-slate-500 text-sm">
                  Be the first to leave a facility review!
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="glass-card rounded-2xl border border-slate-900 p-5 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-9 h-9 rounded-full border border-slate-800 object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">
                            {review.userName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            Played {review.sportPlayed} • {review.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-yellow-400 text-xs font-bold bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{review.rating}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-1">
                      {review.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Widget */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl border border-slate-900 p-6 sticky top-24 space-y-6 shadow-xl shadow-slate-950">
            <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Selected Slot Summary</span>
            </h3>

            {selectedSlot ? (
              <div className="space-y-6">
                {/* Visual detail badge */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-900 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Court:</span>
                    <span className="text-slate-100 font-bold">{selectedSlot.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="text-slate-100 font-bold">{selectedSlot.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Time Slot:</span>
                    <span className="text-slate-100 font-bold">
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Court Rate:</span>
                    <span className="text-slate-100 font-bold">${selectedSlot.price} / hour</span>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm text-slate-400 font-medium">Estimated Total:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ${selectedSlot.price}
                  </span>
                </div>

                <button
                  onClick={handleBookSlot}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/15 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Confirm and Reserve</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-500 text-xs sm:text-sm max-w-[200px] mx-auto">
                  Pick an available hourly slot on the scheduler to confirm pricing details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
