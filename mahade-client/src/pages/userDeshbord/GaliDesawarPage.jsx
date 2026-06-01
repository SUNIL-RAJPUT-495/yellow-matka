import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegClock, FaTimes, FaChartBar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { fetchGDGame, fetchGame } from '../../utils/api';
import toast from 'react-hot-toast';
import { BsGraphUp, BsTable } from "react-icons/bs";

const GaliDesawarPage = () => {
  const navigate = useNavigate();
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // States for Regular Games from Home Page
  const [regularGamesList, setRegularGamesList] = useState([]);
  const [loadingRegular, setLoadingRegular] = useState(true);
  const [isRegularChartModalOpen, setIsRegularChartModalOpen] = useState(false);
  const [selectedRegularGame, setSelectedRegularGame] = useState(null);

  const galiDesawarNames = ['SHREE GANESH', 'FARIDABAD', 'GHAZIABAD', 'GALI', 'DESAWAR', 'DELHI BAZAR'];
  const regularGames = regularGamesList.filter(game =>
    !galiDesawarNames.some(name => game.name.toUpperCase().includes(name))
  );

  const loadRegularGames = async () => {
    setLoadingRegular(true);
    try {
      const response = await fetchGame();
      if (response && response.data) {
        setRegularGamesList(response.data);
      } else if (Array.isArray(response)) {
        setRegularGamesList(response);
      } else {
        setRegularGamesList([]);
      }
    } catch (error) {
      console.error("Error fetching regular games:", error);
      setRegularGamesList([]);
    } finally {
      setLoadingRegular(false);
    }
  };

  const loadAllGames = async () => {
    setLoading(true);
    try {
      const response = await fetchGDGame();
      if (response && response.data) {
        setGamesList(response.data);
      } else if (Array.isArray(response)) {
        setGamesList(response);
      } else {
        setGamesList([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
      setGamesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGames();
    loadRegularGames();
  }, []);

  const openChartModal = () => {
    setIsChartModalOpen(true);
  };

  const closeChartModal = () => {
    setIsChartModalOpen(false);
  };

  // Regular Chart modal helpers
  const openRegularChartModal = (game) => {
    setSelectedRegularGame(game);
    setIsRegularChartModalOpen(true);
  };

  const closeRegularChartModal = () => {
    setIsRegularChartModalOpen(false);
    setSelectedRegularGame(null);
  };

  const goToJodiChart = () => {
    navigate(`/jodi-chart?market=${selectedRegularGame?.name}`);
    closeRegularChartModal();
  };

  const goToPanelChart = () => {
    navigate(`/panel-chart?market=${selectedRegularGame?.name}`);
    closeRegularChartModal();
  };

  const handleSelectChart = (game) => {
    navigate(`/jodi-chart?market=${game.name}&type=gd`);
    closeChartModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-[#fbc02d] text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate("/")}
            className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-black tracking-widest mt-1 drop-shadow-sm uppercase">
            GALI DESAWAR
          </h1>
        </div>
      </div>

      

      {/* REGULAR GAMES LIST SECTION */}
      <div className="w-full md:max-w-5xl lg:max-w-6xl mx-auto px-4 mt-12 pb-16">
        <h2 className="text-2xl font-black text-center text-gray-800 uppercase tracking-widest mb-6 border-b-4 border-[#fbc02d] inline-block mx-auto pb-1.5 flex justify-center w-max">
         GAMES
        </h2>
        {loadingRegular ? (
          <div className="text-center py-10 font-bold text-gray-500">
            Loading Live Games...
          </div>
        ) : regularGames.length === 0 ? (
          <div className="text-center py-10 font-bold text-gray-500">
            No Active Games Found.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {regularGames.map((game) => {
              const isClosed = game.status !== 'Active';
              return (
                <div key={game._id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                  
                  {/* Top Header Bar */}
                  <div className="bg-[#fbc02d] px-4 py-2.5 flex justify-between items-center text-white text-[11px] sm:text-xs font-bold tracking-wide">
                    <span>Open Bids : {game.open_time}</span>
                    <span>Close Bids : {game.close_time}</span>
                  </div>

                  {/* Main Body */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    
                    {/* Growth Chart Icon (Far Left) */}
                    <div>
                      <button
                        onClick={() => openRegularChartModal(game)}
                        className="p-1 hover:bg-gray-100 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-gray-100 shadow-sm"
                        title="View Chart"
                      >
                        {/* Inline SVG Chart Growth Icon */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="14" width="3" height="6" rx="0.5" fill="#fbc02d" />
                          <rect x="8" y="10" width="3" height="10" rx="0.5" fill="#4caf50" />
                          <rect x="13" y="6" width="3" height="14" rx="0.5" fill="#2196f3" />
                          <rect x="18" y="3" width="3" height="17" rx="0.5" fill="#9c27b0" />
                          <path d="M3 12C3 12 7 7 12 8C17 9 21 3 21 3M21 3H16M21 3V8" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Details Column (Center) */}
                    <div className="flex-1 text-center space-y-1">
                      {/* Game Name */}
                      <h2 className="text-sm sm:text-base font-extrabold text-[#112244] tracking-wider uppercase">
                        {game.name}
                      </h2>
                      
                      {/* Numbers Result (Dashed Format) */}
                      <p className="text-base sm:text-lg font-black text-black tracking-wider">
                        {game.open_pana || '***'}-{game.jodi_result || '**'}-{game.close_pana || '***'}
                      </p>

                      {/* Status Text */}
                      <div className={`font-bold text-[11px] sm:text-xs uppercase ${isClosed ? 'text-red-600' : 'text-green-600'}`}>
                        {isClosed ? 'Market Closed' : 'Market is Running'}
                      </div>
                    </div>

                    {/* Play Button (Far Right) */}
                    <div>
                      <button
                        onClick={() => navigate(`/play/${game._id}`, { state: { game: game } })}
                        disabled={isClosed}
                        className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs sm:text-sm text-white shadow-md transition-all ${
                          isClosed
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200'
                            : 'bg-[#fbc02d] hover:bg-[#e6a100] active:scale-95'
                        }`}
                      >
                        {/* Dynamic Square Icon on the Left */}
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${isClosed ? 'bg-red-500/20 text-red-600' : 'bg-[#3f51b5] text-white'}`}>
                          {isClosed ? (
                            // Cross icon
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            // Play triangle icon
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-white ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                        <span className="tracking-widest uppercase">PLAY</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHART MODAL OVERLAY */}
      {isChartModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative pt-10 pb-6 px-6 overflow-visible">
            
            {/* Close Button */}
            <button
              onClick={closeChartModal}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <FaTimes className="text-sm" />
            </button>

            <h2 className="text-center text-lg font-black text-gray-800 mb-5 tracking-wider uppercase">
              SELECT MARKET CHART
            </h2>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
              {gamesList.map((game) => (
                <button
                  key={game._id}
                  onClick={() => handleSelectChart(game)}
                  className="w-full bg-gray-50 border border-gray-200 hover:bg-[#fffdeb] hover:border-[#fbc02d] py-3 rounded-xl font-extrabold text-[#374151] transition-all text-sm uppercase tracking-wide"
                >
                  {game.name}
                </button>
              ))}
              {gamesList.length === 0 && (
                <p className="text-center text-gray-500 font-bold text-xs py-4">No active markets available</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* REGULAR GAMES CHART MODAL OVERLAY */}
      {isRegularChartModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative pt-10 pb-6 px-6 overflow-visible">

            {/* Close Cross Button (Top Right Absolute) */}
            <button
              onClick={closeRegularChartModal}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Modal Title (Game Name) */}
            <h2 className="text-center text-xl font-black text-[#210c2e] mb-6 tracking-wide uppercase">
              {selectedRegularGame?.name}
            </h2>

            {/* Buttons Container */}
            <div className="flex flex-col gap-4">
              {/* Jodi Chart Button */}
              <button
                onClick={goToJodiChart}
                className="w-full bg-[#380e4b] hover:bg-[#210c2e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors active:scale-95 text-base shadow-sm"
              >
                <BsGraphUp className="text-xl font-bold" />
                Jodi Chart
              </button>

              {/* Panel Chart Button */}
              <button
                onClick={goToPanelChart}
                className="w-full bg-[#380e4b] hover:bg-[#210c2e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors active:scale-95 text-base shadow-sm"
              >
                <BsTable className="text-xl font-bold" />
                Panel Chart
              </button>

              {/* Red Close Button */}
              <button
                onClick={closeRegularChartModal}
                className="w-full bg-[#df3937] hover:bg-red-700 text-white py-3.5 rounded-xl font-bold mt-2 transition-colors active:scale-95 text-base shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GaliDesawarPage;
