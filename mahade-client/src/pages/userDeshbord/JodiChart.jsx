import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Calendar } from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';

const getMonday = (d) => {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
};

const shortFormat = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthList[d.getMonth()];
  return `${day} ${month}`;
};

const getWeekRangeStr = (monday) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${shortFormat(monday)} - ${shortFormat(sunday)}`;
};

const JodiChart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGD = searchParams.get('type') === 'gd';
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedMarketName, setSelectedMarketName] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    if (selectedMarketId) {
      fetchChartData(selectedMarketId);
    }
  }, [selectedMarketId]);

  const fetchMarkets = async () => {
    try {
      const endpoint = isGD ? SummaryApi.getGDGame : SummaryApi.getGame;
      const response = await fetch(endpoint.url);
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        setMarkets(data.data);
        
        // Check if market parameter is passed in URL
        const urlMarketName = searchParams.get('market');
        const matched = urlMarketName ? data.data.find(m => m.name.toUpperCase() === urlMarketName.toUpperCase()) : null;
        
        if (matched) {
          setSelectedMarketId(matched._id);
          setSelectedMarketName(matched.name);
        } else {
          setSelectedMarketId(data.data[0]._id);
          setSelectedMarketName(data.data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchChartData = async (marketId) => {
    setLoading(true);
    try {
      const endpoint = isGD ? SummaryApi.getGDMarketResults : SummaryApi.getMarketResults;
      const url = new URL(endpoint.url);
      url.searchParams.append('market_id', marketId);
      const response = await fetch(url);
      const json = await response.json();
      
      if (json && json.data) {
        processResultsToChart(json.data);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const processResultsToChart = (results) => {
    // We group by "Monday" timestamp
    const weeksMap = new Map();
    
    results.forEach(res => {
      const resultDate = new Date(res.date);
      const monday = getMonday(resultDate);
      const monTime = monday.getTime();
      
      if (!weeksMap.has(monTime)) {
        weeksMap.set(monTime, {
          weekTime: monTime,
          weekStr: getWeekRangeStr(monday),
          mon: '**', tue: '**', wed: '**', thu: '**', fri: '**', sat: '**', sun: '**'
        });
      }
      
      const weekData = weeksMap.get(monTime);
      const day = resultDate.getDay(); // 0 is Sunday, 1 is Monday
      const displayJodi = res.jodi && res.jodi.length === 2 ? res.jodi : '**';
      
      if (day === 1) weekData.mon = displayJodi;
      else if (day === 2) weekData.tue = displayJodi;
      else if (day === 3) weekData.wed = displayJodi;
      else if (day === 4) weekData.thu = displayJodi;
      else if (day === 5) weekData.fri = displayJodi;
      else if (day === 6) weekData.sat = displayJodi;
      else if (day === 0) weekData.sun = displayJodi;
    });

    // Convert map values to array and sort descending by time
    const sortedWeeks = Array.from(weeksMap.values()).sort((a, b) => b.weekTime - a.weekTime);
    setChartData(sortedWeeks);
  };

  const handleMarketChange = (e) => {
    const marketId = e.target.value;
    setSelectedMarketId(marketId);
    const m = markets.find(x => x._id === marketId);
    if (m) setSelectedMarketName(m.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-[#210c2e] text-white p-4 flex items-center gap-3 shadow-md sticky top-0 z-40">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
        >
          <FaArrowLeft className="text-lg text-gray-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wide text-white flex-1">Jodi Chart</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-2">
        
        {/* MARKET SELECTOR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#380e4b] font-bold">
            <Calendar className="w-5 h-5" />
            <span>Select Market Chart</span>
          </div>
          
          <select 
            value={selectedMarketId}
            onChange={handleMarketChange}
            className="w-full sm:w-auto bg-gray-50 border border-gray-300 rounded-lg py-2.5 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#380e4b] font-bold cursor-pointer transition-all"
          >
            {markets.map((market) => (
              <option key={market._id} value={market._id}>{market.name}</option>
            ))}
          </select>
        </div>

        {/* CHART CONTAINER */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#380e4b] to-[#210c2e] p-4 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-yellow-400 tracking-wider uppercase">
              {selectedMarketName || 'Loading...'} CHART
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500 font-bold animate-pulse">
              Loading Chart Data...
            </div>
          ) : chartData.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-bold">
              No results found for this market.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs sm:text-sm uppercase tracking-wide border-b-2 border-gray-300">
                    <th className="p-3 border-r border-gray-200 font-bold">Week</th>
                    <th className="p-3 border-r border-gray-200 font-black">Mon</th>
                    <th className="p-3 border-r border-gray-200 font-black">Tue</th>
                    <th className="p-3 border-r border-gray-200 font-black">Wed</th>
                    <th className="p-3 border-r border-gray-200 font-black">Thu</th>
                    <th className="p-3 border-r border-gray-200 font-black">Fri</th>
                    <th className="p-3 border-r border-gray-200 font-black">Sat</th>
                    <th className="p-3 font-black text-red-600">Sun</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-purple-50 transition-colors">
                      <td className="p-3 sm:p-4 border-r border-gray-200 font-bold text-sm sm:text-sm text-gray-600 whitespace-nowrap">{row.weekStr}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.mon === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.mon}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.tue === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.tue}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.wed === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.wed}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.thu === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.thu}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.fri === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.fri}</td>
                      <td className={`p-3 sm:p-4 border-r border-gray-200 font-bold text-lg sm:text-xl ${row.sat === '**' ? 'text-red-500' : 'text-gray-800'}`}>{row.sat}</td>
                      <td className={`p-3 sm:p-4 font-bold text-lg sm:text-xl ${row.sun === '**' ? 'text-red-500' : 'text-red-600'}`}>{row.sun}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JodiChart;