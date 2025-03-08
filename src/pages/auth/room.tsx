import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { User as UserIcon } from "lucide-react";
import { FiPaperclip, FiSend } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

interface Message {
  id: number;
  content: string;
  sender_id: number;
  attachments?: Attachment[];
  messageType: string;
}

interface Attachment {
  name: string;
  id: number;
  type: string;
  link: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

const Room: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [fileInput, setFileInput] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  

  const fetchMessages = async (beforeId?: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.get<{ messages: Message[] }>(
        `${apiUrl}/messages?room_id=${room_id}&limit=200${beforeId ? `&before_id=${beforeId}` : ""}`
      );
      const newMessages = response.data.messages;

      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    setMessages([]);
    setUsers({});

    const accessToken = localStorage.getItem("accessToken");
    const wsUrl = `${apiUrl.replace(/^http/, "ws")}/messages/${room_id}/socket?token=${accessToken}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log("Connected to WebSocket");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.users) {
          const userMap: Record<number, User> = {};
          data.users.forEach((user: User) => (userMap[user.id] = user));
          setUsers((prev) => ({ ...prev, ...userMap }));
        }

        if (data.messages) {
          const sortedMessages = data.messages.sort((a: { id: number }, b: { id: number }) => b.id - a.id);
          setMessages((prev) => [...sortedMessages, ...prev]);
        } else if (data.id) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === data.id)) return prev;
            return [data, ...prev];
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      socket.close();
    };
  }, [room_id]);

  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop } = messageListRef.current;
      const threshold = 100;

      if (scrollTop < threshold) {
        const firstMessage = messages[0];
        if (firstMessage) {
          fetchMessages(firstMessage.id);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileInput(e.target.files);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInput?.length) return;

    try {
      const formData = new FormData();
      formData.append("content", newMessage.trim());

      if (fileInput) {
        for (let i = 0; i < fileInput.length; i++) {
          formData.append("files", fileInput[i]);
        }
      }


      setNewMessage("");
      setFileInput(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Message List */}
      <div
        className="flex-1 overflow-y-auto p-4 pt-10 flex flex-col-reverse"
        onScroll={handleScroll}
        ref={messageListRef}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages in this conversation yet
          </div>
        ) : (
          messages.map((msg) => {
            const sender = users[msg.sender_id];
            const senderName = sender ? sender.name : "Unknown";
            const currentUserId = localStorage.getItem("uid");
            const isCurrentUser = String(msg.sender_id) === currentUserId;

            return (
              <div
                key={msg.id}
                className={`mb-4 max-w-[75%] flex flex-col ${
                  isCurrentUser ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Sender Name */}
                <div className="text-xs text-gray-400 mb-1">{senderName}</div>

                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    isCurrentUser ? " text-right flex-row-reverse" : " text-left"
                  }`}
                >
                  {/* Avatar/Icon */}
                  <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-gray-700">
                    {sender?.avatar?.trim() ? (
                      <img src={sender.avatar} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-full h-full p-1 text-gray-500" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <div className="mb-1">{msg.content}</div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((attachment) => (
                          <div key={attachment.id} className="text-blue-400 hover:underline">
                            {attachment.type === "image" ? (
                              <img
                                src={attachment.link}
                                alt={`attachment-${attachment.id}`}
                                className="max-w-xs mt-2 rounded-lg shadow-md"
                              />
                            ) : (
                              <a href={attachment.link} target="_blank" rel="noopener noreferrer">
                                {attachment.name || "Download File"}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-2 border-t border-gray-700 flex items-center space-x-4">
       {/* Attachment Button (shows above input) */}
  <label
    htmlFor="fileInput"
    className="p-2 text-gray-400 cursor-pointer relative group"
  >
    <FiPaperclip size={20} />
    
    {/* Attachment Count */}
    {fileInput && fileInput.length > 0 && (
      <div className="absolute top-0 right-0 text-xs text-white bg-blue-500 rounded-full px-1">
        {fileInput.length}
      </div>
    )}
    
    {fileInput && fileInput.length > 0 && (
      <div className="absolute bottom-full mb-2 left-0 bg-gray-800 p-2 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity w-auto">
        <ul>
          {Array.from(fileInput).map((file, idx) => (
            <li key={idx} className="truncate">{file.name}</li>
          ))}
        </ul>
      </div>
    )}
  </label>

  <input
    type="file"
    multiple
    id="fileInput"
    ref={fileInputRef}
    onChange={handleFileChange}
    className="hidden"
  />

        <input
          type="text"
          className="flex-1 p-2 rounded-full bg-gray-800 text-white outline-none placeholder-gray-500"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white flex items-center"
        >
          <FiSend size={20} className="mr-2" />
          Send
        </button>
      </div>
    </div>
  );
};

export default Room;
