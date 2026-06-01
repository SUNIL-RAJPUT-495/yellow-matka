import React, { useState, useEffect } from 'react';
import {
  FaWallet, FaWhatsapp, FaStar, FaPlusCircle,
  FaRegClock, FaHome, FaBook, FaHeadset, FaListAlt,
  FaBars, FaChartBar
} from "react-icons/fa";
import { BiMoney, BiMoneyWithdraw } from 'react-icons/bi';
import { IoMdNotifications } from "react-icons/io";
import { useOutletContext, useNavigate } from 'react-router-dom';
import { fetchGDGame } from '../../utils/api';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';

const Home = () => {
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const balance = useSelector((state) => state.user.walletBalance);
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webName, setWebName] = useState('MAHADEV');
  const [whatsapp, setWhatsapp] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await axios({
        url: SummaryApi.getContact.url,
        method: SummaryApi.getContact.method
      });
      if (res.data.success) {
        if (res.data.contact.websiteName) setWebName(res.data.contact.websiteName);
        if (res.data.contact.whatsapp) setWhatsapp(res.data.contact.whatsapp);
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
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
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    loadAllGames();
  }, []);

  const handleWhatsappClick = () => {
    if (whatsapp) {
      // Numbers often come with + or spaces, clean them up for the wa.me link
      const cleanNum = whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNum}`, '_blank');
    } else {
      alert("WhatsApp number not available");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col">

      {/* HEADER SECTION */}
      <div className="bg-mahadev text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className='flex items-center gap-3'>
          <div
            onClick={toggleSidebar}
            className="md:hidden cursor-pointer p-1.5 hover:bg-white/20 rounded-md transition-colors"
          >
            <FaBars className="text-xl" />
          </div>
          <h1 className={`${webName.length > 10 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-black tracking-widest drop-shadow-sm uppercase truncate max-w-[150px] sm:max-w-[250px]`}>
            {webName}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div onClick={() => navigate('/add-funds')} className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 shadow-inner border border-white/10 text-white cursor-pointer hover:bg-white/30 transition whitespace-nowrap">
            <FaWallet className="text-yellow-300 text-base flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base">₹ {balance || 0}</span>
          </div>
          <span onClick={() => navigate('/NotificationsPage')}>
            <IoMdNotifications className="text-xl cursor-pointer hover:scale-110 transition-transform" />
          </span>
        </div>
      </div>

      {/* ACTION BUTTONS SECTION */}
      <div className="w-full sticky top-[70px] z-30 bg-gray-50 shadow-md">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-3 space-y-4">
          <div className='flex justify-between gap-3 sm:gap-4'>
            {/* Add Cash Button */}
            <button
              onClick={() => navigate('/add-funds')}
              className="flex-1 bg-green-500 flex items-center justify-center gap-2 p-3 sm:p-4 text-white rounded-xl shadow-md hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <FaPlusCircle className="text-xl" />
              <span className="font-bold text-sm sm:text-base">Add Cash</span>
            </button>
            {/* Withdraw Button */}
            <button
              onClick={() => navigate('/withdrawal')}
              className="flex-1 bg-red-500 flex items-center justify-center gap-2 p-3 sm:p-4 text-white rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <BiMoneyWithdraw className="text-2xl" />
              <span className="font-bold text-sm sm:text-base">Withdraw</span>
            </button>
          </div>
          <div className='flex justify-between gap-3 sm:gap-4'>
            {/* Support Channel Button */}
            <button
              onClick={() => navigate('/gali-desawar')}
              className="flex-1 bg-mahadev flex items-center justify-center gap-2 p-3 sm:p-4 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <FaHeadset className="text-blue-300 text-2xl" />
              <span className="font-bold tracking-wide text-sm sm:text-base">Gali Disawar</span>
            </button>
            {/* WhatsApp Redirect Button */}
            <button
              onClick={handleWhatsappClick}
              className="flex-1 bg-[#25D366] flex items-center justify-center gap-2 p-3 sm:p-4 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <FaWhatsapp className="text-white text-2xl" />
              <span className="font-bold tracking-wide text-sm sm:text-base">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* GAMES LIST SECTION (GALI DESAWAR STYLE) */}
      <div className="w-full flex-1 py-8 pb-28 mt-6 bg-[#ffffff]" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full md:max-w-5xl lg:max-w-6xl mx-auto px-4">

        {loading ? (
          <div className="text-center py-10 font-bold text-gray-500">
            Loading Live Games...
          </div>
        ) : gamesList.length === 0 ? (
          <div className="text-center py-10 font-bold text-gray-500">
            No Active Games Found.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {gamesList.map((game) => {
              const isClosed = game.status !== 'Active';
              return (
                <div key={game._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* Market Title Area */}
                  <div className="bg-[#fffdeb] px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
                    {/* Spacer for symmetry */}
                    <div className="w-8"></div>
                    <h2 className="text-center text-xl font-black text-[#1e293b] tracking-wider uppercase">
                      {game.name}
                    </h2>
                    {/* ✨ CHART ICON BUTTON */}
                    <button
                      onClick={() => navigate(`/jodi-chart?market=${game.name}&type=gd`)}
                      className="p-1.5 hover:bg-yellow-100/50 rounded-full transition-colors active:scale-90"
                    >
                      <FaChartBar className="text-[#fbc02d] text-base" />
                    </button>
                  </div>

                  {/* Info Area (Yellow Background) */}
                  <div className="p-5 bg-[#fbc02d] flex items-center justify-between">

                    {/* Details Column */}
                    <div className="space-y-2 text-left">
                      <div className={`font-black text-sm uppercase ${isClosed ? 'text-red-600' : 'text-green-700'}`}>
                        {isClosed ? 'Market Closed' : 'Market is Running'}
                      </div>

                      <div className="font-black text-3xl tracking-widest text-red-600">
                        {game.jodi_result && game.jodi_result !== '**' ? game.jodi_result : '* *'}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <FaRegClock className="text-sm" />
                        <span>Close : {game.close_time || '00:00 PM'}</span>
                      </div>
                    </div>

                    {/* Play Button Column */}
                    <div>
                      <button
                        onClick={() => navigate(`/gali-desawar/play/${game._id}`, { state: { game: game } })}
                        disabled={isClosed}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${isClosed
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-[#dca000] hover:bg-[#b88500] hover:shadow-lg active:scale-90'
                          }`}
                      >
                        {/* Play Triangle SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1 fill-white" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

    </div>
  )
}

export default Home;