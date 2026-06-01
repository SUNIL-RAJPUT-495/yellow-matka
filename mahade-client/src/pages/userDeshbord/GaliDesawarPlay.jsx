import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaWallet, FaDiceOne, FaDiceTwo, FaDiceThree } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

const GaliDesawarPlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [gameDetails] = useState(location.state?.game || null);
  const [step, setStep] = useState(location.state?.gameType ? 2 : 1);
  const [gameType, setGameType] = useState(location.state?.gameType || 'Left Digit'); // Left Digit, Right Digit, Jodi Digit
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = useSelector((state) => state.user.wallet?.realBalance ?? 0);

  const gdGameOptions = [
    { id: 'Left Digit', label: 'LEFT DIGIT', icon: <FaDiceOne /> },
    { id: 'Right Digit', label: 'RIGHT DIGIT', icon: <FaDiceTwo /> },
    { id: 'Jodi Digit', label: 'JODI DIGIT', icon: <FaDiceThree /> },
  ];

  const handleBack = () => {
    if (step === 2 && !location.state?.gameType) {
      setStep(1);
    } else {
      navigate(-1);
    }
  };

  if (!id) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-gray-600 mb-4">No Game Selected!</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/\D/g, ""));
  };

  const handleBetNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (gameType === 'Jodi Digit') {
      setBetNumber(val.slice(0, 2));
    } else {
      setBetNumber(val.slice(0, 1));
    }
  };

  const handleTabChange = (type) => {
    setGameType(type);
    setBetNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!betNumber || !amount) {
      return toast.error("Please enter both Number and Amount!");
    }

    const bidAmt = Number(amount);
    if (bidAmt < 10) {
      return toast("Minimum bet amount is ₹10!");
    }
    if (bidAmt > balance) {
      return toast.error(`Insufficient balance! Your wallet balance is ₹${balance}.`);
    }

    if (gameType === 'Jodi Digit' && betNumber.length !== 2) {
      return toast.error("Jodi number must be exactly 2 digits!");
    }
    if (gameType !== 'Jodi Digit' && betNumber.length !== 1) {
      return toast.error("Digit must be exactly 1 digit!");
    }

    // Set correct session based on game type
    // Left Digit -> Open Session
    // Right Digit -> Close Session
    // Jodi Digit -> Full Session
    let session = 'Full';
    if (gameType === 'Left Digit') session = 'Open';
    else if (gameType === 'Right Digit') session = 'Close';

    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.placeGDBid.url,
        method: SummaryApi.placeGDBid.method,
        data: {
          market_id: id,
          game_type: gameType,
          session: session,
          bet_number: betNumber,
          amount: bidAmt
        }
      });
      toast.success(response.data.message || "Bid placed successfully!");
      setBetNumber('');
      setAmount('');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place bid!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f4f6f8] font-sans pb-10 min-h-screen relative">

      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-[#fbc02d] to-[#e6a100] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBack}>
          <IoIosArrowRoundBack size={32} className="text-white group-hover:-translate-x-1 transition-transform duration-300" />
          <h1 className="text-[17px] font-black tracking-widest uppercase text-white drop-shadow-sm">
            {gameDetails ? gameDetails.name : "PLAY"} {step === 2 && ` - ${gameType}`}
          </h1>
        </div>
        <div className="bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner border border-white/10 text-white">
          <FaWallet className="text-[#ffd700] text-lg" />
          <span className="font-extrabold text-sm tracking-wide">₹ {balance}</span>
        </div>
      </div>

      {/* Step 1: Game Selection Cards */}
      {step === 1 && (
        <div className="w-full max-w-md md:max-w-3xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gdGameOptions.map((option) => (
              <div 
                key={option.id} 
                onClick={() => { setGameType(option.id); setStep(2); }} 
                className="bg-white rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-gray-100 group"
              >
                <div className="bg-gradient-to-br from-[#fbc02d] to-[#e6a100] text-white rounded-full w-14 h-14 flex items-center justify-center mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  {option.icon}
                </div>
                <span className="text-gray-800 font-extrabold text-sm tracking-wide uppercase">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Bidding Form */}
      {step === 2 && (
        <div className="max-w-md mx-auto px-4 mt-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-black text-gray-800 mb-6 text-center border-b border-gray-100 pb-4 uppercase">
              PLACE {gameType} BID
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Number Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                    {gameType === 'Jodi Digit' ? 'Enter Jodi Number' : 'Enter Single Digit'}
                  </label>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
                    {gameType === 'Jodi Digit' ? 'Exactly 2 digits' : 'Exactly 1 digit'}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={betNumber}
                  onChange={handleBetNumberChange}
                  placeholder={gameType === 'Jodi Digit' ? 'e.g. 95' : 'e.g. 5'}
                  className="w-full text-3xl font-black text-center bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 outline-none focus:border-[#fbc02d] focus:bg-white focus:ring-4 focus:ring-[#fbc02d]/10 tracking-[0.2em] transition-all"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Enter Amount (Points)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Minimum 10"
                    className="w-full text-xl font-black pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 outline-none focus:border-[#fbc02d] focus:bg-white focus:ring-4 focus:ring-[#fbc02d]/10 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#fbc02d] to-[#e6a100] text-white font-black text-base uppercase tracking-wider rounded-2xl py-4 mt-6 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? 'Processing...' : 'Place Bid Now'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GaliDesawarPlay;
