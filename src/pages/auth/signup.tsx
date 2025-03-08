import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../components/authcontext';
import { FiUser } from 'react-icons/fi';
type ErrorMessages = {
  [key: string]: string[]; // Key-value pairs for each field and its error messages
};

interface CheckForDuplicate {
  username?: boolean;
  email?: boolean;
  [key: string]: boolean | undefined; // Add an index signature

}

const SignupPage: React.FC = () => {
   const { login } = useAuth();
  const navigate = useNavigate();
  const [validating, setValidating] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',

  });
  const [errors, setErrors] = useState<ErrorMessages>({});
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);


  // Handle changes for all input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  
    // Clear field-specific errors as user types (excluding confirmPassword)
    if (name !== 'confirmPassword' && errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: [] }));
    }
  
 
  
    // Check for duplicates (email/username) with debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout); // Clear previous timeout if the user is typing again
    }
  
    const newDebounceTimeout = setTimeout(() => {
      if (name === 'email' || name === 'username') {
        checkForDuplicate(
          name === 'email' ? value : formData.email,
          name === 'username' ? value : formData.username
        );
      }
    }, 2000); // 500ms debounce delay
  
    setDebounceTimeout(newDebounceTimeout);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    setFormData(prev => ({
      ...prev,
      avatar: file,
    }));
    console.log(avatar)
  };
  // Function to check for duplication of email/username
  const checkForDuplicate = async (email: string, username: string) => {
    if (!email && !username) return;
  
    const apiUrl = import.meta.env.VITE_API_URL;
  
    try {
      setValidating(true); // Show "Validating..." before request
      
  
      // Prepare the request body with email and username
      const requestBody = {
        email,
        username,
      };
      console.log(requestBody)
      // Send a POST request with the JSON body
      const response = await axios.post<CheckForDuplicate>(`${apiUrl}/auth/checkDuplicate`, requestBody);
  
      const data: CheckForDuplicate = response.data;
      console.log(data);
  
      const newErrors: ErrorMessages = { ...errors };
  
      // Remove old errors
      delete newErrors.email;
      delete newErrors.username;
  
      // Check if email or username is already taken
      if (data.email) {
        newErrors.email = ['This email is already taken.'];
      }
      if (data.username) {
        newErrors.username = ['This username is already taken.'];
      }
  
      setErrors(newErrors);
    } catch (error) {
      console.error(error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        global: ['Something went wrong. Please try again later.'],
      }));
    } finally {
      setTimeout(()=>setValidating(false),500) 
    }
  };
  
  

  // Password matching logic (confirm password)
  useEffect(() => {
    if (formData.password && formData.confirmPassword.length >= formData.password.length) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prevErrors => ({
          ...prevErrors,
          confirmPassword: ['Passwords do not match.'],
        }));
      } else {
        setErrors(prevErrors => {
          const { confirmPassword, ...rest } = prevErrors;
          return rest;
        });
      }
    } else {
      setErrors(prevErrors => {
        const { confirmPassword, ...rest } = prevErrors;
        return rest;
      });
    }
  }, [formData.password, formData.confirmPassword]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (errors.confirmPassword && errors.confirmPassword.length > 0) return;
  
    setErrors({});
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
  
    try {
      const formDataToSend = new FormData();
  
      // Append all form data except confirmPassword
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "confirmPassword" && value) {
          formDataToSend.append(key, value as string | Blob);
        }
      });
  
      const response = await axios.post(`${apiUrl}/auth/signup`, formDataToSend, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        login(true);
        navigate("/");
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        const errorFields = error.response.data.error;
        const newErrors: ErrorMessages = {};
  
        if (errorFields.includes("email")) newErrors.email = ["This email is already taken."];
        if (errorFields.includes("username")) newErrors.username = ["This username is already taken."];
        if (errorFields.includes("other")) newErrors.global = ["An unexpected error occurred."];
  
        setErrors(newErrors);
      } else {
        setErrors({ global: ["Something went wrong. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Helper function to render errors for each field
  const renderErrors = (field: string) =>
    errors[field]?.map((err, index) => (
      <p key={index} className="text-red-500 text-sm">
        {err}
      </p>
    ));

  // Returns input classes with conditional error styling
  const getInputClasses = (field: string) =>
    `w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] && errors[field].length > 0 ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-4xl mx-auto mt-20 px-4">
      

      {/* Global error messages */}
      {errors.global &&
        errors.global.map((err, index) => (
          <p key={index} className="text-red-500 text-center mb-4">
            {err}
          </p>
        ))}

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 border border-cyan-900 p-8 rounded-lg shadow-md relative"
      ><h2 className="text-3xl font-bold text-center mb-2 text-gray-300">Create an Account</h2>
      <div className="    flex gap-8">
      <div className="w-3/4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={getInputClasses('email')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('email')}
            </div>
          </div>

          {/* Username Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={getInputClasses('username')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('username')}
            </div>
          </div>

          {/* First Name Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="first_name">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className={getInputClasses('first_name')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('first_name')}
            </div>
          </div>

          {/* Last Name Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="last_name">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className={getInputClasses('last_name')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('last_name')}
            </div>
          </div>

          {/* Password Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={getInputClasses('password')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('password')}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative mb-2">
            <label className="block text-gray-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={getInputClasses('confirmPassword')}
            />
            <div className="absolute left-0 top-full mt-1 h-6">
              {renderErrors('confirmPassword')}
            </div>
          </div>
        </div>
        </div>
        <div className="w-1/4 flex flex-col items-center relative">
        <div
    className="relative w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-75"
    
  >
    {avatar ? (
      <img src={URL.createObjectURL(avatar)} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      <FiUser className="text-gray-400 text-6xl" />
    )}
    <input type="file" id="avatarInput" className="hidden" onChange={handleFileChange} />
    
    {/* Hover text for "Upload Image" or "Remove" */}
    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm">
      {avatar ? (
        <p className="text-sm cursor-pointer p-20 text-red-500" onClick={(e) => { e.stopPropagation(); setAvatar(null); }}>Remove Image</p>
      ) : (
        <p className="text-sm p-20 text-blue-500" onClick={() => document.getElementById("avatarInput")?.click()}>Upload Image</p>
      )}
    </div>
  </div>
  <p className="text-lg mt-4">{formData.first_name} {formData.last_name}</p>
      <p className="text-gray-400 text-sm">{formData.email}</p>
      
      {/* Action Buttons on the Right */}
      <div className="flex gap-2 mt-4 w-full absolute bottom-0">
        <button
  type="submit"
  className="w-full px-4 py-2 mt-5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
  disabled={!!errors.username || !!errors.email || !!errors.password}
> 
{loading ? 'Signing Up...' : validating ? 'Validating...' : 'Sign Up'}

</button></div></div></div>
<div className='flex justify-end '><a>Already have and account?</a> <Link to="/login" className='text-indigo-500 underline pl-5 '>Log in </Link></div>
      </form>
     
    </div>
  );
};

export default SignupPage;
