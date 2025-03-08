import React, { createContext, useContext, useState } from "react";
import axios from "axios";


interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  verified: boolean;
  avatar_url: string;
  org:Boolean;
}

// Corrected type definition for response.data
interface ResponseData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  verified: boolean;
  avatar_url: string;
  org:Boolean;
}

interface AuthContextType {
  loggedIn: boolean;
  user: User | null;
  login: (fetchUserData: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("loggedIn") === "true";
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const apiUrl = import.meta.env.VITE_API_URL;
  const accessToken = localStorage.getItem("accessToken");

  const fetchUserDataFromServer = () => {
    axios
    .get<ResponseData>(`${apiUrl}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Attach token in the header
      },
    }) // Explicitly define response type
      .then((response) => {
        const userData: ResponseData = response.data; // Now TypeScript understands the type
        setUser(userData); // Update user state
        console.log(userData);
        localStorage.setItem("uid", userData.id);
        localStorage.setItem("firstName", userData.first_name);
        localStorage.setItem("lastName", userData.last_name);
        localStorage.setItem("username", userData.username);
        localStorage.setItem("isVerified", String(userData.verified));
        localStorage.setItem("Avatar", String(userData.avatar_url));
        
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const login = (fetchUserData: boolean) => {
    setLoggedIn(true);
    setUser(user);
    localStorage.setItem("loggedIn", "true");

    if (fetchUserData) {
      fetchUserDataFromServer();
    }
  };

  const logout = () => {
    axios
      .post(`${apiUrl}/auth/logout`, {}, { withCredentials: true }) // Send logout request
      .then(() => {
        setLoggedIn(false);
        setUser(null);

        // Clear local storage
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("uid");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("username");
        localStorage.removeItem("isVerified");
        localStorage.removeItem("Avatar");
        localStorage.removeItem("accessToken");
                localStorage.removeItem("refresh_token");
        
        window.location.reload();
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <AuthContext.Provider value={{ loggedIn, user, login, logout }}>
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