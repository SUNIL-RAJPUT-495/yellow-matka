import React from 'react';

const BottomActionBar = ({ 
  displayTotalPoints, 
  displayTotalBids, 
  handleClear, 
  handleSubmit, 
  loading, 
  showClearBtn = false 
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40">
      <div className="max-w-md w-full flex justify-between items-center px-1">
        <div className="flex gap-6 sm:gap-8">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Points</span>
            <span className="text-[18px] font-black text-[#380e4b]">₹{displayTotalPoints}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Bids</span>
            <span className="text-[18px] font-black text-[#380e4b]">{displayTotalBids}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {showClearBtn && (
            <button 
              onClick={handleClear} 
              className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors py-3 px-4 rounded-xl font-black text-[13px] sm:text-sm active:scale-95"
            >
              Clear
            </button>
          )}
          <button 
            onClick={handleSubmit} 
            disabled={displayTotalBids === 0 || loading} 
            className={`py-3 px-6 sm:px-8 rounded-xl font-black text-[14px] uppercase tracking-wider transition-all shadow-md ${displayTotalBids > 0 ? 'bg-gradient-to-r from-[#380e4b] to-[#5a1b75] text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            {loading ? 'Wait...' : 'Submit Bids'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;
