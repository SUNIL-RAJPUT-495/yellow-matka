import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaAward, FaHistory } from 'react-icons/fa';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';
import toast from 'react-hot-toast';

const GaliDesawarHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab type can be 'bid' (All Bids) or 'win' (Winning Bids)
  const defaultTab = searchParams.get('type') === 'win' ? 'win' : 'bid';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter keys for Gali Desawar games
  const gdGameTypes = ['Left Digit', 'Right Digit', 'Jodi Digit'];

  const fetchBidHistory = async () => {
    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.getGDUserBids.url,
        method: SummaryApi.getGDUserBids.method
      });
      if (response.data && response.data.bids) {
        setBids(response.data.bids);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast.error("Failed to load bid history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter bids based on active tab
  const displayedBids = bids.filter(bid => {
    if (activeTab === 'win') {
      return bid.status === 'Winner';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-[#fbc02d] text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate(-1)} 
            className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-black tracking-widest mt-1 drop-shadow-sm uppercase">
            GD HISTORY
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-4 md:mx-auto mt-6">
        
        {/* TABS FOR BID & WIN HISTORY */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-150 mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('bid')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all uppercase ${
              activeTab === 'bid'
                ? 'bg-[#fbc02d] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaHistory />
            BID HISTORY
          </button>
          <button
            onClick={() => setActiveTab('win')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all uppercase ${
              activeTab === 'win'
                ? 'bg-[#fbc02d] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaAward />
            WIN HISTORY
          </button>
        </div>

        {/* DETAILS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-800 uppercase">
                {activeTab === 'win' ? 'Gali Desawar Winners' : 'Gali Desawar Bids'}
              </h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                Recent Left, Right & Jodi bids
              </p>
            </div>
            <div className="text-left sm:text-right bg-gradient-to-r from-amber-50 to-transparent p-3 rounded-xl border-l-4 border-[#fbc02d]">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-wide">Total Records</p>
              <p className="text-xl font-black text-amber-950">{displayedBids.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
              <div className="animate-spin h-8 w-8 border-4 border-[#fbc02d] border-t-transparent rounded-full font-bold"></div>
              <p className="font-bold text-xs uppercase">Loading history records...</p>
            </div>
          ) : displayedBids.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-bold uppercase tracking-wider text-xs">
              No Gali Desawar {activeTab === 'win' ? 'winners' : 'bids'} found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-wider border-b border-gray-150">
                    <th className="p-4">Market</th>
                    <th className="p-4">Bid Type</th>
                    <th className="p-4 text-center">Played Digit</th>
                    <th className="p-4 text-center">Points</th>
                    <th className="p-4 text-center">Won Amount</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBids.map((bid) => (
                    <tr key={bid._id} className="hover:bg-amber-50/20 border-b border-gray-100 transition-colors">
                      <td className="p-4 font-black text-gray-800 uppercase flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-[#fbc02d] flex items-center justify-center font-black text-xs uppercase">
                          {bid.market_id?.name ? bid.market_id.name.charAt(0) : 'G'}
                        </div>
                        <span>{bid.market_id?.name || 'Gali Desawar'}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-600 uppercase text-xs">
                        {bid.game_type}
                      </td>
                      <td className="p-4 text-center font-black font-mono text-gray-800 text-base">
                        {bid.bet_number}
                      </td>
                      <td className="p-4 text-center font-extrabold text-gray-800">
                        ₹{bid.amount}
                      </td>
                      <td className={`p-4 text-center font-black ${bid.status === 'Winner' ? 'text-green-600' : 'text-gray-400'}`}>
                        {bid.status === 'Winner' ? `₹${bid.wonAmount}` : '—'}
                      </td>
                      <td className="p-4 text-gray-400 font-bold text-xs">
                        {formatDate(bid.createdAt)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                            bid.status === 'Winner'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : bid.status === 'Loser'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
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
          )}
        </div>

      </div>

    </div>
  );
};

export default GaliDesawarHistory;
