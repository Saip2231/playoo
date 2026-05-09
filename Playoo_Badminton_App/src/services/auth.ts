export const TOKEN_KEY = "playoo_token";
export const USER_KEY = "playoo_user";

export interface User {
  id: string;
  name: string;
  email: string;
  elo: number;
  avatarUrl: string;
  preferredSport: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  joinedDate: string;
}

export const defaultUser: User = {
  id: "usr_1001",
  name: "Alex Rover",
  email: "alex.rover@playoo.com",
  elo: 1540,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  preferredSport: "Badminton",
  skillLevel: "Advanced",
  joinedDate: "Jan 2026",
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;
  
  const savedUser = localStorage.getItem(USER_KEY);
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      return defaultUser;
    }
  }
  return defaultUser;
};

export const login = async (email: string, password?: string): Promise<{ token: string; user: User }> => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const token = "mock-jwt-token-xyz-12345";
  const user: User = {
    ...defaultUser,
    email: email || defaultUser.email,
    name: email ? email.split("@")[0].replace(".", " ") : defaultUser.name,
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  
  return { token, user };
};

export const signup = async (userData: Partial<User>): Promise<{ token: string; user: User }> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const token = "mock-jwt-token-xyz-12345";
  const user: User = {
    ...defaultUser,
    ...userData,
    id: `usr_${Math.floor(Math.random() * 9000) + 1000}`,
  } as User;
  
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  
  return { token, user };
};
