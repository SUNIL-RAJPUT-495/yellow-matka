import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../../utils/axios';
import SummaryApi from '../../../common/SummerAPI';
import CartSummary from './CartSummary';
import BottomActionBar from './BottomActionBar';

const OddEvenGame = ({ id, gameType, balance, setStep }) => {
  const [session, setSession] = useState('Open');
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ""));

  const handleAddBid = () => {
    if (betNumber === '') return toast.error('Please select Odd/Even');
    if (amount === '' || parseInt(amount) < 10) return toast('Minimum points is ₹10');

    const newBid = { 
      id: Date.now(), 
      session, 
      digit: betNumber, 
      points: parseFloat(amount),
      totalPoints: parseFloat(amount) * 5,
      multiplier: 5 
    };

    setBids([...bids, newBid]);
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
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 mb-4 border border-gray-100">
        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Session</label>
        <div className="relative mb-5">
          <select value={session} onChange={(e) => setSession(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl appearance-none outline-none font-bold focus:ring-2 focus:ring-[#380e4b]/20 transition-all">
            <option value="Open">Open</option><option value="Close">Close</option>
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
        </div>
        
        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">Choose Parity</label>
        <div className="flex gap-4 mb-6">
          {['Odd', 'Even'].map(parity => (
            <label key={parity} className="flex-1 cursor-pointer group">
              <input type="radio" className="peer sr-only" checked={betNumber === parity} onChange={() => setBetNumber(parity)} />
              <div className="flex items-center justify-center gap-3 bg-gray-50 border-2 border-gray-200 py-4 px-5 rounded-xl font-black text-gray-500 peer-checked:border-[#380e4b] peer-checked:bg-purple-50 peer-checked:text-[#380e4b] transition-all">
                <div className={`w-5 h-5 rounded-full border-[4px] flex items-center justify-center transition-all ${betNumber === parity ? 'border-[#380e4b]' : 'border-gray-300'}`}>
                  {betNumber === parity && <div className="w-2 h-2 rounded-full bg-[#380e4b]"></div>}
                </div> {parity}
              </div>
            </label>
          ))}
        </div>
        
        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">Points & Add</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
             <input type="text" inputMode="numeric" placeholder="Min: 10" value={amount} onChange={handleAmountChange} className="w-full bg-gray-50 border border-gray-200 p-4 pl-8 rounded-xl outline-none font-bold focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
          </div>
          <button onClick={handleAddBid} className="bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white font-black px-8 rounded-xl active:scale-95 shadow-md uppercase tracking-wider">Add</button>
        </div>
      </div>

      <CartSummary 
        bids={bids} 
        handleRemoveBid={handleRemoveBid} 
        title="Your Bets" 
        emptyText="No bets added yet."
        prefix="Parity: "
      />

      <BottomActionBar 
        displayTotalPoints={totalCartPoints} 
        displayTotalBids={totalCartBids} 
        handleClear={() => setBids([])} 
        handleSubmit={handleSubmitCartOrGrid} 
        loading={loading} 
        showClearBtn={false} 
      />
    </div>
  );
};

export default OddEvenGame;
