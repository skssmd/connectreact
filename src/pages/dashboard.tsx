import { useParams, Route, Routes  } from "react-router-dom";
import SideNav from "./auth/sidenav";
import NewMessage from "./NewMessage";
import NewGroup from "./NewGroup";
import Settings from "./loggedin/Settings";
import Room from "./auth/room";


export default function Dashboard() {
  const { room_id } = useParams<{ room_id: string }>(); // Get room_id from URL

  return (
    <div className="flex h-screen ">
      {/* Left Panel (Buttons + SideNav) */}
      <div className="w-1/4 border-r border-gray-900 ">
    {/* Top Buttons */}
   

    {/* Side Navigation */}
    <div className="flex-1">
      <SideNav />
    </div>
  </div>

      {/* Right Panel (Routes) */}
      <div className="w-3/4">
        <Routes>
          {/* If a room is selected, show it */}
          {room_id && <Route path=":room_id" element={<Room />} />}

          {/* Other views */}
          <Route path="new-message" element={<NewMessage />} />
          <Route path="new-group" element={<NewGroup />} />
          <Route path="settings" element={<Settings />} />

          {/* Default view when no route matches */}
          <Route path="*" element={<DefaultView />} />
        </Routes>
      </div>
    </div>
  );
}

const DefaultView = () => (
  <div className="flex items-center justify-center h-full text-gray-500">
    Select a chat to start messaging
  </div>
);
