import React, { useState, useEffect } from 'react';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';


const GameResultsPage = () => {
  const [results, setResults] = useState([]);
  const Navigate = useNavigate();

  const fetchResults = async () => {
    try {
      const response = await Axios({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method,
      });

      const dataArray = Array.isArray(response.data) ? response.data : response.data.data || [];
      const formattedResults = dataArray.map(item => {
        const openPanna = item.open_pana || '***';
        const jodi = item.jodi_result || '**';
        const closePanna = item.close_pana || '***';
        const resultString = `${openPanna}-${jodi}-${closePanna}`;

        let status = 'completed';
        if (openPanna === '***' || closePanna === '***' || jodi === '**') {
          status = 'pending';
        }

        const resultDate = getCurrentDate(); // Always current date

        return {
          id: item._id,
          name: item.name || 'Unknown',
          result: resultString,
          status: status,
          resultDate,
        };
      });

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

const getCurrentDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

  return (
    <div className="min-h-screen bg-gray-200 font-sans pb-10">
      {/* Header Section */}
      <div className="bg-[#3b0b59] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {/* Back Arrow SVG */}
          <button onClick={()=>Navigate(-1)} className="bg-white text-[#3b0b59] rounded-full p-1 hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-wide">Game Results</h1>
        </div>

        {/* Date Button */}
        <div className="bg-[#5a3275] border border-[#6b4286] px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getCurrentDate()}
        </div>
      </div>

      {/* Main Content List */}
      <div className="max-w-2xl mx-auto px-4 mt-8 flex flex-col gap-4">
        {results.map((game) => {
          // Check karte hain agar status pending hai ya result mein X hai
          const isPending = game.status === 'pending' || game.result.includes('X') || game.result === 'PENDING';

          return (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-800 font-bold text-lg tracking-wide uppercase">
                  {game.name}
                </span>
                {game.resultDate && (
                  <span className="text-xs text-gray-500 font-medium">{game.resultDate}</span>
                )}
              </div>

              {/* Dynamic Color Pill — har din ka result yahan history ke saath */}
              <div
                className={`px-6 py-2 rounded-lg border-2 font-bold text-lg tracking-widest shrink-0 ${isPending
                    ? 'bg-blue-100 border-blue-200 text-[#2b6cb0]' // Blue for pending
                    : 'bg-red-100 border-red-200 text-[#c53030]'   // Red for completed
                  }`}
              >
                {game.result}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameResultsPage;