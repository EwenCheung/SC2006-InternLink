import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const { data } = await api.get("/auth/verify");
          setUser(data.user);
        } catch (error) {
          console.error("Authentication failed:", error);
          localStorage.removeItem("authToken");
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };
    
    checkAuthentication();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      localStorage.setItem("authToken", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      
      if (data.user.role === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else {
        navigate("/employer/dashboard");
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || "Registration failed"
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("authToken", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      
      if (data.user.role === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else {
        navigate("/employer/dashboard");
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || "Login failed"
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
