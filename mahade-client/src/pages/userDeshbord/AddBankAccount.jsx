import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';
import { useFetchProfile } from '../../hooks/useFetchProfile';

export const AddBankAccount = () => {
  const navigate = useNavigate();
  const fetchProfile = useFetchProfile();
  const { userData } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({ 
    accountHolderName: '', 
    accountNumber: '', 
    ifscCode: '', 
    bankName: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData?.paymentInfo) {
      setFormData({
        accountHolderName: userData.paymentInfo.accountHolderName || '',
        accountNumber: userData.paymentInfo.accountNumber || '',
        ifscCode: userData.paymentInfo.ifscCode || '',
        bankName: userData.paymentInfo.bankName || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
      return toast.error("Please fill all the bank details");
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('yellow_matka');
      const res = await axios({
        url: SummaryApi.updatePaymentInfo.url,
        method: SummaryApi.updatePaymentInfo.method,
        data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Bank details updated successfully!");
        fetchProfile(); // Refresh Redux state
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* Header */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div onClick={() => navigate(-1)} className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'>
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">Add Bank Details</h1>
        </div>
      </div>

      {/* Form Area */}
      <div className='max-w-md mx-auto px-4 mt-8'>
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
          <h2 className='text-lg font-bold text-gray-800 mb-6 border-b pb-2'>Bank Information</h2>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>Account Holder Name</label>
              <input 
                type="text" 
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Enter name as per bank" 
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all' 
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>Account Number</label>
              <input 
                type="number" 
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter 9-18 digit account number" 
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all' 
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>IFSC Code</label>
              <input 
                type="text" 
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234" 
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all uppercase' 
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-600 mb-1'>Bank Name</label>
              <input 
                type="text" 
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India" 
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all' 
              />
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-4 uppercase tracking-wider'
            >
              {isSubmitting ? 'Saving...' : 'Save Bank Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};