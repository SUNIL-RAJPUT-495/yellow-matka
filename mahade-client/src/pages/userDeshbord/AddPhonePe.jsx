import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';
import { useFetchProfile } from '../../hooks/useFetchProfile';

export const AddPhonePe = () => {
  const navigate = useNavigate();
  const fetchProfile = useFetchProfile();
  const { userData } = useSelector((state) => state.user);
  
  const [phonePeUpiId, setPhonePeUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData?.paymentInfo?.phonePeUpiId) {
      setPhonePeUpiId(userData.paymentInfo.phonePeUpiId);
    }
  }, [userData]);

  const handleSubmit = async () => {
    if (!phonePeUpiId) {
      return toast.error("Please enter a valid PhonePe UPI ID");
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios({
        url: SummaryApi.updatePaymentInfo.url,
        method: SummaryApi.updatePaymentInfo.method,
        data: { phonePeUpiId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("PhonePe details updated successfully!");
        fetchProfile(); // Refresh Redux state
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update PhonePe details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div onClick={() => navigate(-1)} className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'>
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">Add PhonePe</h1>
        </div>
      </div>

      <div className='max-w-md mx-auto px-4 mt-8'>
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-purple-500'>
          <h2 className='text-lg font-bold text-gray-800 mb-6 border-b pb-2'>PhonePe Details</h2>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>PhonePe UPI ID</label>
              <input 
                type="text" 
                value={phonePeUpiId}
                onChange={(e) => setPhonePeUpiId(e.target.value)}
                placeholder="e.g. 9876543210@ybl" 
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-all' 
              />
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-4 uppercase tracking-wider'
            >
              {isSubmitting ? 'Linking...' : 'Link PhonePe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};