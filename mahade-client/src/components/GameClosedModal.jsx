import React from 'react';

const GameClosedModal = ({ isOpen, onClose, gameDetails }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl flex flex-col items-center">
                
                <div className="w-16 h-16 bg-red-100 rounded-full flex justify-center items-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>

                {/* Warning Text */}
                <h2 className="text-red-500 text-lg mb-2">Bidding is Closed For Today</h2>

                {/* Game Name */}
                <h1 className="text-xl font-bold text-gray-800 mb-6 uppercase">
                    {gameDetails?.name || "SITA MORNING"}
                </h1>

                {/* Timings List */}
                <div className="w-full space-y-3 mb-6 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Open Result Time :</span>
                        <span className="font-bold text-black">{gameDetails?.openResultTime || "09:35 AM"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Open Bid Last Time :</span>
                        <span className="font-bold text-black">{gameDetails?.open_time || "09:45 AM"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Close Result Time :</span>
                        <span className="font-bold text-black">{gameDetails?.closeResultTime || "10:35 AM"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Close Bid Last Time :</span>
                        <span className="font-bold text-black">{gameDetails?.close_time || "10:45 AM"}</span>
                    </div>
                </div>

                {/* OK Button */}
                <button 
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default GameClosedModal;