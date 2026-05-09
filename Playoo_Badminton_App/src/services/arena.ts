import api from "./api";
import { Arena, Court, Slot } from "../types";

// Static mock data representing PostgreSQL stored arenas
const MOCK_ARENAS: Arena[] = [
  {
    id: "arn_1",
    name: "Central Badminton Club",
    sport: "Badminton",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 34,
    distance: "1.2 km",
    location: "450 Park Avenue, Midtown",
    amenities: ["Floodlights", "Locker Rooms", "Shower", "Pro Shop", "Cafe", "Indoor AC"],
    latitude: 40.7648,
    longitude: -73.9744,
  },
  {
    id: "arn_2",
    name: "Smash Badminton Club",
    sport: "Badminton",
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 22,
    distance: "2.5 km",
    location: "88 Sports Center Dr, Eastside",
    amenities: ["Locker Rooms", "Shower", "Racket Renting", "Coaching", "Pro Shop"],
    latitude: 40.7549,
    longitude: -73.9840,
  },
  {
    id: "arn_3",
    name: "Apex Badminton Arena",
    sport: "Badminton",
    imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 47,
    distance: "3.1 km",
    location: "102 Stadium Boulevard, Westside",
    amenities: ["Indoor AC", "Locker Rooms", "Electronic Scoreboard", "Shower", "Cafe"],
    latitude: 40.7306,
    longitude: -73.9352,
  },
  {
    id: "arn_4",
    name: "Vanguard Badminton Hall",
    sport: "Badminton",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 18,
    distance: "4.0 km",
    location: "15 Turf Way, North Suburbs",
    amenities: ["Locker Rooms", "Shower", "Parking", "Spectator Stand", "Indoor AC"],
    latitude: 40.8075,
    longitude: -73.9626,
  },
  {
    id: "arn_5",
    name: "Badminton Dome",
    sport: "Badminton",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 15,
    distance: "1.8 km",
    location: "303 Activity Way, Southside",
    amenities: ["Floodlights", "Racket Renting", "Locker Rooms", "Social Lounge", "Cafe"],
    latitude: 40.6782,
    longitude: -73.9442,
  }
];

const MOCK_COURTS: Record<string, Court[]> = {
  arn_1: [
    { id: "crt_1_1", name: "Court 1 (Yonex Premium Carpet)", type: "Indoor", arenaId: "arn_1", pricePerHour: 22 },
    { id: "crt_1_2", name: "Court 2 (Yonex Premium Carpet)", type: "Indoor", arenaId: "arn_1", pricePerHour: 22 },
    { id: "crt_1_3", name: "Court 3 (Li-Ning Wood Flooring)", type: "Indoor", arenaId: "arn_1", pricePerHour: 18 },
  ],
  arn_2: [
    { id: "crt_2_1", name: "Court Alpha (Premium Synthetic)", type: "Indoor", arenaId: "arn_2", pricePerHour: 15 },
    { id: "crt_2_2", name: "Court Beta (Premium Synthetic)", type: "Indoor", arenaId: "arn_2", pricePerHour: 15 },
    { id: "crt_2_3", name: "Court Gamma (Classic Wooden)", type: "Indoor", arenaId: "arn_2", pricePerHour: 12 },
  ],
  arn_3: [
    { id: "crt_3_1", name: "Main Court (Showcourt Yonex)", type: "Indoor", arenaId: "arn_3", pricePerHour: 25 },
    { id: "crt_3_2", name: "Court East (Standard Carpet)", type: "Indoor", arenaId: "arn_3", pricePerHour: 20 },
  ],
  arn_4: [
    { id: "crt_4_1", name: "Court 1 (Victor Carpet Floor)", type: "Indoor", arenaId: "arn_4", pricePerHour: 20 },
    { id: "crt_4_2", name: "Court 2 (Victor Carpet Floor)", type: "Indoor", arenaId: "arn_4", pricePerHour: 20 },
  ],
  arn_5: [
    { id: "crt_5_1", name: "Dome Court 1", type: "Indoor", arenaId: "arn_5", pricePerHour: 16 },
    { id: "crt_5_2", name: "Dome Court 2", type: "Indoor", arenaId: "arn_5", pricePerHour: 16 },
  ]
};

