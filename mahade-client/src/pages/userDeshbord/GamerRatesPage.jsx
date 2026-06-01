import React, { useState, useEffect } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';

const GamerRatesPage = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios({
        url: SummaryApi.getGameRates.url,
        method: SummaryApi.getGameRates.method
      });
      if (res.data.success) {
        setRates(res.data.rates);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate("/")}
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">
            Game Rate
          </h1>
        </div>
      </div>

      <div className='p-2'>
        {loading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-4 text-gray-400">
                <div className="animate-spin h-8 w-8 border-4 border-mahadev border-t-transparent rounded-full font-bold"></div>
                <p>Loading...</p>
             </div>
        ) : (
          rates.map((rate, index) => (
            <div key={index} className='bg-white m-2 flex items-center justify-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all p-4 cursor-pointer group hover:-translate-y-0.5'>
               <b className='text-gray-800'>{rate.gameType}</b> 
               <span className='text-gray-600'>{rate.costAmount?.toFixed(2)} ka</span>
               <b className='text-gray-950'>{rate.winningAmount}</b>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GamerRatesPage
