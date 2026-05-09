import api from "./api";
import { Review } from "../types";

// CouchDB inspired review document storage
let mockReviews: Review[] = [
  {
    id: "rev_301",
    arenaId: "arn_1",
    userId: "usr_505",
    userName: "Johnathan Smith",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    rating: 5,
    comment: "Absolutely top tier courts! The floodlights are super bright for late evening matches, and the locker rooms are very clean. Recommending the Grand Court for anyone who wants a professional tournament feel.",
    date: "2026-04-18",
    sportPlayed: "Tennis",
  },
  {
    id: "rev_302",
    arenaId: "arn_1",
    userId: "usr_506",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    rating: 4,
    comment: "Great location and plenty of courts. The cafe has great shakes for post-game recovery. The only thing is courts get booked super fast on weekends so you have to schedule early!",
    date: "2026-05-02",
    sportPlayed: "Tennis",
  },
  {
    id: "rev_303",
    arenaId: "arn_2",
    userId: "usr_507",
    userName: "David Cho",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    rating: 4,
    comment: "Perfect indoor air conditioning. Court mats are anti-slip and well-maintained. Friendly staff and good racquet rental prices.",
    date: "2026-05-04",
    sportPlayed: "Badminton",
  },
  {
    id: "rev_304",
    arenaId: "arn_3",
    userId: "usr_508",
    userName: "Bradley Cooper",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    rating: 5,
    comment: "This indoor hall is amazing! Full court size, shiny floor, electronic scoreboard makes you feel like an NBA player. Highly recommended.",
    date: "2026-04-29",
    sportPlayed: "Basketball",
  }
];

export const getReviews = async (arenaId: string): Promise<Review[]> => {
  try {
    const res = await api.get(`/api/reviews`, { params: { arenaId } });
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return mockReviews.filter((r) => r.arenaId === arenaId);
  }
};

export const postReview = async (payload: {
  arenaId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  sportPlayed: string;
}): Promise<Review> => {
  try {
    const res = await api.post(`/api/reviews`, payload);
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newReview: Review = {
      id: `rev_${Math.floor(Math.random() * 90000) + 10000}`,
      ...payload,
      date: new Date().toISOString().split("T")[0],
    };
    mockReviews.unshift(newReview);
    return newReview;
  }
};
