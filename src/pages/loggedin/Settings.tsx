import { useAuth } from "../../components/authcontext";
import { useState, useEffect } from "react";
import axios from "axios";

interface UserFormData {
  username: string;
  first_name: string;
  last_name: string;
  avatar: File | null;
  avatarPreview: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { logout} = useAuth(); // Get the logout function and user from useAuth context
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    first_name: "",
    last_name: "",
    avatar: null,
    avatarPreview: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/user/update`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      .then(response => {
        const data = response.data as { username: string; first_name: string; last_name: string; avatar_url?: string };
        setFormData({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: null,
          avatarPreview: data.avatar_url || "",
        });
      })
      .catch(error => console.error("Error fetching user data:", error));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file, avatarPreview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar);
    }

    try {
      const response = await axios.post(`${apiUrl}/user/update`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = response.data as { user: { avatar_url: string } };
      alert("Profile updated successfully");
      setFormData(prev => ({ ...prev, avatarPreview: data.user.avatar_url }));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-xl text-gray-600">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Settings</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input type="text" name="username" value={formData.username} onChange={handleChange} className="border p-2 rounded" placeholder="Username" />
        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="border p-2 rounded" placeholder="First Name" />
        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="border p-2 rounded" placeholder="Last Name" />
        <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="border p-2 rounded" />
        {formData.avatarPreview && <img src={formData.avatarPreview} alt="Avatar Preview" className="w-20 h-20 rounded-full" />}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
      </form>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};

export default Settings;