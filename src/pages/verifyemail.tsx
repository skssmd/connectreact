import React from "react";
import axios from "axios";

const VerifyEmail: React.FC = () => {
  const handleResendEmail = () => 
    {const apiUrl = import.meta.env.VITE_API_URL;
    axios.post(`${apiUrl}/auth/verify-email`, { 
      
    })
    .then(() => alert("Verification email sent!"))
    .catch(() => alert("Error sending verification email."));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Email Not Verified</h2>
        <p className="text-gray-700 mb-4">
          Please check your email inbox and verify your email before continuing.
        </p>
        <button
          onClick={handleResendEmail}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
