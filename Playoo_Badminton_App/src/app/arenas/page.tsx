"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getArenas } from "../../services/arena";
import { Arena } from "../../types";
import ArenaPreviewCard from "../../components/arenas/ArenaPreviewCard";
import { Search, MapPin, SlidersHorizontal, Trophy, RefreshCcw, Sparkles } from "lucide-react";
import { calculateHaversineDistance, formatGeoDistance } from "../../lib/geo";

const SPORTS_LIST = ["Badminton"];
const AMENITIES_LIST = ["Floodlights", "Locker Rooms", "Shower", "Pro Shop", "Cafe", "Indoor AC"];

function ArenasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL params state synchronization
  const initialSearch = searchParams.get("search") || "";
  const initialSport = searchParams.get("sport") || "Badminton";

  const [arenas, setArenas] = useState<Arena[]>([]);
  const [filteredArenas, setFilteredArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Search and filter inputs
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "reviews">("distance");

  // Load arenas on mount with geolocation calculation
  useEffect(() => {
    async function fetchAllArenas() {
      try {
        setLoading(true);
        let data = await getArenas();

        // Calculate and format actual distance if geolocation is active
        if (typeof window !== "undefined") {
          const storedLat = localStorage.getItem("playoo_latitude");
          const storedLng = localStorage.getItem("playoo_longitude");
          if (storedLat && storedLng) {
            const userLat = parseFloat(storedLat);
            const userLng = parseFloat(storedLng);
            data = data.map((a) => {
              if (a.latitude && a.longitude) {
                const distKm = calculateHaversineDistance(userLat, userLng, a.latitude, a.longitude);
                return {
                  ...a,
                  distance: formatGeoDistance(distKm),
                };
              }
              return a;
            });
          }
        }
        
        setArenas(data);
      } catch (err) {
        console.error("Failed to load arenas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllArenas();

    // Listen to quick locations trigger event from hero
    window.addEventListener("playooGeoChange", fetchAllArenas);
    return () => window.removeEventListener("playooGeoChange", fetchAllArenas);
  }, []);

  // Filter application logic
  useEffect(() => {
    let result = [...arenas];

    // Filter by name/location
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }

    // Filter by Sport
    if (selectedSport !== "All") {
      result = result.filter(
        (a) => a.sport.toLowerCase() === selectedSport.toLowerCase()
      );
    }

    // Filter by Amenities (must have ALL selected amenities)
    if (selectedAmenities.length > 0) {
      result = result.filter((a) =>
        selectedAmenities.every((amenity) => a.amenities.includes(amenity))
      );
    }

    // Filter by Minimum Rating
    if (minRating > 0) {
      result = result.filter((a) => a.rating >= minRating);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "distance") {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      } else if (sortBy === "rating") {
        return b.rating - a.rating;
      } else if (sortBy === "reviews") {
        return b.reviewsCount - a.reviewsCount;
      }
      return 0;
    });

    setFilteredArenas(result);
  }, [arenas, searchQuery, selectedSport, selectedAmenities, minRating, sortBy]);

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSport("All");
    setSelectedAmenities([]);
    setMinRating(0);
    setSortBy("distance");
    router.replace("/arenas");
  };

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    // Push update to URL state gracefully
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (sport === "All") {
        params.delete("sport");
      } else {
        params.set("sport", sport);
      }
      router.replace(`/arenas?${params.toString()}`);
    });
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Title & Tagline */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Search & Book (PostgreSQL API)</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Explore Sports Arenas
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Select a court facility to check available slots, prices, reviews, and court options.
          </p>
        </div>
        
        {/* Active counter */}
        {!loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-400 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Found {filteredArenas.length} Courts matching criteria</span>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-900 p-5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900">
              <span className="font-bold text-slate-200">Filters</span>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Keyword Search inside Sidebar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. Park, Alpha"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Sorting Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none cursor-pointer"
              >
                <option value="distance">📍 Distance (Closest first)</option>
                <option value="rating">⭐ Rating (Highest first)</option>
                <option value="reviews">💬 Reviews Count</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Minimum Rating
              </label>
              <div className="flex gap-1.5">
                {[0, 3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`flex-1 py-1.5 px-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      minRating === rating
                        ? "bg-teal-500/10 border-teal-500 text-teal-400"
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                    }`}
                  >
                    {rating === 0 ? "Any" : `${rating}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Amenities
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {AMENITIES_LIST.map((amenity) => {
                  const checked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2.5 text-xs text-slate-300 hover:text-white cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded border-slate-800 text-teal-500 bg-slate-950 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {amenity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Arenas Cards Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sports Filter Pills Row */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-900">
            {SPORTS_LIST.map((sport) => (
              <button
                key={sport}
                onClick={() => handleSportSelect(sport)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  selectedSport === sport
                    ? "bg-slate-900 border-teal-500 text-teal-400"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((n) => (
                <div
                  key={n}
                  className="h-96 w-full rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"
                />
              ))}
            </div>
          ) : filteredArenas.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-300">No Arenas Found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                We couldn't find any courts matching your exact search. Try resetting your active filters!
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArenas.map((arena) => (
                <ArenaPreviewCard key={arena.id} arena={arena} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArenasPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading arenas...</p>
      </div>
    }>
      <ArenasContent />
    </Suspense>
  );
}
