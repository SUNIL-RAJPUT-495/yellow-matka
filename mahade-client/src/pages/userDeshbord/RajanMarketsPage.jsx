import React from 'react';
import { useNavigate } from 'react-router-dom';
const RajanMarketsPage = () => {
  const navigate = useNavigate();
  // Rate board data
  const marketRates = [
    { id: 1, type: 'Single', rate: '1.00 KA 10.00' },
    { id: 2, type: 'Single Panna', rate: '1.00 KA 150.00' },
    { id: 3, type: 'Double Panna', rate: '1.00 KA 300.00' },
    { id: 4, type: 'Triple Panna', rate: '1.00 KA 700.00' },
  ];

  // Timings data
  const marketTimings = [
    { id: 1, time: '10.00 AM', result: 'XXX-X' },
    { id: 2, time: '12.00 PM', result: 'XXX-X' },
    { id: 3, time: '2.00 PM', result: 'XXX-X' },
    { id: 4, time: '4.00 PM', result: 'XXX-X' },
  ];

  return (
    <div className="min-h-screen bg-gray-300 font-sans pb-10">
      {/* Header Section */}
      <div className="bg-[#2f0c4c] text-white px-4 py-4 flex items-center shadow-md">
        <button 
          className="bg-white text-[#2f0c4c] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition shrink-0"
        >
          {/* Back Arrow SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-4 tracking-wide">Rajan Markets</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Market Rates Grid */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketRates.map((item) => (
              <div key={item.id} className="bg-[#3b125a] text-white rounded-xl p-4 relative flex flex-col items-center justify-center min-h-[80px]">
                {/* Coin Stack Icon (Top Left) */}
                <div className="absolute top-3 left-3 opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Rate Details */}
                <span className="text-xs font-semibold tracking-wide mb-1">{item.type}</span>
                <span className="text-lg font-bold">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timings List */}
        <div className="flex flex-col gap-4">
          {marketTimings.map((slot) => (
            <div key={slot.id} className="bg-[#f4f4f4] rounded-xl p-4 flex items-center justify-between shadow-sm">
              
              {/* Time */}
              <div className="text-gray-800 font-bold text-md w-24">
                {slot.time}
              </div>

              {/* Result Placeholder */}
              <div className="bg-white border border-gray-200 rounded-md px-6 py-2 font-bold text-gray-700 shadow-inner flex-grow text-center mx-4 max-w-[120px]">
                {slot.result}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Chart Button */}
                <button onClick={()=>navigate("/panel-chart")} className="bg-black text-white rounded-lg p-2.5 hover:bg-gray-800 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </button>

                {/* Play Button */}
                <button className="bg-[#cfd9e8] text-[#6b7b93] font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 hover:bg-[#b8c6da] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  PLAY
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RajanMarketsPage;