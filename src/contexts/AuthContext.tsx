import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: number;
  name: string;
  surname: string;
  role: "N" | "D" | "R";
  email?: string;
  contactNo?: string;
  sanc_hpcsa?: string; // ✅ MATCH BACKEND
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dunwell_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) return false;

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user.role === "N") {
        localStorage.setItem("dunwell_token", data.token);
        localStorage.setItem("dunwell_user", JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("AuthContext login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("dunwell_token");
    localStorage.removeItem("dunwell_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
