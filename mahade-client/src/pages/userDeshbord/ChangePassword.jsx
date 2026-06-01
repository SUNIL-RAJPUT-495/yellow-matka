import React, { useState } from 'react';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios'; // Changed 'axios' to '../../utils/axios' for correct API config
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Ek chota reusable component taake input fields baar baar na likhne pade
const PasswordInput = ({ label, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-6 relative">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 pr-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2f0c4c] transition-all shadow-sm"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2f0c4c] focus:outline-none transition-colors"
        >
          {showPassword ? (
            // Eye Open Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            // Eye Closed Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (!userData?._id) {
      setError("User information not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: `${SummaryApi.changePassword.url}/${userData._id}`,
        method: SummaryApi.changePassword.method,
        data: formData
      });
      setMessage(res.data.message || 'Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 font-sans pb-10">
      
      {/* Header Section */}
      <div className="bg-[#2f0c4c] text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-10">
        <button className="bg-white text-[#2f0c4c] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-4 tracking-wide">Change Password</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        
        {/* Account Security Banner (Top Card) */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6 flex flex-col items-center text-center border-l-8 border-[#2f0c4c]">
          <div className="text-[#2f0c4c] mb-3">
            {/* Shield Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-1">Account Security</h2>
          <p className="text-gray-500 text-sm">Secure your account with a strong password</p>
        </div>

        {/* Input Form (Bottom Card) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <PasswordInput 
              label="Current Password" 
              placeholder="Enter current password" 
              value={formData.currentPassword}
              onChange={(e) => handleChange(e, 'currentPassword')}
            />

            <PasswordInput 
              label="New Password" 
              placeholder="Enter new password" 
              value={formData.newPassword}
              onChange={(e) => handleChange(e, 'newPassword')}
            />

            <PasswordInput 
              label="Confirm Password" 
              placeholder="Confirm new password" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
            />

            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-2 font-bold py-3.5 rounded-lg transition-colors shadow-md ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#2f0c4c] text-white hover:bg-[#3e1363]'}`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePassword;