import React, { useState, useEffect } from "react";
import { useAuth } from "../components/authcontext";
import { Link } from "react-router-dom";
import logo from "../assets/p.png";
import {  User } from "lucide-react";

const TopNav: React.FC = () => {
  const { loggedIn, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }>({ firstName: "", lastName: "", avatarUrl: null });

  // Fetch user data from localStorage on mount
  useEffect(() => {
    const avatar = localStorage.getItem("Avatar") || null;
    
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    console.log(avatar)
    if (firstName && lastName) {
      setUserData({ firstName, lastName, avatarUrl: avatar });
      console.log(userData.avatarUrl)
    }
  }, [loggedIn]); // Update when login state changes

  const toggleUserMenu = () => setShowUserMenu((prev) => !prev);

  return (
    <nav className="ash text-black flex justify-between items-center px-[3%] py-1 w-[100%] shadow-md ">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo" className="h-10 cursor-pointer" />
      </div>

      {loggedIn ? (
        <>
          <div className="flex-grow flex justify-center">
            <input
              type="text"
              placeholder="Search Staff"
              className="custom-input px-5 py-1 rounded-2xl ash text-gray-950 border border-gray-50 focus:outline-none w-75"
            />
          </div>

          <div className="flex items-center space-x-6 ml-6">
            {/* User Icon and Avatar */}
            <div className="relative">
              <div className="flex items-center cursor-pointer" onClick={toggleUserMenu}>
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-2xl" />
                )}
                <div className="font-semibold ml-2 select-none">
                  {userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : "User"}
                </div>
              </div>

              {/* Ensure dropdown is positioned correctly */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-4 w-40 bg-white text-black rounded-md shadow-lg z-50">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-grow flex justify-end space-x-10">
          <Link to="/" className="hover:text-emerald-900 font-semibold">Home</Link>
          <Link to="/login" className="hover:text-indigo-600 font-semibold">Login</Link>
          <Link to="/signup" className="hover:text-indigo-600 font-semibold">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default TopNav;
