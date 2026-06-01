import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../../../utils/axios';
import SummaryApi from '../../../common/SummerAPI';
import { getGameConfig, validateMatkaRules, blockInvalidChar } from './gameUtils';

const StandardGame = ({ id, gameType, balance, gameOptions, setStep }) => {
  const [session, setSession] = useState('Open');
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const { maxLength, exact, placeholder } = getGameConfig(gameType);

  const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ""));

  const handleBetNumberChange = (e) => {
    if (gameType === 'HalfSangamA') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 4) { setBetNumber(digits.slice(0, 3) + '-' + digits[3]); }
      else if (digits.length === 3 && betNumber.length < 4) { setBetNumber(digits + '-'); }
      else { setBetNumber(digits); }
    } else if (gameType === 'HalfSangamB') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 2) { setBetNumber(digits[0] + '-' + digits.slice(1)); }
      else if (digits.length === 1 && betNumber.length < 2) { setBetNumber(digits + '-'); }
      else { setBetNumber(digits); }
    } else if (gameType === 'FullSangam') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
      if (digits.length >= 4) { setBetNumber(digits.slice(0, 3) + '-' + digits.slice(3)); }
      else if (digits.length === 3 && betNumber.length < 4) { setBetNumber(digits + '-'); }
      else { setBetNumber(digits); }
    } else {
      setBetNumber(e.target.value.replace(/\D/g, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!betNumber || !amount) return toast.error("Please enter both Number and Amount!");
    if (Number(amount) < 10) return toast("Minimum bet amount is ₹10!");
    if (Number(amount) > balance) return toast.error(`Insufficient balance! Your wallet balance is ₹${balance}.`);
    if (!validateMatkaRules(gameType, betNumber, exact, toast)) return;

    const fullSessionGames = ['Jodi', 'RedJodi', 'HalfSangamA', 'HalfSangamB', 'FullSangam'];
    const finalSession = fullSessionGames.includes(gameType) ? 'Full' : session;

    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.placeBid.url,
        method: SummaryApi.placeBid.method,
        data: { 
          market_id: id, 
          game_type: gameType, 
          session: finalSession, 
          bet_number: betNumber, 
          amount: Number(amount) 
        }
      });
      toast.success(response.data.message || "Bid placed successfully!");
      setBetNumber(''); setAmount(''); setStep(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place bid!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
      <h2 className="text-xl font-black text-[#380e4b] mb-6 text-center border-b border-gray-100 pb-4 uppercase flex items-center justify-center gap-3">
        <span className="bg-purple-50 p-3 rounded-full">{gameOptions.find(o => o.id === gameType)?.icon}</span>
        {gameOptions.find(o => o.id === gameType)?.label || gameType}
      </h2>
      
      {!['Jodi', 'RedJodi', 'HalfSangamA', 'HalfSangamB', 'FullSangam'].includes(gameType) && (
        <div className="flex gap-4 mb-6">
          <label className="flex-1 cursor-pointer">
            <input type="radio" className="peer sr-only" checked={session === 'Open'} onChange={() => setSession('Open')} />
            <div className="text-center py-3.5 rounded-xl border-2 border-gray-200 font-bold peer-checked:border-[#380e4b] peer-checked:bg-purple-50 peer-checked:text-[#380e4b] text-gray-400 transition-all">OPEN</div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input type="radio" className="peer sr-only" checked={session === 'Close'} onChange={() => setSession('Close')} />
            <div className="text-center py-3.5 rounded-xl border-2 border-gray-200 font-bold peer-checked:border-[#380e4b] peer-checked:bg-purple-50 peer-checked:text-[#380e4b] text-gray-400 transition-all">CLOSE</div>
          </label>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
             <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider">
               {gameType.includes('Sangam') ? 'Enter Format' : 'Enter Number'}
             </label>
             {exact > 0 && <span className="text-[10px] bg-purple-100 text-[#380e4b] font-bold px-2 py-1 rounded-md">Exact {exact} digit(s)</span>}
          </div>
          <input 
            type="text" 
            value={betNumber} 
            maxLength={maxLength} 
            onKeyDown={(e) => blockInvalidChar(e, gameType)} 
            onChange={handleBetNumberChange} 
            placeholder={placeholder} 
            className="w-full text-2xl font-black text-center bg-gray-50 border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-[#380e4b] focus:bg-white focus:ring-4 focus:ring-[#380e4b]/10 tracking-[0.2em] transition-all" 
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Amount (Points)</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
            <input 
              type="text" 
              inputMode="numeric" 
              value={amount} 
              onKeyDown={(e) => blockInvalidChar(e, gameType)} 
              onChange={handleAmountChange} 
              placeholder="Minimum 10" 
              className="w-full text-xl font-black pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-[#380e4b] focus:bg-white focus:ring-4 focus:ring-[#380e4b]/10 transition-all" 
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white font-black text-lg uppercase tracking-wider rounded-xl py-4 mt-6 shadow-lg active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100">
          {loading ? 'Processing...' : 'Place Bid Now'}
        </button>
      </form>
    </div>
  );
};

export default StandardGame;
