import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';
import { useFetchProfile } from '../../hooks/useFetchProfile';

export const AddPaytm = () => {
  const navigate = useNavigate();
  const fetchProfile = useFetchProfile();
  const { userData } = useSelector((state) => state.user);
  
  const [paytmNumber, setPaytmNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData?.paymentInfo?.paytmNumber) {
      setPaytmNumber(userData.paymentInfo.paytmNumber);
    }
  }, [userData]);

  const handleSubmit = async () => {
    if (!paytmNumber || paytmNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit Paytm mobile number");
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('yellow_matka');
      const res = await axios({
        url: SummaryApi.updatePaymentInfo.url,
        method: SummaryApi.updatePaymentInfo.method,
        data: { paytmNumber },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Paytm Number updated successfully!");
        fetchProfile(); // Refresh Redux state
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Paytm details");
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
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">Add Paytm</h1>
        </div>
      </div>

      <div className='max-w-md mx-auto px-4 mt-8'>
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-sky-500'>
          <h2 className='text-lg font-bold text-gray-800 mb-6 border-b pb-2'>Paytm Wallet / UPI</h2>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>Paytm Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 font-bold">+91</span>
                <input 
                  type="tel" 
                  maxLength="10" 
                  value={paytmNumber}
                  onChange={(e) => setPaytmNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10 digit number" 
                  className='w-full px-4 py-3 rounded-r-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-all' 
                />
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-4 uppercase tracking-wider'
            >
              {isSubmitting ? 'Linking...' : 'Link Paytm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};