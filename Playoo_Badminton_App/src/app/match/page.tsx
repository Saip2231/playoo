"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMatchSuggestions, getChallenges, postChallenge, updateChallengeStatus } from "../../services/match";
import { getCurrentUser } from "../../services/auth";
import { Player, Challenge } from "../../types";
import {
  Trophy,
  SlidersHorizontal,
  Flame,
  Calendar,
  Clock,
  Send,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ChevronRight,
  Database
} from "lucide-react";

import { calculateHaversineDistance, formatGeoDistance } from "../../lib/geo";

const SPORTS_LIST = ["Badminton"];

function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state synchronization (optionally passed from booking success page)
  const querySport = searchParams.get("sport") || "Badminton";
  const queryDate = searchParams.get("date") || "";
  const queryTime = searchParams.get("time") || "";
  const queryCourtName = searchParams.get("court") || "";

  // States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [opponents, setOpponents] = useState<Player[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: "discover" or "requests"
  const [activeTab, setActiveTab] = useState<"discover" | "requests">("discover");

  // Filters state
  const [selectedSport, setSelectedSport] = useState(querySport);
  const [eloRange, setEloRange] = useState<number>(300); // within +/- 300 Elo
  const [maxDistance, setMaxDistance] = useState<number>(5); // within 5 km

  // Challenge modal / form trigger
  const [selectedPlayerForChallenge, setSelectedPlayerForChallenge] = useState<Player | null>(null);
  const [challengeDate, setChallengeDate] = useState(queryDate || new Date().toISOString().split("T")[0]);
  const [challengeTime, setChallengeTime] = useState(queryTime || "18:00");
  const [sendingChallenge, setSendingChallenge] = useState(false);
  const [challengeSuccessMsg, setChallengeSuccessMsg] = useState("");

  // Initialize and load
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    async function loadMatchmakerData() {
      try {
        setLoading(true);
        // Load neo4j recommendations
        let playerSuggestions = await getMatchSuggestions(user?.id || "usr_1001", selectedSport === "All" ? undefined : selectedSport);
        
        // Geolocation enhancement for recommended players
        if (typeof window !== "undefined") {
          const storedLat = localStorage.getItem("playoo_latitude");
          const storedLng = localStorage.getItem("playoo_longitude");
          if (storedLat && storedLng) {
            const userLat = parseFloat(storedLat);
            const userLng = parseFloat(storedLng);
            playerSuggestions = playerSuggestions.map((p) => {
              if (p.latitude && p.longitude) {
                const distKm = calculateHaversineDistance(userLat, userLng, p.latitude, p.longitude);
                return {
                  ...p,
                  distance: `${formatGeoDistance(distKm)} away`,
                };
              }
              return p;
            });
          }
        }

        setOpponents(playerSuggestions);

        if (user) {
          // Load existing challenge requests
          const challengeData = await getChallenges(user.id);
          setChallenges(challengeData);
        }
      } catch (err) {
        console.error("Failed to load matchmaker data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatchmakerData();
  }, [selectedSport]);

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
  };

  // Challenge Trigger modal submission
  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerForChallenge) return;
    if (!currentUser) {
      router.push("/login?redirect=" + encodeURIComponent("/match"));
      return;
    }

    try {
      setSendingChallenge(true);
      const payload = {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatarUrl,
        receiverId: selectedPlayerForChallenge.id,
        receiverName: selectedPlayerForChallenge.name,
        sport: selectedPlayerForChallenge.preferredSport,
        date: challengeDate,
        time: challengeTime,
      };

      const newChallenge = await postChallenge(payload);
      
      // Update UI list
      setChallenges([newChallenge, ...challenges]);
      
      setChallengeSuccessMsg(`Successfully challenged ${selectedPlayerForChallenge.name}! Challenge sent to network.`);
      setTimeout(() => {
        setChallengeSuccessMsg("");
        setSelectedPlayerForChallenge(null);
        // Switch to requests tab to review sent request
        setActiveTab("requests");
      }, 2000);
    } catch (err) {
      console.error("Failed to challenge player:", err);
    } finally {
      setSendingChallenge(false);
    }
  };

  // Accept challenge immediately in UI
  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const success = await updateChallengeStatus(challengeId, "Accepted");
      if (success) {
        setChallenges(challenges.map((c) =>
          c.id === challengeId ? { ...c, status: "Accepted" as const } : c
        ));
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    try {
      const success = await updateChallengeStatus(challengeId, "Rejected");
      if (success) {
        setChallenges(challenges.map((c) =>
          c.id === challengeId ? { ...c, status: "Rejected" as const } : c
        ));
      }
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // Badge styles generator
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

  // Filter local logic for Elo Range and Distance slider
  const filteredOpponents = opponents.filter((opponent) => {
    // Distance filtering
    const distNum = opponent.distance ? parseFloat(opponent.distance) : 0;
    if (distNum > maxDistance) return false;

    // ELO variance filtering
    if (currentUser) {
      const eloVariance = Math.abs(opponent.elo - currentUser.elo);
      if (eloVariance > eloRange) return false;
    }

    return true;
  });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wide mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Neo4j Graph Relationship Recommendations</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Social Matchmaker
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Discover matching local sports partners nearby, evaluate their Elo skill rank, and challenge them to a court match.
          </p>
        </div>

        {/* Tab switcher pills */}
        <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === "discover"
                ? "bg-slate-950 text-violet-400 border border-violet-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Discover Players</span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer relative ${
              activeTab === "requests"
                ? "bg-slate-950 text-violet-400 border border-violet-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Challenges</span>
            {challenges.filter((c) => c.status === "Pending" && c.receiverId === currentUser?.id).length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-slate-950 text-[10px] font-black text-white flex items-center justify-center animate-bounce">
                {challenges.filter((c) => c.status === "Pending" && c.receiverId === currentUser?.id).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Discover Players View Rendering */}
      {activeTab === "discover" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Column Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl border border-slate-900 p-5 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                <span className="font-bold text-slate-200">Match Filters</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              </div>

              {/* Slider for ELO Variance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>ELO Delta Range</span>
                  <span className="text-violet-400 font-mono">±{eloRange}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={eloRange}
                  onChange={(e) => setEloRange(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Filters graph nodes by Elo proximity to ensure matching skill matchups.
                </p>
              </div>

              {/* Slider for Distance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Max Radius Distance</span>
                  <span className="text-violet-400 font-mono">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Restricts spatial matching recommendations inside physical radius borders.
                </p>
              </div>

              {/* Neo4j details bubble */}
              <div className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/10 text-[10px] text-slate-400 leading-relaxed flex items-start space-x-2.5">
                <Database className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Neo4j Spatial Graph Engine</span>
                  <p>Matches and maps physical distance coordinate indices against weighted ELO skill differences instantly using Cypher indexes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opponents List Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sports Pills selector row */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-900">
              {SPORTS_LIST.map((sport) => (
                <button
                  key={sport}
                  onClick={() => handleSportSelect(sport)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    selectedSport === sport
                      ? "bg-slate-900 border-violet-500 text-violet-400"
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-64 w-full rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"
                  />
                ))}
              </div>
            ) : filteredOpponents.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-300">No Players Located</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                  Try adjusting your ELO range variance or physical distance sliders to find other local players.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpponents.map((opponent) => (
                  <div
                    key={opponent.id}
                    className="glass-card rounded-2xl border border-slate-900 p-5 space-y-5 flex flex-col justify-between hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-950/5 group transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={opponent.avatarUrl}
                          alt={opponent.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-850 object-cover group-hover:border-violet-500 transition-colors"
                        />
                        <div>
                          <h3 className="font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                            {opponent.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block mt-0.5">
                            Prefers {opponent.preferredSport} • {opponent.distance}
                          </span>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${getSkillBadgeClass(opponent.skillLevel)}`}>
                        {opponent.skillLevel}
                      </div>
                    </div>

                    {/* Win rate stats breakdown */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-900 text-center text-xs sm:text-sm">
                      <div>
                        <div className="font-bold text-slate-100 font-mono">{opponent.elo}</div>
                        <span className="text-[8px] text-slate-500 uppercase font-semibold">Elo Rating</span>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-400 font-mono">{opponent.winRate}%</div>
                        <span className="text-[8px] text-slate-500 uppercase font-semibold">Win Rate</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 font-mono">{opponent.matchCount}</div>
                        <span className="text-[8px] text-slate-500 uppercase font-semibold">Matches</span>
                      </div>
                    </div>

                    {/* Challenge button trigger */}
                    <button
                      onClick={() => setSelectedPlayerForChallenge(opponent)}
                      className="w-full py-2 bg-slate-900 hover:bg-violet-500 hover:text-white border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Send Challenge Request</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenges Requests View (Pending, Sent, Received) */}
      {activeTab === "requests" && (
        <div className="max-w-4xl mx-auto space-y-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-28 w-full rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"
                />
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-300">No Active Challenges</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                You have not sent or received any matchmaking challenge requests yet. Challenge suggested players above!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {challenges.map((challenge) => {
                const isSentByMe = challenge.senderId === currentUser?.id;
                return (
                  <div
                    key={challenge.id}
                    className="glass-card rounded-2xl border border-slate-900 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-violet-500/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {isSentByMe ? (
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">
                              Challenge Sent to <span className="text-violet-400">{challenge.receiverName}</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase block mt-0.5">
                              {challenge.sport} Match • {challenge.date} at {challenge.time}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <img
                            src={challenge.senderAvatar}
                            alt={challenge.senderName}
                            className="w-10 h-10 rounded-full border border-slate-800 object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">
                              Challenge Received from <span className="text-violet-400">{challenge.senderName}</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase block mt-0.5">
                              {challenge.sport} Match • {challenge.date} at {challenge.time}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side interactions depending on status */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      {challenge.status === "Pending" ? (
                        isSentByMe ? (
                          <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-bold flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Awaiting Reply</span>
                          </span>
                        ) : (
                          <div className="flex space-x-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleRejectChallenge(challenge.id)}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAcceptChallenge(challenge.id)}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Accept Match</span>
                            </button>
                          </div>
                        )
                      ) : challenge.status === "Accepted" ? (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Match Confirmed</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Challenge Sending Dialog Overlay */}
      {selectedPlayerForChallenge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl p-6 border border-slate-900 w-full max-w-md space-y-5 shadow-2xl relative bg-gradient-to-br from-slate-900/90 to-slate-950">
            <div className="text-center space-y-2">
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl w-fit mx-auto text-violet-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Challenge {selectedPlayerForChallenge.name}
              </h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                Schedule the challenge date & time. They will receive an instant notification.
              </p>
            </div>

            {challengeSuccessMsg ? (
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                {challengeSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSendChallenge} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Match Date
                  </label>
                  <input
                    type="date"
                    value={challengeDate}
                    onChange={(e) => setChallengeDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Match Time
                  </label>
                  <input
                    type="time"
                    value={challengeTime}
                    onChange={(e) => setChallengeTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                {queryCourtName && (
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-400">
                    <span className="font-bold text-slate-300">Booked Location: </span>
                    <span>{queryCourtName}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayerForChallenge(null)}
                    className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingChallenge}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/10 cursor-pointer"
                  >
                    {sendingChallenge ? "Sending..." : "Send Challenge"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading matchmaking...</p>
      </div>
    }>
      <MatchmakingContent />
    </Suspense>
  );
}
