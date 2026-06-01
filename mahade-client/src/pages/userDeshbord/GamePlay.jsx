import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix,
  FaArrowLeft, FaWallet, FaClone, FaLayerGroup, FaCogs, FaBalanceScale 
} from "react-icons/fa";
import { GiCardExchange, GiSwapBag } from "react-icons/gi";

// Import Refactored Game Components
import SingleAndSinglePannaGame from './games/SingleAndSinglePannaGame';
import BulkGame from './games/BulkGame';
import OddEvenGame from './games/OddEvenGame';
import MotorGame from './games/MotorGame';
import StandardGame from './games/StandardGame';

const GamePlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [gameDetails] = useState(location.state?.game || null);
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState('Single');

  const balance = useSelector((state) => state.user.wallet?.realBalance ?? 0);

  if (!id) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-gray-600 mb-4">No Game Selected!</p>
        <button onClick={() => navigate(-1)} className="bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all">Go Back</button>
      </div>
    );
  }

  const gameOptions = [
    { id: 'Single', label: 'SINGLE DIGIT', icon: <FaDiceOne /> },
    { id: 'SingleBulk', label: 'SINGLE DIGITS BULK', icon: <FaDiceTwo /> },
    { id: 'Jodi', label: 'JODI', icon: <FaDiceThree /> },
    { id: 'JodiBulk', label: 'JODI BULK', icon: <FaDiceFour /> },
    { id: 'Single Panna', label: 'SINGLE PANA', icon: <FaDiceFive /> },
    { id: 'SinglePannaBulk', label: 'SINGLE PANA BULK', icon: <FaDiceSix /> },
    { id: 'Double Panna', label: 'DOUBLE PANA', icon: <FaLayerGroup /> },
    { id: 'DoublePannaBulk', label: 'DOUBLE PANA BULK', icon: <FaLayerGroup /> },
    { id: 'Triple Panna', label: 'TRIPLE PANA', icon: <FaClone /> },
    { id: 'FullSangam', label: 'FULL SANGAM', icon: <FaDiceSix /> },
    { id: 'HalfSangamA', label: 'HALF SANGAM A', icon: <GiCardExchange /> },
    { id: 'HalfSangamB', label: 'HALF SANGAM B', icon: <GiSwapBag /> },
    { id: 'SP', label: 'SP', icon: <FaDiceOne /> },
    { id: 'DP', label: 'DP', icon: <FaDiceTwo /> },
    { id: 'TP', label: 'TP', icon: <FaDiceThree /> },
    { id: 'TwoDigitPana', label: 'TWO DIGIT PANA', icon: <FaDiceFour /> },
    { id: 'SPMotor', label: 'SP MOTOR', icon: <FaCogs /> },
    { id: 'DPMotor', label: 'DP MOTOR', icon: <FaCogs /> },
    { id: 'RedJodi', label: 'RED JODI', icon: <FaDiceFive /> },
    { id: 'OddEven', label: 'ODD EVEN', icon: <FaBalanceScale /> },
    { id: 'SPCOMMON', label: 'SP COMMON', icon: <FaDiceOne /> },
    { id: 'DPCOMMON', label: 'DP COMMON', icon: <FaDiceTwo /> },
  ];

  const handleBack = () => {
    if (step === 2) { setStep(1); }
    else navigate(-1);
  };

  const renderActiveGame = () => {
    if (['Single Panna', 'Single'].includes(gameType)) {
      return <SingleAndSinglePannaGame id={id} gameType={gameType} balance={balance} setStep={setStep} />;
    }
    if (gameType.includes('Bulk')) {
      return <BulkGame id={id} gameType={gameType} balance={balance} setStep={setStep} />;
    }
    if (gameType === 'OddEven') {
      return <OddEvenGame id={id} gameType={gameType} balance={balance} setStep={setStep} />;
    }
    if (['SPMotor', 'DPMotor'].includes(gameType)) {
      return <MotorGame id={id} gameType={gameType} balance={balance} setStep={setStep} />;
    }
    return <StandardGame id={id} gameType={gameType} balance={balance} gameOptions={gameOptions} setStep={setStep} />;
  };

  return (
    <div className="w-full bg-[#f4f6f8] font-sans pb-10 min-h-screen relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className='flex items-center gap-3 cursor-pointer group' onClick={handleBack}>
          <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <h1 className="text-[17px] font-black tracking-widest uppercase text-white drop-shadow-sm">
            {gameDetails ? gameDetails.name : "PLAY GAME"} {step === 2 && ` - ${gameOptions.find(o => o.id === gameType)?.label}`}
          </h1>
        </div>
        <div className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner border border-white/10 text-white">
          <FaWallet className="text-[#ffd700] text-lg" />
          <span className="font-extrabold text-sm tracking-wide">₹ {balance}</span>
        </div>
      </div>

      {/* Step 1: Game Selection Grid */}
      {step === 1 && (
        <div className="w-full max-w-7xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {gameOptions.map((option) => (
              <div 
                key={option.id} 
                onClick={() => { setGameType(option.id); setStep(2); }} 
                className="bg-white rounded-2xl flex flex-col items-center justify-center p-6 lg:p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group"
              >
                <div className="bg-gradient-to-br from-[#380e4b] to-[#5a1b75] text-white rounded-full w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center mb-4 text-2xl lg:text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  {option.icon}
                </div>
                <span className="text-gray-800 font-extrabold text-xs lg:text-sm tracking-wide uppercase">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Render Specific Game Component */}
      {step === 2 && (
        <div className="w-full max-w-md mx-auto px-4 mt-8 pb-20">
           {renderActiveGame()}
        </div>
      )}
    </div>
  );
};

export default GamePlay;