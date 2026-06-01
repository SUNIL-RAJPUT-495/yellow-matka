import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../../utils/axios';
import SummaryApi from '../../../common/SummerAPI';
import { getSPMotorCount, getDPMotorCount, getGameConfig, validateMatkaRules } from './gameUtils';
import CartSummary from './CartSummary';
import BottomActionBar from './BottomActionBar';

const MotorGame = ({ id, gameType, balance, setStep }) => {
  const [session, setSession] = useState('Open');
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const { maxLength, exact } = getGameConfig(gameType);

  const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ""));
  const handleBetNumberChange = (e) => setBetNumber(e.target.value.replace(/\D/g, ""));

  const handleAddBid = () => {
    if (betNumber === '') return toast.error('Please enter number');
    if (!validateMatkaRules(gameType, betNumber, exact, toast)) return;
    if (amount === '' || parseInt(amount) < 10) return toast('Minimum points is ₹10');

    let multiplier = 1;
    if (gameType === 'SPMotor') multiplier = getSPMotorCount(betNumber);
    else if (gameType === 'DPMotor') multiplier = getDPMotorCount(betNumber);

    if (multiplier === 0) return toast.error('Invalid Motor digits. Please enter distinct valid digits.');

    const newBid = { 
      id: Date.now(), 
      session, 
      digit: betNumber, 
      points: parseFloat(amount),
      totalPoints: parseFloat(amount) * multiplier,
      multiplier 
    };

    setBids([...bids, newBid]);
    setBetNumber('');
    setAmount('');
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
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 border border-gray-100">
        <div className="mb-5">
          <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Session</label>
          <div className="relative">
            <select value={session} onChange={(e) => setSession(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl appearance-none outline-none font-bold focus:ring-2 focus:ring-[#380e4b]/20 transition-all">
              <option value="Open">Open</option><option value="Close">Close</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>
        </div>
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider">Base Digits</label>
            <span className="text-[10px] bg-purple-100 text-[#380e4b] font-bold px-2 py-1 rounded-md">Min 4 digits</span>
          </div>
          <input type="text" inputMode="numeric" placeholder="e.g. 1468" value={betNumber} onChange={handleBetNumberChange} maxLength={maxLength} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none font-bold tracking-[0.2em] focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
        </div>
        <div className="mb-6">
          <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Points (₹)</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
             <input type="text" inputMode="numeric" placeholder="Min: 10" value={amount} onChange={handleAmountChange} className="w-full bg-gray-50 border border-gray-200 p-4 pl-10 rounded-xl outline-none font-bold focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
          </div>
        </div>
        <button onClick={handleAddBid} className="w-full bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white font-black py-4 rounded-xl active:scale-95 transition-transform shadow-md uppercase tracking-wide">Generate Motor Bets</button>
      </div>

      <CartSummary 
        bids={bids} 
        handleRemoveBid={handleRemoveBid} 
        title="Added Motors" 
        emptyText="No motors added yet."
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

export default MotorGame;
