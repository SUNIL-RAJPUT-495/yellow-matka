import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCalendarAlt, FaRegClock } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';

export const PassbookPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPassbook = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getUserPassbook
      });
      if (response.data.success) {
        setTransactions(response.data.passbook);
      }
    } catch (error) {
      console.error("Failed to fetch passbook:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassbook();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate("/")}
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm">
            WALLET TRANSACTIONS
          </h1>
        </div>
      </div>

      {/* Main Content Container (Responsive Grid) */}
      <div className='max-w-4xl mx-auto px-4 mt-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
          
          {/* Loader or Empty State */}
          {loading ? (
            <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center p-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading your transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaRegClock className="text-3xl text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">No Transactions Yet</h3>
              <p className="text-gray-500 text-sm text-center">You haven't made any deposits, withdrawals or played any games yet.</p>
            </div>
          ) : (
            transactions.map((txn) => {
              const isCredit = txn.type === "CREDIT";

            return (
              <div 
                key={txn.id} 
                // Dynamic border color: Credit ke liye Green, Debit ke liye Red
                className={`bg-white border-l-4 ${isCredit ? 'border-green-500' : 'border-red-500'} rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5`}
              >
                
                {/* Top Row: Type and Amount */}
                <div className="flex justify-between items-center mb-3">
                  <p className={`font-extrabold text-lg tracking-wider ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type}
                  </p>
                  <p className={`font-black text-xl ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount}
                  </p>
                </div>

                {/* Middle Row: Date, Time, Status Icons ke sath */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 font-medium mb-3">
                  
                  <div className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>{txn.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <FaRegClock className="text-gray-400" />
                    <span>{txn.time}</span>
                  </div>
                  
                  {/* Dynamic Status Badge */}
                  <span className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold tracking-wider ${
                    txn.status === "COMPLETED" 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {txn.status}
                  </span>

                </div>

                {/* Bottom Row: Description */}
                <p className='text-sm text-gray-500 font-semibold border-t border-gray-100 pt-2.5'>
                  {txn.description}
                </p>

              </div>
            );
          }))}

        </div>
      </div>

    </div>
  )
}