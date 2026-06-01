import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';

const BidHistoryPage = () => {
  const [bids, setBids] = useState([]);
  const navigate = useNavigate();



  const featchBidHistory = async () => {
    try {
      const response = await Axios({
        url:SummaryApi.getUserBids.url,
        method:SummaryApi.getUserBids.method
      });
      if (response.data.bids) {
        setBids(response.data.bids);
      }
      console.log(response.data.bids);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    featchBidHistory();
  }, []);

  console.log(bids);
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate(-1)} 
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">
            BID HISTORY
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-4 md:mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bid History</h1>
          <p className="text-sm text-gray-500 mt-1">View all your recent game bids</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Bids Placed</p>
          <p className="text-2xl font-bold text-green-600">{bids.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Bidder</th>
              <th className="p-4 border-b">Game Type</th>
              <th className="p-4 border-b">Number</th>
              <th className="p-4 border-b">Bid Amount</th>
              <th className="p-4 border-b">Date & Time</th>
              <th className="p-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border-b flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {(bid.game_type || bid.market_id?.name || 'G').charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{bid.market_id?.name || bid.game_type}</span>
                </td>
                <td className="p-4 border-b font-semibold text-gray-800">
                  {bid.game_type}
                </td>
                <td className="p-4 border-b font-mono font-bold text-gray-800 tracking-widest">
                  {bid.status === 'Winner'
                    ? '*'.repeat(Math.max(1, String(bid.bet_number || '').length))
                    : (bid.bet_number ?? '—')}
                </td>
                <td className="p-4 border-b font-semibold text-gray-800">
                  ₹{bid.amount}
                </td>
                <td className="p-4 border-b text-gray-500 text-sm">
                  {formatDate(bid.createdAt)}
                </td>
                <td className="p-4 border-b">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bid.status === 'Winner'
                        ? 'bg-green-100 text-green-700'
                        : bid.status === 'Loser' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {bid.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {bids.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No bids have been placed yet. Be the first!
        </div>
      )}
    </div>
    </div>
  );
};

export default BidHistoryPage;