import React, { useState, useEffect } from 'react';
import { XCircle, History, Calendar, Gamepad2, Phone, Trophy, Skull, Eye } from 'lucide-react';
import { fetchGame } from '../../utils/api';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';

export const GameResultAdminPanel = () => {
  const [category, setCategory] = useState('Normal'); // Normal vs Gali Desawar
  const [activeTab, setActiveTab] = useState('Calculate Results');
  const [showError, setShowError] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Data states
  const [winners, setWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);

  // Form states
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openPana, setOpenPana] = useState('');
  const [closePana, setClosePana] = useState('');
  const [gdJodi, setGdJodi] = useState('');

  const handleOpenPanaChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setOpenPana(value);
  };

  const handleClosePanaChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setClosePana(value);
  };

  const handleGdJodiChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2); // Remove non-digits, max 2 chars
    setGdJodi(value);
  };

  const tabs = ['Calculate Results', 'Winners', 'Losers', 'History'];

  // Load games list based on active category
  useEffect(() => {
    const loadGames = async () => {
      setGames([]);
      setSelectedGame('');
      try {
        if (category === 'Normal') {
          const gameData = await fetchGame();
          if (gameData) {
            setGames(gameData);
          }
        } else {
          const res = await AxiosAdmin({
            url: SummaryApi.getGDGame.url,
            method: SummaryApi.getGDGame.method
          });
          setGames(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setShowError(true);
      }
    };
    loadGames();
  }, [category]);

  const fetchData = async () => {
    if (!selectedGame || !selectedDate) return;
    setLoading(true);
    try {
      let endpoint = null;
      let params = { market_id: selectedGame, date: selectedDate };

      if (category === 'Normal') {
        if (activeTab === 'Winners') {
          endpoint = SummaryApi.getFilteredBids;
          params.status = 'Winner';
        } else if (activeTab === 'Losers') {
          endpoint = SummaryApi.getFilteredBids;
          params.status = 'Loser';
        } else if (activeTab === 'Calculate Results') {
          endpoint = SummaryApi.getFilteredBids;
          params.status = 'Pending';
        } else if (activeTab === 'History') {
          endpoint = SummaryApi.getMarketResults;
        }
      } else {
        // Gali Desawar endpoints
        if (activeTab === 'Winners') {
          endpoint = SummaryApi.getGDFilteredBids;
          params.status = 'Winner';
        } else if (activeTab === 'Losers') {
          endpoint = SummaryApi.getGDFilteredBids;
          params.status = 'Loser';
        } else if (activeTab === 'Calculate Results') {
          endpoint = SummaryApi.getGDFilteredBids;
          params.status = 'Pending';
        } else if (activeTab === 'History') {
          endpoint = SummaryApi.getGDMarketResults;
        }
      }

      if (endpoint) {
        const res = await AxiosAdmin({
          url: endpoint.url,
          method: endpoint.method,
          params: params
        });

        const data = res.data.data || res.data.bids || [];
        if (activeTab === 'Winners') setWinners(data);
        else if (activeTab === 'Losers') setLosers(data);
        else if (activeTab === 'History') setHistory(data);
        else if (activeTab === 'Calculate Results') setPendingBids(data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGame, selectedDate, activeTab, category]);

  const handleResult = async () => {
    try {
      if (category === 'Normal') {
        const res = await AxiosAdmin({
          url: SummaryApi.declareResult.url,
          method: SummaryApi.declareResult.method,
          data: {
            market_id: selectedGame,
            date: selectedDate,
            open_panna: openPana,
            close_panna: closePana
          }
        });
        toast.success(res.data.message || "Result generated successfully!");
        setOpenPana('');
        setClosePana('');
      } else {
        const res = await AxiosAdmin({
          url: SummaryApi.declareGDResult.url,
          method: SummaryApi.declareGDResult.method,
          data: {
            market_id: selectedGame,
            date: selectedDate,
            jodi: gdJodi
          }
        });
        toast.success(res.data.message || "GD Result generated successfully!");
        setGdJodi('');
      }
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to declare result:", error);
      toast.error(error?.response?.data?.message || "Failed to declare result!");
    }
  };

  const loadHistoryResult = (item) => {
    if (category === 'Normal') {
      setOpenPana(item.open_panna || "");
      setClosePana(item.close_panna || "");
    } else {
      setGdJodi(item.jodi || "");
    }
    setActiveTab('Calculate Results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isValidSubmission = category === 'Normal'
    ? (selectedGame && selectedDate && (openPana.length === 3 || closePana.length === 3))
    : (selectedGame && selectedDate && gdJodi.length === 2);

  const PAYOUT_RATES = {
    'Single': 10, 'SingleBulk': 10,
    'Jodi': 100, 'JodiBulk': 100,
    'Single Panna': 160, 'SinglePannaBulk': 160,
    'Double Panna': 320, 'DoublePannaBulk': 320,
    'Triple Panna': 700,
    'FullSangam': 10000,
    'HalfSangamA': 1000, 'HalfSangamB': 1000,
    'SP': 10, 'DP': 100, 'TP': 700,
    'TwoDigitPana': 100,
    'SPMotor': 160, 'DPMotor': 320,
    'RedJodi': 100,
    'OddEven': 2,
    'SPCOMMON': 10, 'DPCOMMON': 100,
    'Cycle Pana': 160, 'CyclePana': 160,
    'Family Panel': 100, 'FamilyPanel': 100
  };

  const getWonAmount = (bid) => {
    const savedWon = Number(bid?.wonAmount ?? bid?.won_amount ?? 0);
    if (savedWon > 0) return savedWon;

    if (bid?.status !== 'Winner') return 0;

    if (category === 'Normal') {
      const rate = PAYOUT_RATES[bid?.game_type] || 0;
      return Number(bid?.amount || 0) * rate;
    } else {
      const rate = bid.game_type === 'Jodi Digit' ? 95 : 9.5;
      return Number(bid?.amount || 0) * rate;
    }
  };

  const renderTable = (data, type) => {
    if (loading) return <div className="text-center py-10 text-gray-400">Loading {type}...</div>;
    if (data.length === 0) return <div className="text-center py-10 text-gray-400">No {type} found for this selection.</div>;

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Game</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Input</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
              {type === 'Winners' && <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-green-600">Won</th>}
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((bid) => (
              <tr key={bid._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{bid.user_id?.name || 'User'}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {bid.user_id?.mobile || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-600">{bid.game_type} {bid.session ? `(${bid.session})` : ''}</td>
                <td className="px-4 py-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-bold">{bid.bet_number}</span></td>
                <td className="px-4 py-4 text-sm font-bold text-gray-700">₹{bid.amount}</td>
                {type === 'Winners' && <td className="px-4 py-4 text-sm font-black text-green-600">₹{getWonAmount(bid)}</td>}
                <td className="px-4 py-4 text-xs font-medium text-gray-400">{new Date(bid.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHistory = () => {
    if (loading) return <div className="text-center py-10 text-gray-400">Loading History...</div>;
    if (history.length === 0) return <div className="text-center py-10 text-gray-400">No history found for this game.</div>;

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Date</th>
              {category === 'Normal' ? (
                <>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Open</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Jodi</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Close</th>
                </>
              ) : (
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Jodi</th>
              )}
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-center">
            {history.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-sm font-bold text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                {category === 'Normal' ? (
                  <>
                    <td className="px-4 py-4 text-sm font-black text-purple-600">{item.open_panna || '***'}</td>
                    <td className="px-4 py-4 text-lg font-black text-gray-800 tracking-widest">{item.jodi || '**'}</td>
                    <td className="px-4 py-4 text-sm font-black text-purple-600">{item.close_panna || '***'}</td>
                  </>
                ) : (
                  <td className="px-4 py-4 text-lg font-black text-gray-800 tracking-widest">{item.jodi || '**'}</td>
                )}
                <td className="px-4 py-4">
                  <button
                    onClick={() => loadHistoryResult(item)}
                    className="p-2 text-gray-400 hover:text-[#380e4b] hover:bg-purple-50 rounded-full transition-all"
                    title="Load Result"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8 flex flex-col justify-start items-center gap-6">

      {/* Category Toggle Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-md max-w-sm w-full border border-gray-150">
        <button
          onClick={() => setCategory('Normal')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider transition-all uppercase ${category === 'Normal'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          Normal Game
        </button>
        <button
          onClick={() => setCategory('Gali Desawar')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider transition-all uppercase ${category === 'Gali Desawar'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          Gali Desawar
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-[#210c2e] text-white py-8 text-center shadow-md">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-2 text-gray-300 uppercase">
            {category} Result Panel
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">
            Real-Time Winner & Losers Settlement Manager
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 md:px-10 pt-6 border-b border-gray-200 flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar bg-gray-50/30">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap
                ${activeTab === tab
                  ? 'text-[#380e4b] scale-105'
                  : 'text-gray-400 hover:text-gray-700'
                }`}
            >
              {tab === 'History' && <History className="w-4 h-4" />}
              {tab === 'Winners' && <Trophy className="w-4 h-4 text-yellow-500" />}
              {tab === 'Losers' && <Skull className="w-4 h-4 text-red-400" />}
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-[#380e4b] transition-all duration-300"></span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10">
          {showError && (
            <div className="bg-[#fff1f2] border-l-[4px] border-[#ef4444] rounded-lg p-4 mb-8 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-[#ef4444]">
                <XCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Error Loading Games</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Game</label>
              <div className="relative">
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all cursor-pointer font-bold shadow-sm"
                >
                  <option value="" disabled>Choose a game...</option>
                  {games.map((game) => (
                    <option key={game._id} value={game._id}>{game.name}</option>
                  ))}
                </select>
                <Gamepad2 className="w-5 h-5 text-gray-300 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-gray-300 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all cursor-pointer font-bold shadow-sm"
                />
              </div>
            </div>

            {/* Stats Summary Card */}
            {selectedGame && selectedDate && (
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Total Bids</span>
                  <span className="text-xl font-black text-blue-700">₹{(winners.reduce((acc, curr) => acc + curr.amount, 0) + losers.reduce((acc, curr) => acc + curr.amount, 0) + pendingBids.reduce((acc, curr) => acc + curr.amount, 0))}</span>
                </div>
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-tighter">Total Payout</span>
                  <span className="text-xl font-black text-green-700">₹{winners.reduce((acc, curr) => acc + getWonAmount(curr), 0)}</span>
                </div>
                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-tighter">Profit/Loss</span>
                  <span className={`text-xl font-black ${(winners.reduce((acc, curr) => acc + curr.amount, 0) + losers.reduce((acc, curr) => acc + curr.amount, 0) - winners.reduce((acc, curr) => acc + getWonAmount(curr), 0)) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{(winners.reduce((acc, curr) => acc + curr.amount, 0) + losers.reduce((acc, curr) => acc + curr.amount, 0) - winners.reduce((acc, curr) => acc + getWonAmount(curr), 0))}
                  </span>
                </div>
              </div>
            )}


            {activeTab === 'Calculate Results' && (
              category === 'Normal' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Open Pana</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="e.g., 123"
                      value={openPana}
                      onChange={handleOpenPanaChange}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all placeholder-gray-400 font-bold shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Close Pana</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="e.g., 456"
                      value={closePana}
                      onChange={handleClosePanaChange}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all placeholder-gray-400 font-bold shadow-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GD Jodi Result (2 Digits)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="e.g., 95"
                    value={gdJodi}
                    onChange={handleGdJodiChange}
                    className="w-full max-w-sm bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all placeholder-gray-400 font-bold shadow-sm text-center text-xl tracking-[0.2em]"
                  />
                </div>
              )
            )}
          </div>

          {/* Dynamic Content */}
          <div className="mt-8 transition-all duration-500 ease-in-out">
            <h3 className="text-lg font-bold text-[#380e4b] mb-4 flex items-center gap-2 uppercase tracking-wide">
              {activeTab} Data
              <span className="text-xs bg-purple-100 text-[#380e4b] px-2.5 py-0.5 rounded-full font-bold">
                {selectedDate}
              </span>
            </h3>

            {activeTab === 'Calculate Results' && (
              <div className="space-y-6">
                {renderTable(pendingBids, 'Pending')}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleResult}
                    disabled={!isValidSubmission || loading}
                    className={`font-black tracking-widest py-4 px-12 rounded-2xl text-base transition-all uppercase shadow-lg ${(!isValidSubmission || loading)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#380e4b] to-[#601a91] text-white hover:scale-105 hover:shadow-xl active:scale-95'
                      }`}
                  >
                    {loading ? 'Processing...' : 'Declare & Verify GD Results'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Winners' && renderTable(winners, 'Winners')}
            {activeTab === 'Losers' && renderTable(losers, 'Losers')}
            {activeTab === 'History' && renderHistory()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameResultAdminPanel;