import { createContext, type ReactNode, useContext, useState, useEffect } from "react";
import { AuthService } from "../../Services/AuthServices";
import type { User } from "../../Types/User";
import type { Login } from "../../Types/Login";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean; 
  user: User | null;  
  login: (credentials: Login) => Promise<{ success: boolean; message: string }>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Initialize AuthService globally so the session is preserved across renders
const authService = new AuthService();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  const checkSession = async () => {
    try {
      const response = await authService.getMe(); 
      
      if (response.isAuthenticated) {
        setIsAuthenticated(true);
        const profileResponse = await authService.getMyProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (credentials: Login) => {
    const res = await authService.login(credentials);
    if (res.success) {
      // Re-fetch session data to populate user state
      await checkSession();
    }
    return { success: res.success, message: res.message };
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Gagal melakukan logout", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {isLoading ? <div>Loading Authentication...</div> : children}
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