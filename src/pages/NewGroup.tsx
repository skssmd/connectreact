import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

const NewGroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'public' | 'group'>('group');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [, setIsSearching] = useState<boolean | null>(null);
  let searchTimeout: NodeJS.Timeout;

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
      const response = await axios.get<{ users: User[] }>(
        `${apiUrl}/users/search?q=${query}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRecipient = (user: User) => {
    if (!recipients.includes(user.email)) {
      setRecipients((prev) => [...prev, user.email]);
    }
    setSearchQuery('');
    setUsers([]);
  };

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    if (email && !recipients.includes(email)) {
      setRecipients((prev) => [...prev, email]);
    }
  };

  const createGroup = async () => {
        try {
      const response = await axios.post<{ room: { ID: number } }>(
        `${apiUrl}/messages/rooms/create`,
        { room_type: groupType, recipient_emails: recipients },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );

      navigate(`/${response.data.room.ID}`);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 flex flex-col space-y-3">
      <input
        type="text"
        className="p-2 rounded-md bg-gray-800 text-white outline-none placeholder-gray-500"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      
      <select
        className="p-2 rounded-md bg-gray-800 text-white outline-none"
        value={groupType}
        onChange={(e) => setGroupType(e.target.value as 'public' | 'group')}
      >
        <option value="group">Private</option>
        <option value="public">Public</option>
      </select>

      {groupType === 'group' && (
        <div className="space-y-2">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center"
            onClick={() => setSearchQuery('')}
          >
            <FiPlus size={16} className="mr-2" /> Add Recipient
          </button>

          <input
            type="text"
            className="p-2 rounded-md bg-gray-800 text-white outline-none placeholder-gray-500"
            placeholder="Search recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {users.length > 0 && (
            <div className="bg-gray-900 p-2 rounded-md">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-2 cursor-pointer hover:bg-gray-800"
                  onClick={() => handleAddRecipient(user)}
                >
                  {user.username} ({user.email})
                </div>
              ))}
            </div>
          )}

          <input
            type="email"
            className="p-2 rounded-md bg-gray-800 text-white outline-none placeholder-gray-500"
            placeholder="Enter recipient email..."
            onBlur={handleEmailInput}
          />

          <div className="text-white text-sm">
            {recipients.map((email, index) => (
              <div key={index} className="p-1 bg-gray-700 rounded-md inline-block m-1">
                {email}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={createGroup}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white flex items-center"
      >
        <FiSend size={20} className="mr-2" /> Create Group
      </button>
    </div>
  );
};

export default NewGroup;