// Generate hours slots for courts (e.g. 08:00 - 22:00)
const generateSlotsForCourt = (courtId: string, courtName: string, price: number, dateStr: string): Slot[] => {
  const slots: Slot[] = [];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
  
  hours.forEach((hour, idx) => {
    const nextHour = (parseInt(hour.split(":")[0]) + 1).toString().padStart(2, "0") + ":00";
    // Deterministic random bookings for demo purposes
    const hash = (courtId.charCodeAt(courtId.length - 1) + idx + new Date(dateStr).getDate()) % 3;
    const isBooked = hash === 0; // ~33% slots are booked
    
    slots.push({
      id: `slt_${courtId}_${dateStr.replace(/-/g, "")}_${hour.replace(/:/g, "")}`,
      courtId,
      courtName,
      startTime: hour,
      endTime: nextHour,
      date: dateStr,
      isBooked,
      price,
    });
  });
  
  return slots;
};

// Core API services
export const getArenas = async (): Promise<Arena[]> => {
  try {
    const res = await api.get("/api/arenas");
    return res.data;
  } catch {
    // Fallback to beautiful mock data when backend is not run
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_ARENAS;
  }
};

export const getArena = async (id: string): Promise<Arena | undefined> => {
  try {
    const res = await api.get(`/api/arenas/${id}`);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ARENAS.find((a) => a.id === id);
  }
};

export const getCourts = async (arenaId: string): Promise<Court[]> => {
  try {
    const res = await api.get(`/api/arenas/${arenaId}/courts`);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_COURTS[arenaId] || [];
  }
};

export const getArenaSlots = async (arenaId: string, dateStr: string): Promise<Slot[]> => {
  try {
    const res = await api.get(`/api/arenas/${arenaId}/slots`, { params: { date: dateStr } });
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const courts = MOCK_COURTS[arenaId] || [];
    let allSlots: Slot[] = [];
    courts.forEach((court) => {
      allSlots = [...allSlots, ...generateSlotsForCourt(court.id, court.name, court.pricePerHour, dateStr)];
    });
    return allSlots;
  }
};

// Retrieve a single slot's details (needed for booking screen)
export const getSlotDetails = async (slotId: string): Promise<{ slot: Slot; court: Court; arena: Arena } | null> => {
  try {
    const res = await api.get(`/api/slots/${slotId}`);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Parse slotId, format: "slt_[courtId]_[date]_[time]"
    const parts = slotId.split("_");
    if (parts.length < 5) return null;
    
    const courtId = `${parts[1]}_${parts[2]}_${parts[3]}`;
    // Find court & arena
    let foundCourt: Court | undefined;
    let foundArena: Arena | undefined;
    
    for (const [arenaId, courts] of Object.entries(MOCK_COURTS)) {
      const match = courts.find((c) => c.id === courtId);
      if (match) {
        foundCourt = match;
        foundArena = MOCK_ARENAS.find((a) => a.id === arenaId);
        break;
      }
    }
    
    if (!foundCourt || !foundArena) return null;
    
    // Reconstruct slot
    const datePart = parts[4]; // YYYYMMDD
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    const dateStr = `${year}-${month}-${day}`;
    
    const timePart = parts[5]; // HHMM
    const hour = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
    const endHour = (parseInt(timePart.substring(0, 2)) + 1).toString().padStart(2, "0") + ":00";
    
    const slot: Slot = {
      id: slotId,
      courtId: foundCourt.id,
      courtName: foundCourt.name,
      startTime: hour,
      endTime: endHour,
      date: dateStr,
      isBooked: false, // For booking screen, assume slot is being selected for booking
      price: foundCourt.pricePerHour,
    };
    
    return { slot, court: foundCourt, arena: foundArena };
  }
};
