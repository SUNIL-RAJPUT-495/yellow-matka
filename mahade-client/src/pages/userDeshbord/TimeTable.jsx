import React, { useState, useEffect } from 'react';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const TimeTable = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const response = await Axios({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method,
      });

      const dataArray = Array.isArray(response.data) ? response.data : response.data.data || [];
      setGames(dataArray);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      {/* Header Section */}
      <div className="bg-[#3b0b59] text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-10 w-full">
        <button onClick={() => navigate(-1)} className="bg-white text-[#3b0b59] rounded-full p-1.5 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-wide">Time Table</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#3b0b59]"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 font-medium">No schedule available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <div 
                key={game._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${game.status === 'Closed' ? 'bg-red-500' : 'bg-green-500'}`}></div>

                <div className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-gray-800 font-extrabold text-lg uppercase tracking-wide">
                      {game.name}
                    </h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      game.status === 'Closed' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {game.status === 'Closed' ? 'CLOSED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-4">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Open Time</p>
                      <p className="text-[#3b0b59] font-bold text-sm bg-purple-50 px-3 py-1.5 rounded-lg inline-block">
                        {game.open_time || '--:--'}
                      </p>
                    </div>
                    
                    {/* Divider */}
                    <div className="w-px h-10 bg-gray-200 mx-2"></div>

                    <div className="flex-1 text-right border-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 text-right">Close Time</p>
                      <p className="text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                        {game.close_time || '--:--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { TimeTable };
