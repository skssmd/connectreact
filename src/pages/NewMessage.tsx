import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

const NewMessage: React.FC = () => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState<string>('');
  const [fileInput, setFileInput] = useState<FileList | null>(null);
  const [email, setEmail] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [, setSelectedUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  let searchTimeout: NodeJS.Timeout;
  const [isSearching, setIsSearching] = useState<boolean | null>(null);
  useEffect(() => {
    if (searchQuery.length >= 4) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => searchUsers(searchQuery), 1000);
    }
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await axios.get<{ users: User[] }>(`${apiUrl}/users/search?q=${query}`,  { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setIsSearching(false); // Indicate search is complete
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setUsers([]);
    setIsSearching(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileInput(e.target.files);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInput?.length) return;

    try {
      const roomResponse = await axios.post<{ room: { ID: number } }>(
        `${apiUrl}/messages/rooms/create`,
        { room_type: 'oneone', recipient_emails: [email] },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );

      const createdRoomId = roomResponse.data.room.ID;

      const formData = new FormData();
      formData.append('content', newMessage.trim());

      if (fileInput) {
        for (let i = 0; i < fileInput.length; i++) {
          formData.append('files', fileInput[i]);
        }
      }

      await axios.post(`${apiUrl}/messages/send/${createdRoomId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewMessage('');
      setFileInput(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      navigate(`/${createdRoomId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="p-2 border-t border-gray-700 flex flex-col space-y-2">
      <input
        type="text"
        className="p-2 rounded-full bg-gray-800 text-white outline-none placeholder-gray-500"
        placeholder="Search recipient..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {users.length > 0 ? (
        <div className="bg-gray-900 p-2 rounded-md">
          {users.map((user) => (
            <div key={user.id} className="p-2 cursor-pointer hover:bg-gray-800" onClick={() => handleUserSelect(user)}>
              {user.username} ({user.email})
            </div>
          ))}
        </div>
      ) : isSearching && searchQuery.length >= 4 ? (
        <div className="text-gray-400">No user found. You can enter an email manually.</div>
      ) : null}

      <input
        type="email"
        className="p-2 rounded-full bg-gray-800 text-white outline-none placeholder-gray-500"
        placeholder="Enter recipient email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input type="file" multiple id="fileInput" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <input
        type="text"
        className="p-2 rounded-full bg-gray-800 text-white outline-none placeholder-gray-500"
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
  );
};

export default NewMessage;
