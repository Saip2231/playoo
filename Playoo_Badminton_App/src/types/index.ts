export interface Arena {
  id: string;
  name: string;
  sport: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  location: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export interface Court {
  id: string;
  name: string;
  type: "Indoor" | "Outdoor";
  arenaId: string;
  pricePerHour: number;
}

export interface Slot {
  id: string;
  courtId: string;
  courtName: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  date: string;      // e.g. "2026-05-09"
  isBooked: boolean;
  price: number;
}

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  courtId: string;
  courtName: string;
  arenaId: string;
  arenaName: string;
  sport: string;
  startTime: string;
  endTime: string;
  date: string;
  amountPaid: number;
  status: "Confirmed" | "Cancelled" | "Pending";
}

export interface Player {
  id: string;
  name: string;
  email: string;
  elo: number;
  avatarUrl: string;
  preferredSport: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  winRate: number;      // e.g., 68
  matchCount: number;   // e.g., 42
  distance?: string;    // e.g., "1.5 km away" (for matchmaking suggestions)
  latitude?: number;
  longitude?: number;
}

export interface Challenge {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  sport: string;
  date: string;
  time: string;
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
}

export interface Review {
  id: string;       // couchdb doc _id
  arenaId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  sportPlayed: string;
}
