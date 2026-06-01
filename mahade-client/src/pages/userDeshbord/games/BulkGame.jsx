import React, { useState, useMemo } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../../utils/axios';
import SummaryApi from '../../../common/SummerAPI';
import { generateSinglePannas } from './gameUtils';
import CartSummary from './CartSummary';
import BottomActionBar from './BottomActionBar';

const BulkGame = ({ id, gameType, balance, setStep }) => {
  const [session, setSession] = useState('Open');
  const [amount, setAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const singlePannaGroups = useMemo(() => generateSinglePannas(), []);

  const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ""));

  const handleBulkDigitClick = (num) => {
    if (!amount || parseInt(amount) < 10) return toast.error('Please enter minimum 10 points first.');
    
    let generatedBids = [];
    const baseDigit = String(num);

    if (gameType === 'JodiBulk') {
      for (let i = 0; i <= 9; i++) {
        generatedBids.push({
          id: Date.now() + Math.random(),
          session: 'Full', 
          digit: baseDigit + String(i),
          points: parseFloat(amount),
          totalPoints: parseFloat(amount),
          multiplier: 1
        });
      }
    } 
    else if (gameType === 'SinglePannaBulk') {
      const pannasForDigit = singlePannaGroups[baseDigit] || [];
      pannasForDigit.forEach(pana => {
        generatedBids.push({
          id: Date.now() + Math.random(),
          session,
          digit: pana,
          points: parseFloat(amount),
          totalPoints: parseFloat(amount),
          multiplier: 1
        });
      });
    }
    else if (gameType === 'DoublePannaBulk') {
      toast("Double Panna Bulk generation logic is pending.");
      return;
    }
    else {
      generatedBids.push({
        id: Date.now() + Math.random(),
        session,
        digit: baseDigit,
        points: parseFloat(amount),
        totalPoints: parseFloat(amount),
        multiplier: 1
      });
    }

    setBids([...bids, ...generatedBids]);
  };

  const handleRemoveBid = (idToRemove) => setBids(bids.filter(bid => bid.id !== idToRemove));

  const totalCartPoints = bids.reduce((acc, curr) => acc + (curr.totalPoints || curr.points), 0);
  const totalCartBids = bids.reduce((acc, curr) => acc + (curr.multiplier || 1), 0);

  const handleSubmitCartOrGrid = async () => {
    if (bids.length === 0) return;
    if (totalCartPoints > balance) return toast.error(`Insufficient balance! Your wallet balance is ₹${balance}.`);

    setLoading(true);
    try {
      const formattedData = {
        market_id: id,
        game_type: gameType, 
        total_amount: totalCartPoints,
        bids: bids.map(bid => ({
          session: bid.session,
          bet_number: String(bid.digit), 
          amount: bid.points
        }))
      };

      const response = await Axios({
        url: SummaryApi.placeBid.url,
        method: SummaryApi.placeBid.method,
        data: formattedData 
      });

      toast.success(response.data.message || "All bids placed successfully!");
      setBids([]); setStep(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place bids!");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-transparent -mx-4 -mt-8 p-4 min-h-screen">
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 mb-4 border border-gray-100">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Session</label>
            <div className="relative">
              <select value={session} onChange={(e) => setSession(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl appearance-none outline-none font-bold focus:ring-2 focus:ring-[#380e4b]/20 transition-all">
                <option value="Open">Open</option><option value="Close">Close</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Points</label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
               <input type="text" inputMode="numeric" value={amount} onChange={handleAmountChange} placeholder="Min: 10" className="w-full bg-gray-50 border border-gray-200 p-4 pl-8 rounded-xl outline-none font-bold focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
            </div>
          </div>
        </div>
        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">Tap to Add Bid</label>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
            <button key={num} onClick={() => handleBulkDigitClick(num)} className="bg-gradient-to-b from-[#380e4b] to-[#250932] text-white font-black py-4 rounded-xl text-xl active:scale-95 shadow-md hover:shadow-lg transition-all border border-purple-800">
              {num}
            </button>
          ))}
        </div>
      </div>

      <CartSummary 
        bids={bids} 
        handleRemoveBid={handleRemoveBid} 
        title="Added Bids" 
        emptyText="No bids added yet. Use the pad above."
        prefix="Num: "
      />

      <BottomActionBar 
        displayTotalPoints={totalCartPoints} 
        displayTotalBids={totalCartBids} 
        handleClear={() => setBids([])} 
        handleSubmit={handleSubmitCartOrGrid} 
        loading={loading} 
        showClearBtn={true} 
      />
    </div>
  );
};

export default BulkGame;
