
import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  import type { ReactNode } from "react";
  import { apiRequest } from "../api/client";
  import type { CurrentUser } from "../types/auth";
  
  interface AuthContextType {
    user: CurrentUser | null;
    loading: boolean;
    setUser: (user: CurrentUser | null) => void;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(
    undefined
  );
  
  export function AuthProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      let active = true;
  
      async function loadUser() {
        try {
          const currentUser = await apiRequest<CurrentUser>(
            "/auth/me"
          );
  
          if (active) setUser(currentUser);
        } catch {
          if (active) setUser(null);
        } finally {
          if (active) setLoading(false);
        }
      }
  
      void loadUser();
  
      return () => {
        active = false;
      };
    }, []);
  
    return (
      <AuthContext.Provider value={{ user, loading, setUser }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider"
      );
    }
  
    return context;
  }
  