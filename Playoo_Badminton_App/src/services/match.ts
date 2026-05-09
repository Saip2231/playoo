import api from "./api";
import { Player, Challenge } from "../types";

// Static mock players representing Neo4j graph nodes (nodes with relationship edges based on ELO & location)
const MOCK_OPPONENTS: Player[] = [
  {
    id: "plr_201",
    name: "Marcus Vance",
    email: "marcus@matchmaker.com",
    elo: 1560,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    preferredSport: "Badminton",
    skillLevel: "Advanced",
    winRate: 72,
    matchCount: 39,
    distance: "0.8 km away",
    latitude: 40.7410,
    longitude: -73.9450,
  },
  {
    id: "plr_202",
    name: "Elena Rostova",
    email: "elena@matchmaker.com",
    elo: 1490,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    preferredSport: "Badminton",
    skillLevel: "Advanced",
    winRate: 65,
    matchCount: 28,
    distance: "1.4 km away",
    latitude: 40.7180,
    longitude: -73.9250,
  },
  {
    id: "plr_203",
    name: "Devon Carter",
    email: "devon@matchmaker.com",
    elo: 1610,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    preferredSport: "Badminton",
    skillLevel: "Pro",
    winRate: 80,
    matchCount: 64,
    distance: "2.1 km away",
    latitude: 40.7450,
    longitude: -73.9120,
  },
  {
    id: "plr_204",
    name: "Yuki Tanaka",
    email: "yuki@matchmaker.com",
    elo: 1420,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    preferredSport: "Badminton",
    skillLevel: "Intermediate",
    winRate: 58,
    matchCount: 19,
    distance: "1.9 km away",
    latitude: 40.7210,
    longitude: -73.9550,
  },
  {
    id: "plr_205",
    name: "Chloe Dupont",
    email: "chloe@matchmaker.com",
    elo: 1510,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    preferredSport: "Badminton",
    skillLevel: "Advanced",
    winRate: 68,
    matchCount: 31,
    distance: "3.5 km away",
    latitude: 40.7620,
    longitude: -73.9300,
  }
];

let activeChallenges: Challenge[] = [
  {
    id: "chg_501",
    senderId: "plr_202",
    senderName: "Elena Rostova",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    receiverId: "usr_1001",
    receiverName: "Alex Rover",
    sport: "Badminton",
    date: "2026-05-11",
    time: "16:00",
    status: "Pending",
  },
  {
    id: "chg_502",
    senderId: "usr_1001",
    senderName: "Alex Rover",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    receiverId: "plr_201",
    receiverName: "Marcus Vance",
    sport: "Badminton",
    date: "2026-05-15",
    time: "18:00",
    status: "Accepted",
  }
];

export const getMatchSuggestions = async (userId: string, sport?: string): Promise<Player[]> => {
  try {
    const res = await api.get(`/api/match/suggestions`, { params: { userId, sport } });
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (sport) {
      return MOCK_OPPONENTS.filter((p) => p.preferredSport.toLowerCase() === sport.toLowerCase());
    }
    return MOCK_OPPONENTS;
  }
};

export const getChallenges = async (userId: string): Promise<Challenge[]> => {
  try {
    const res = await api.get(`/api/challenges`, { params: { userId } });
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return activeChallenges.filter((c) => c.senderId === userId || c.receiverId === userId);
  }
};

export const postChallenge = async (payload: {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  sport: string;
  date: string;
  time: string;
}): Promise<Challenge> => {
  try {
    const res = await api.post("/api/challenges", payload);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newChallenge: Challenge = {
      id: `chg_${Math.floor(Math.random() * 90000) + 10000}`,
      ...payload,
      status: "Pending",
    };
    activeChallenges.unshift(newChallenge);
    return newChallenge;
  }
};

export const updateChallengeStatus = async (challengeId: string, status: "Accepted" | "Rejected" | "Completed"): Promise<boolean> => {
  try {
    await api.patch(`/api/challenges/${challengeId}`, { status });
    return true;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    activeChallenges = activeChallenges.map((c) =>
      c.id === challengeId ? { ...c, status } : c
    );
    return true;
  }
};
