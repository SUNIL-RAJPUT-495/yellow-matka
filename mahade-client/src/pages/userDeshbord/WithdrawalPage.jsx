import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUniversity, FaRupeeSign } from 'react-icons/fa';
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { SiPhonepe, SiGooglepay, SiPaytm } from "react-icons/si";
import { useSelector } from 'react-redux';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios'
import toast from 'react-hot-toast';;

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [minWithdrawal, setMinWithdrawal] = useState(500);

  const withdrawable = useSelector((state) => state.user.wallet?.realBalance ?? 0);

  useEffect(() => {
    const loadLimits = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getTransactionSettings.url,
          method: SummaryApi.getTransactionSettings.method,
        });
        if (res.data?.success && res.data?.data?.minWithdrawal != null) {
          setMinWithdrawal(Number(res.data.data.minWithdrawal) || 500);
        }
      } catch (e) {
        console.error('Transaction settings:', e);
      }
    };
    loadLimits();
  }, []);

  const blockInvalidChar = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    setAmount(value);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method!");
      return;
    }
    if (!accountDetails) {
      toast.error("Please enter your payment details!");
      return;
    }
    if (Number(amount) > withdrawable) {
      toast.error("Insufficient wallet balance!");
      return;
    }
    
    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.createWithdrawalRequest.url,
        method: SummaryApi.createWithdrawalRequest.method,
        data: {
          amount: Number(amount),
          method: paymentMethod,
          accountDetails: accountDetails,
          transactionId: `WID-${Date.now()}`
        }
      });
      toast.success(response.data.message || `Withdrawal request of ₹${amount} via ${paymentMethod} sent successfully!`);
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
    } catch (error) {
      console.error("Withdraw Error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit withdrawal request!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <div className="bg-[#210c2e] text-white p-4 flex items-center gap-3 shadow-md sticky top-0 z-40">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
        >
          <FaArrowLeft className="text-lg text-gray-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wide text-white">Withdrawal</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 mt-2">
        
        {/* WALLET BALANCE CARD */}
        <div className="bg-gradient-to-r from-[#380e4b] to-[#210c2e] text-white rounded-2xl p-6 mb-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium mb-1">Withdrawable (real balance)</p>
            <h2 className="text-3xl font-black flex items-center gap-1">
              <FaRupeeSign className="text-xl" /> {withdrawable}
            </h2>
          </div>
          <MdOutlineAccountBalanceWallet className="text-5xl opacity-80 text-gray-300" />
        </div>

        {/* WITHDRAWAL FORM */}
        <form onSubmit={handleWithdraw} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          
          {/* AMOUNT INPUT */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 text-sm">Enter Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaRupeeSign className="text-gray-400" />
              </div>
              <input 
                type="text" 
                inputMode="numeric"
                value={amount}
                onKeyDown={blockInvalidChar}
                onChange={handleAmountChange}
                placeholder="Enter amount to withdraw" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#380e4b] focus:bg-white transition-all font-bold text-gray-700 placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">* Minimum withdrawal amount is ₹{minWithdrawal}</p>
          </div>

          {/* PAYMENT METHODS */}
          <div className="mb-8">
            <label className="block text-gray-700 font-bold mb-3 text-sm">Select Payment Method</label>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* PhonePe */}
              <div 
                onClick={() => setPaymentMethod('PhonePe')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'PhonePe' ? 'border-[#380e4b] bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
              >
                <SiPhonepe className={`text-3xl mb-2 ${paymentMethod === 'PhonePe' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'PhonePe' ? 'text-purple-800' : 'text-gray-600'}`}>PhonePe</span>
              </div>

              {/* Google Pay */}
              <div 
                onClick={() => setPaymentMethod('GPay')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'GPay' ? 'border-[#380e4b] bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
              >
                <SiGooglepay className={`text-4xl mb-1 ${paymentMethod === 'GPay' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'GPay' ? 'text-purple-800' : 'text-gray-600'}`}>GPay</span>
              </div>

              {/* Paytm */}
              <div 
                onClick={() => setPaymentMethod('Paytm')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Paytm' ? 'border-[#380e4b] bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
              >
                <SiPaytm className={`text-4xl mb-1 ${paymentMethod === 'Paytm' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'Paytm' ? 'text-purple-800' : 'text-gray-600'}`}>Paytm</span>
              </div>

              {/* Bank Transfer */}
              <div 
                onClick={() => setPaymentMethod('Bank')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Bank' ? 'border-[#380e4b] bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
              >
                <FaUniversity className={`text-3xl mb-2 ${paymentMethod === 'Bank' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'Bank' ? 'text-purple-800' : 'text-gray-600'}`}>Bank Transfer</span>
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS INPUT (Conditional) */}
          {paymentMethod && (
            <div className="mb-8 animate-fadeIn">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                {paymentMethod === 'Bank' ? 'Enter Bank Account & IFSC Code' : `Enter ${paymentMethod} Number / UPI ID`}
              </label>
              <input 
                type="text" 
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={paymentMethod === 'Bank' ? "e.g. A/C 1234567890, IFSC: SBIN000123" : "e.g. 9876543210 or user@upi"} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#380e4b] focus:bg-white transition-all font-bold text-gray-700 placeholder-gray-400 shadow-inner"
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#380e4b] text-white font-black tracking-wider py-4 rounded-xl hover:bg-[#210c2e] hover:shadow-lg transition-all active:scale-95 uppercase text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Submit Request'}
          </button>

        </form>

      </div>
    </div>
  );
};

export default WithdrawalPage;