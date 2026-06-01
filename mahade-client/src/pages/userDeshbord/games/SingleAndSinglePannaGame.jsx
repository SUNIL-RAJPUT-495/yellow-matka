import React, { useState, useMemo } from 'react';
import { FaChevronDown, FaLayerGroup } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../../utils/axios';
import SummaryApi from '../../../common/SummerAPI';
import { validateMatkaRules, getGameConfig, generateSinglePannas } from './gameUtils';
import CartSummary from './CartSummary';
import BottomActionBar from './BottomActionBar';

const SingleAndSinglePannaGame = ({ id, gameType, balance, setStep }) => {
  const [activeMode, setActiveMode] = useState('easy');
  const [session, setSession] = useState('Open');
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [gridBids, setGridBids] = useState({});
  const [loading, setLoading] = useState(false);

  const singlePannaGroups = useMemo(() => generateSinglePannas(), []);
  const { MathConfig } = getGameConfig(gameType);
  const { exact, maxLength, placeholder } = getGameConfig(gameType);

  const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ""));
  const handleBetNumberChange = (e) => setBetNumber(e.target.value.replace(/\D/g, ''));

  const handleGridInputChange = (pana, value) => {
    const val = value.replace(/\D/g, "");
    setGridBids(prev => {
      const newBids = { ...prev };
      if (val === "" || parseInt(val) === 0) delete newBids[pana];
      else newBids[pana] = parseInt(val);
      return newBids;
    });
  };

  const handleAddBid = () => {
    if (betNumber === '') return toast.error('Please enter number');
    if (!validateMatkaRules(gameType, betNumber, exact, toast)) return;
    if (amount === '' || parseInt(amount) < 10) return toast('Minimum points is ₹10');

    const newBid = { 
      id: Date.now(), 
      session, 
      digit: betNumber, 
      points: parseFloat(amount),
      totalPoints: parseFloat(amount),
      multiplier: 1 
    };

    setBids([...bids, newBid]);
    setBetNumber('');
    setAmount('');
  };

  const handleRemoveBid = (idToRemove) => setBids(bids.filter(bid => bid.id !== idToRemove));

  const totalGridPoints = Object.values(gridBids).reduce((acc, val) => acc + val, 0);
  const totalGridBets = Object.keys(gridBids).length;
  const totalCartPoints = bids.reduce((acc, curr) => acc + (curr.totalPoints || curr.points), 0);
  const totalCartBids = bids.reduce((acc, curr) => acc + (curr.multiplier || 1), 0);

  const isSpecialGridActive = gameType === 'Single Panna' && activeMode === 'special';
  const displayTotalPoints = isSpecialGridActive ? totalGridPoints : totalCartPoints;
  const displayTotalBids = isSpecialGridActive ? totalGridBets : totalCartBids;

  const handleSubmitCartOrGrid = async () => {
    const payloadBids = isSpecialGridActive
      ? Object.keys(gridBids).map(pana => ({ digit: pana, points: gridBids[pana], session }))
      : bids;

    if (payloadBids.length === 0) return;
    if (displayTotalPoints > balance) return toast.error(`Insufficient balance! Your wallet balance is ₹${balance}.`);

    setLoading(true);
    try {
      const formattedData = {
        market_id: id,
        game_type: gameType, 
        total_amount: displayTotalPoints,
        bids: payloadBids.map(bid => ({
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
      setBids([]); setGridBids({}); setStep(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place bids!");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-transparent -mx-4 -mt-8 p-4 min-h-screen">
    

      {isSpecialGridActive ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-24 border border-gray-100">
          <div className="flex items-center gap-3 mb-6 mt-2">
            <label className="text-[16px] font-black text-gray-800">Session:</label>
            <div className="relative flex-1">
              <select value={session} onChange={(e) => setSession(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#380e4b] p-3.5 rounded-xl appearance-none outline-none font-bold text-[15px] focus:ring-2 focus:ring-[#380e4b]/20">
                <option value="Open">Open</option><option value="Close">Close</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#380e4b] pointer-events-none text-sm" />
            </div>
          </div>

          {Object.keys(singlePannaGroups).map(groupDigit => (
            <div key={groupDigit} className="bg-white rounded-[16px] overflow-hidden mb-5 border border-gray-200 shadow-sm hover:border-[#380e4b]/50 transition-colors">
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 py-3 px-4 font-black text-[16px] border-b border-gray-200 flex justify-between items-center">
                <span>Pana of {groupDigit}</span>
                <FaLayerGroup className="text-gray-400" />
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {singlePannaGroups[groupDigit].map(pana => (
                  <div key={pana} className="flex flex-col items-center">
                    <span className="font-extrabold text-[#380e4b] mb-1.5 text-[15px]">{pana}</span>
                    <div className="relative w-full border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-[#380e4b] focus-within:bg-white transition-all">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px]">₹</span>
                      <input type="text" inputMode="numeric" value={gridBids[pana] || ''} onChange={(e) => handleGridInputChange(pana, e.target.value)} className="w-full py-2.5 pl-7 pr-2 text-center font-bold text-gray-800 outline-none bg-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border border-gray-100">
            <div className="mb-5">
              <label className="block text-[14px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Session</label>
              <div className="relative">
                <select value={session} onChange={(e) => setSession(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl appearance-none outline-none font-bold focus:ring-2 focus:ring-[#380e4b]/20 transition-all">
                  <option value="Open">Open</option><option value="Close">Close</option>
                </select>
                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[14px] font-bold text-gray-500 uppercase tracking-wider">{gameType === 'Single' ? 'Digit (0-9)' : 'Pana (3 Digits)'}</label>
                {exact > 0 && <span className="text-[10px] bg-purple-100 text-[#380e4b] font-bold px-2 py-1 rounded-md">Exact {exact} digit(s)</span>}
              </div>
              <input type="text" inputMode="numeric" placeholder={`Enter ${gameType === 'Single' ? 'digit' : 'pana'}`} value={betNumber} onChange={handleBetNumberChange} maxLength={maxLength} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none font-bold text-lg text-center tracking-widest focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Points (₹)</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
                 <input type="text" inputMode="numeric" placeholder="Min: 10" value={amount} onChange={handleAmountChange} className="w-full bg-gray-50 border border-gray-200 p-4 pl-10 rounded-xl outline-none font-bold text-lg focus:bg-white focus:border-[#380e4b] focus:ring-2 focus:ring-[#380e4b]/20 transition-all" />
              </div>
            </div>
            <button onClick={handleAddBid} className="w-full bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white font-black py-4 px-6 rounded-xl active:scale-95 transition-transform shadow-md uppercase tracking-wide">Add Bid</button>
          </div>

          <CartSummary bids={bids} handleRemoveBid={handleRemoveBid} />
        </>
      )}

      <BottomActionBar 
        displayTotalPoints={displayTotalPoints} 
        displayTotalBids={displayTotalBids} 
        handleClear={() => isSpecialGridActive ? setGridBids({}) : setBids([])} 
        handleSubmit={handleSubmitCartOrGrid} 
        loading={loading} 
        showClearBtn={isSpecialGridActive} 
      />
    </div>
  );
};

export default SingleAndSinglePannaGame;
