import api from "./api";
import { Booking } from "../types";

// In-memory array to track users bookings during single-session lifecycle
let userBookings: Booking[] = [
  {
    id: "bkg_101",
    slotId: "slt_crt_1_1_20260510_1000",
    userId: "usr_1001",
    courtId: "crt_1_1",
    courtName: "Grand Court (Showcourt)",
    arenaId: "arn_1",
    arenaName: "Central Tennis Park",
    sport: "Tennis",
    startTime: "10:00",
    endTime: "11:00",
    date: "2026-05-10",
    amountPaid: 25,
    status: "Confirmed",
  },
  {
    id: "bkg_102",
    slotId: "slt_crt_2_2_20260512_1800",
    userId: "usr_1001",
    courtId: "crt_2_2",
    courtName: "Court Beta",
    arenaId: "arn_2",
    arenaName: "Smash Badminton Club",
    sport: "Badminton",
    startTime: "18:00",
    endTime: "19:00",
    date: "2026-05-12",
    amountPaid: 15,
    status: "Pending",
  }
];

export const getBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const res = await api.get(`/api/players/${userId}/bookings`);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return userBookings.filter((b) => b.userId === userId);
  }
};

export const postBooking = async (payload: {
  userId: string;
  slotId: string;
  courtId: string;
  courtName: string;
  arenaId: string;
  arenaName: string;
  sport: string;
  startTime: string;
  endTime: string;
  date: string;
  amountPaid: number;
}): Promise<Booking> => {
  try {
    const res = await api.post("/api/bookings", payload);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newBooking: Booking = {
      id: `bkg_${Math.floor(Math.random() * 90000) + 10000}`,
      ...payload,
      status: "Confirmed",
    };
    userBookings.unshift(newBooking);
    return newBooking;
  }
};

export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    await api.post(`/api/bookings/${bookingId}/cancel`);
    return true;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    userBookings = userBookings.map((b) =>
      b.id === bookingId ? { ...b, status: "Cancelled" as const } : b
    );
    return true;
  }
};
