import React, { useEffect, useState } from "react";
import {  useSearchParams } from "react-router-dom";
import { useAuth } from "../../components/authcontext";

import axios from 'axios';

import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
type ErrorMessages = {
  [key: string]: string[]; // Allows dynamic indexing
};
interface LoginResponse {
  error?: string; // Could be "user not found" or "invalid credentials"
  access_token:string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ErrorMessages>({});
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
  const refreshToken = searchParams.get("refresh_token");
  console.log(refreshToken)
  if (!refreshToken) return; // If no token, exit early

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post<{ access_token: string }>(
        `${apiUrl}/auth/refresh-token`,
        {}, // No body needed
        {
          headers: {
            "Refresh-Token": refreshToken, // Send refresh token in the header
          },
          withCredentials: true, 
        }
      );

      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
        login(true); // Mark user as logged in

        // ✅ Remove query parameters without reloading the page
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // ✅ Avoid extra re-renders by using a timeout for navigation
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };

  refreshAccessToken();

// ✅ Run only once on mount (no dependencies)
}, []);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
  
    try {
      setLoading(true);
      
      const response = await axios.post<LoginResponse>(
        `${apiUrl}/auth/login`,
        { user, password },
        { withCredentials: true } // Ensure cookies are received
      );
  
      console.log(response);
      if (response.status === 200) {
       
        localStorage.setItem("accessToken", response.data.access_token);
        login(true);
        // Redirect to home on success
        window.location.href=("/")
      } else if (response.status === 400) {
        const errorMessage = response.data.error; // Extract error message
  
        // Check the specific error and display the corresponding error message
        if (errorMessage === "user not found") {
          setErrors({ user: ["User does not exist. Please check your username."] });
        } else if (errorMessage === "invalid credentials") {
          setErrors({ password: ["Incorrect password. Please try again."] });
        } else {
          setErrors({ global: ["Invalid login credentials"] });
        }
      }
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        
        const errorMessage = err.response.data?.error; // Extract error message safely
  
        if (errorMessage === "user not found") {
          setErrors({ user: ["User does not exist. Please check your username."] });
        } else if (errorMessage === "invalid credentials") {
          setErrors({ password: ["Incorrect password. Please try again."] });
        } else {
          setErrors({ global: ["Invalid login credentials"] });
        }
      } else {
        setErrors({ global: ["Login failed. Please try again."] });
      }
    }
     finally {
      setLoading(false);
    }
  };
  
  // Function to render errors dynamically
  const renderErrors = (field: string) =>
    errors[field]?.map((error, index) => (
      <p key={index} className="text-red-500 text-sm">
        {error}
      </p>
    ));
  
  
      
  return (
    <div className="max-w-md mx-auto mt-30 px-4">

     

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 border border-cyan-900 p-8 rounded-lg shadow-md relative"
      >  <h2 className="text-3xl font-bold text-center mb-2 text-gray-300">Login</h2>
        
          {/* Email or Username Field */}
          <div className="relative mb-5">
            <label className="block text-gray-300" htmlFor="user">
              Email or Username
            </label>
            <input
              type="text"
              name="user"
              id="user"
              value={user}
              placeholder="Enter your email or username"
              required
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-900 text-white border-gray-600"
            />
            <div className="absolute left-0 top-full mt-.5 h-6">{renderErrors("user")}</div>
          </div>

          {/* Password Field */}
          <div className="relative mb-5">
            <label className="block text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-900 text-white border-gray-600"
            />
            <div className="absolute left-0 top-full mt-.5 h-6">{renderErrors("password")}</div>
          </div>
       

        {/* Display Global Errors */}
        {errors.global && (
          <div className="text-red-500 text-sm text-center mt-2">{renderErrors("global")}</div>
        )}

        {/* Submit Button */}
         
       

<button
  type="submit"
  className="w-full px-4 py-2 mt-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  {loading ? "Logging in..." : "Log in"}
</button>
<div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-700"
          >
            <FcGoogle size={20} />
            Log in with Google
          </button>
        </div>
        <div className="flex justify-end mt-4">
          <p className="text-gray-400">Don't have an account?</p>
          <Link to="/signup" className="text-indigo-500 underline pl-2">
            Register Now!
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
