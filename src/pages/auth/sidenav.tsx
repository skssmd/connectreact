import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation

import {  MessagesSquareIcon, SettingsIcon,  UserIcon,  UsersIcon } from "lucide-react";

// Define the interface for a chat room.
interface ChatRoom {
  room_id: number;
  name: string;
  last_message: string;
  last_message_id?: number;
  seen?: boolean;
  avatar?: string; // Avatar URL
  type?: "oneone" | "group" | "public";
}

// Define the interface for a room update message.
interface RoomUpdate {
  event: "room_update";
  room_id: number;
  name: string;
  last_message: string;
  last_message_id?: number;
  seen?: boolean;
  avatar?: string;
  type?: "oneone" | "group" | "public";
}

const SideNav: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("accesstoken",accessToken)
    const ws = new WebSocket(`${apiUrl}/messages/rooms/socket?token=${accessToken}`);

    ws.onopen = () => console.log("WebSocket connection established");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket data:", data);

        if (Array.isArray(data)) {
          setRooms(
            data.sort((a, b) =>
              (b.last_message_id || 0) - (a.last_message_id || 0) || b.room_id - a.room_id
            )
          );
        } else if (data && typeof data === "object" && data.event === "room_update") {
          const update = data as RoomUpdate;
          console.log("Room update received:", update);

          setRooms((prevRooms) => {
            let updatedRooms = prevRooms.map((room) =>
              room.room_id === update.room_id ? { ...room, ...update } : room
            );

            if (!updatedRooms.some((room) => room.room_id === update.room_id)) {
              updatedRooms.push(update);
            }

            return [...updatedRooms].sort((a, b) =>
              (b.last_message_id || 0) - (a.last_message_id || 0) || b.room_id - a.room_id
            );
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket connection closed");

    return () => {
      ws.close();
    };
  }, []);

  const truncate = (text: string, maxLength: number = 50): string =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const getRoomIcon = (room: ChatRoom) => {
    if (room.avatar) {
      return <img src={room.avatar} alt={room.name} className="w-10 h-10 rounded-full" />;
    }

    switch (room.type) {
      case "oneone":
    return <UserIcon className="w-8 h-8 p-1 text-gray-500" />;
  case "group":
    return <UsersIcon className="w-8 h-8 p-1 text-gray-500" />;
  case "public":
    return <MessagesSquareIcon className="w-8 h-8 p-1 text-gray-500" />;
  default:
    return <UserIcon className="w-8 h-8 p-1 text-gray-500" />;
    }
  };

  return (
    <div className=" p-4 pt-0 flex flex-col h-screen ">
       <div className="py-3 flex space-x-2">
  <button
    className="px-4 py-1 border border-gray-500 rounded-full text-sm text-gray-500 hover:bg-gray-100"
    onClick={() => navigate("/new-message")}
  >
    New Conversation
  </button>
  <button
    className="px-4 py-1 border border-gray-500 rounded-full text-sm text-gray-500 hover:bg-gray-100"
    onClick={() => navigate("/new-group")}
  >
    New Group
  </button>
  <button
    className="p-2 border border-gray-500 rounded-full text-gray-500 hover:bg-gray-100"
    onClick={() => navigate("/settings")}
  >
    <SettingsIcon className="w-5 h-5" />
  </button>
</div>

      <input
  type="text"
  placeholder="Search conversations..."
  className="w-full px-4 py-2 mb-2 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
/>

      <ul className="list-none p-0  flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <li
            key={room.room_id}
            className="flex items-center gap-3 border-b border-gray-600 py-3 cursor-pointer hover:bg-gray-700 px-2 transition"
            onClick={() => navigate(`/${room.room_id}`)} // Navigate on click
          >
            {getRoomIcon(room)}
            <div className="flex-1">
              <div className="font-semibold text-white">{room.name}</div>
              <div className="text-sm text-gray-400">{truncate(room.last_message)}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideNav;
