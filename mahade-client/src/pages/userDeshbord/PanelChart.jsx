import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../../common/SummerAPI';

const getMonday = (d) => {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
};

const shortFormatNum = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getWeekRangeStr = (monday) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${shortFormatNum(monday)} - ${shortFormatNum(sunday)}`;
};

const DayCell = ({ data }) => {
  if (!data || data.jodi === '**' || !data.jodi) {
    return (
      <div className="flex items-center justify-center gap-1.5 p-1 min-w-[90px]">
         <span className="text-gray-300 font-bold">-</span>
      </div>
    );
  }

  const openDigits = data.open ? data.open.split('') : [];
  const closeDigits = data.close ? data.close.split('') : [];
  
  const paddedOpen = [...openDigits, ...Array(Math.max(0, 3 - openDigits.length)).fill('X')].slice(0, 3);
  const paddedClose = [...closeDigits, ...Array(Math.max(0, 3 - closeDigits.length)).fill('X')].slice(0, 3);

  return (
    <div className="flex items-center justify-center gap-1.5 p-1 min-w-[90px]">

      <div className="flex flex-col gap-1">
        {paddedOpen.map((num, i) => (
          <div key={`open-${i}`} className="w-6 h-6 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-800 bg-white">
            {num}
          </div>
        ))}
      </div>


      <div className="w-4 flex items-center justify-center text-base font-bold text-gray-900">
        {data.jodi}
      </div>


      <div className="flex flex-col gap-1">
        {paddedClose.map((val, i) => (
          <div key={`close-${i}`} className="w-6 h-6 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-800 bg-white">
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};

const PanelChart = () => {
  const navigate = useNavigate();
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
      const response = await fetch(SummaryApi.getGame.url);
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        setMarkets(data.data);
        setSelectedMarketId(data.data[0]._id);
        setSelectedMarketName(data.data[0].name);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchChartData = async (marketId) => {
    setLoading(true);
    try {
      const url = new URL(SummaryApi.getMarketResults.url);
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
    const weeksMap = new Map();
    
    results.forEach(res => {
      const resultDate = new Date(res.date);
      const monday = getMonday(resultDate);
      const monTime = monday.getTime();
      
      if (!weeksMap.has(monTime)) {
        weeksMap.set(monTime, {
          weekTime: monTime,
          weekRange: getWeekRangeStr(monday),
          mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null
        });
      }
      
      const weekData = weeksMap.get(monTime);
      const day = resultDate.getDay();
      
      const displayData = {
        open: res.open_panna || 'XXX',
        close: res.close_panna || 'XXX',
        jodi: res.jodi && res.jodi.length === 2 ? res.jodi : '**'
      };
      
      if (day === 1) weekData.mon = displayData;
      else if (day === 2) weekData.tue = displayData;
      else if (day === 3) weekData.wed = displayData;
      else if (day === 4) weekData.thu = displayData;
      else if (day === 5) weekData.fri = displayData;
      else if (day === 6) weekData.sat = displayData;
      else if (day === 0) weekData.sun = displayData;
    });

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
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      
      <div className="bg-[#2f0c4c] text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white text-[#2f0c4c] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-xl font-bold tracking-wide">Panel Chart</h1>
          <select 
            value={selectedMarketId}
            onChange={handleMarketChange}
            className="mt-1 bg-transparent text-sm font-medium border-b border-white/30 focus:outline-none pb-0.5 cursor-pointer text-center text-white outline-none"
            style={{ color: "white" }}
          >
            {markets.map((market) => (
              <option key={market._id} value={market._id} className="text-black">
                {market.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-2 md:p-4 overflow-x-auto mt-4">
        
        {loading ? (
           <div className="flex justify-center mt-20">
             <div className="animate-pulse text-[#2f0c4c] font-bold text-lg tracking-widest uppercase">
               LOADING {selectedMarketName}...
             </div>
           </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center mt-20">
            <div className="text-gray-500 font-bold text-lg uppercase">
              No results found for this market.
            </div>
          </div>
        ) : (
          <div className="min-w-max bg-white border border-gray-200 shadow-sm">
            <table className="w-full text-center border-collapse">
              
              <thead>
                <tr>
                  <th className="bg-gray-50 border border-gray-200 p-3 text-sm font-semibold text-gray-700 min-w-[150px]">
                    Week Range
                  </th>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <th key={idx} className="bg-[#2f0c4c] border border-[#482069] p-3 text-sm font-semibold text-white min-w-[90px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {chartData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                    
                    <td className="border border-gray-200 p-4 font-bold text-gray-700 text-sm whitespace-nowrap bg-gray-50/50">
                      {row.weekRange}
                    </td>
                    
                    <td className="border border-gray-200 p-1"><DayCell data={row.mon} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.tue} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.wed} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.thu} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.fri} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.sat} /></td>
                    <td className="border border-gray-200 p-1"><DayCell data={row.sun} /></td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PanelChart; 