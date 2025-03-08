import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./auth/signup";
import Login from "./auth/Login";
import VerifyEmail from "./verifyemail";

import Dashboard from "./dashboard";
import Room from "./auth/room";
import NewMessage from "./NewMessage";
import NewGroup from "./NewGroup";
import Settings from "./loggedin/Settings";



const Home = () => {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  return (
    <Routes>
      {/* Dashboard Layout with SideNav */}
      <Route path="*" element={<Dashboard />}>
        <Route path=":room_id" element={<Room />} />
        <Route path="new-message" element={<NewMessage />} />
          <Route path="new-group" element={<NewGroup />} />
          <Route path="settings" element={<Settings />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Redirect based on login status */}
      <Route
        path="*"
        element={loggedIn ? <Navigate to="/" /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default Home;
