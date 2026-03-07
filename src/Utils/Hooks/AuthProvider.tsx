import { createContext, type ReactNode, useContext, useState, useEffect } from "react";
import AxiosInstance from "../AxiosInstance";
import { getMe } from "../../Services/ProfileServices";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean; 
  user: User | null;  
  login: () => Promise<void>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  const checkSession = async () => {
    try {
      const response = await getMe(); 
      
      setIsAuthenticated(true);
      setUser(response.data); 
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

  const login = async () => {
    await checkSession(); 
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AxiosInstance.post("/api/logout");
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