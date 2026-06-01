import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaTelegramPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';

export const TelegramPage = () => {
  const navigate = useNavigate();
  const [telegramLink, setTelegramLink] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios({
        url: SummaryApi.getContact.url,
        method: SummaryApi.getContact.method
      });
      if (res.data.success && res.data.contact.telegram) {
        setTelegramLink(res.data.contact.telegram);
      }
    } catch (error) {
      console.error("Error fetching telegram link:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleJoin = () => {
    if (telegramLink) {
        // Ensure link starts with http or t.me
        let url = telegramLink;
        if (!url.startsWith('http') && !url.startsWith('t.me')) {
            url = `https://t.me/${url}`;
        }
      window.open(url, '_blank');
    } else {
      alert("Telegram link not available");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate("/")}
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm">
            Telegram Channel
          </h1>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-6'>
        <div className='bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]'>
            <div className='bg-blue-500 p-8 flex justify-center'>
                <div className='bg-white/20 p-4 rounded-3xl backdrop-blur-sm'>
                    <FaTelegramPlane size={80} color="white" />
                </div>
            </div>
            
            <div className='p-8 text-center'>
                <h2 className='text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight'>Join Our Telegram</h2>
                <p className='text-gray-500 text-sm mb-8 leading-relaxed font-medium'>
                    Get the fastest results, daily game tips, and important updates directly on your phone. JOIN our official channel now!
                </p>

                {loading ? (
                    <div className='flex justify-center py-4'>
                        <div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full'></div>
                    </div>
                ) : (
                    <button 
                        onClick={handleJoin}
                        disabled={!telegramLink}
                        className={`w-full py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all shadow-lg ${
                            telegramLink 
                            ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-200 active:scale-95' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {telegramLink ? 'Join Channel Now' : 'Link Not Available'}
                    </button>
                )}
                
                <p className='mt-6 text-[10px] text-gray-400 uppercase font-bold tracking-tighter'>
                    Trusted by 10k+ active players
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
