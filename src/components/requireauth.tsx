import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth: React.FC = () => {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

 

  return <Outlet />; // Allow access
};

export default RequireAuth;
export const RequireVerification:React.FC=()=>{
    const isVerified = localStorage.getItem("isVerified") === "true";
    if (!isVerified) {
        return <Navigate to="/verify-email" />;
      }
      return <Outlet />; // Allow access
}

export const RequireOrg:React.FC=()=>{
    const isVerified = localStorage.getItem("org") === "true";
    if (!isVerified) {
        return <Navigate to="/admin/settings" />;
      }
      return <Outlet />; // Allow access
}