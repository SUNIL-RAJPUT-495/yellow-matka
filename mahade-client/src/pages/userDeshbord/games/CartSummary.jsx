import React from 'react';
import { FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

const CartSummary = ({ bids, handleRemoveBid, title = "Cart Summary", emptyText = "No bids added yet.", prefix = "" }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mt-4 mb-24 border border-gray-100 min-h-[140px]">
      <h2 className="text-[16px] font-black text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <FaCheckCircle className="text-green-500" /> {title}
      </h2>
      {bids.length === 0 ? (
        <div className="text-gray-400 font-medium text-center py-4 text-sm">{emptyText}</div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {bids.map((bid) => (
            <div key={bid.id} className="flex justify-between items-center bg-[#f8f9fa] p-3.5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="bg-[#380e4b] text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-black w-max uppercase tracking-wider">
                  {bid.session}
                </span>
                <span className="font-black text-gray-800 text-base">
                  {prefix}{bid.digit}
                </span>
              </div>
              <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <div className="flex flex-col items-end">
                  <span className="font-black text-green-600 text-lg">₹{bid.totalPoints || bid.points}</span>
                  {bid.multiplier > 1 && (
                    <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">₹{bid.points} x {bid.multiplier}</span>
                  )}
                </div>
                <button 
                  onClick={() => handleRemoveBid(bid.id)} 
                  className="text-red-400 hover:text-red-600 transition-colors p-2 bg-red-50 rounded-lg"
                >
                  <FaTrashAlt size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartSummary;
