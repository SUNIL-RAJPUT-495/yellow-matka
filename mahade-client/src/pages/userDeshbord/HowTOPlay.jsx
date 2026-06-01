import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaPlayCircle, FaWallet, FaMoneyCheckAlt, FaGamepad, FaUserPlus, FaInfoCircle } from "react-icons/fa";
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';

export const HowTOPlay = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHowToPlay();
    }, []);

    const fetchHowToPlay = async () => {
        try {
            const res = await axios({
                url: SummaryApi.getHowToPlay.url,
                method: SummaryApi.getHowToPlay.method
            });
            if (res.data.success) {
                setContent(res.data.content);
            }
        } catch (error) {
            console.error("Error fetching how to play:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get icon based on heading keywords or index
    const getIcon = (heading, index) => {
        const h = heading.toLowerCase();
        if (h.includes('deposit') || h.includes('add')) return <FaWallet size={20} />;
        if (h.includes('withdraw')) return <FaMoneyCheckAlt size={20} />;
        if (h.includes('play') || h.includes('game')) return <FaGamepad size={20} />;
        if (h.includes('register') || h.includes('signup')) return <FaUserPlus size={20} />;
        return <FaInfoCircle size={20} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10 font-sans">
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
                        {content?.pageTitle || "How To Play"}
                    </h1>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-8 space-y-3">
                <h2 className="font-bold text-gray-800 ml-1 mb-4 text-xs uppercase tracking-widest border-b border-gray-200 pb-2">
                    Tutorials & Guides
                </h2>

                {loading ? (
                    <div className='py-20 flex flex-col items-center justify-center gap-3'>
                         <div className='animate-spin h-8 w-8 border-4 border-mahadev border-t-transparent rounded-full'></div>
                    </div>
                ) : content?.sections?.length > 0 ? (
                    content.sections.map((section, idx) => (
                        <button key={idx} className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-mahadev transition-all group active:scale-[0.98]">
                            <div className="bg-mahadev/10 p-3 rounded-full text-mahadev group-hover:bg-mahadev group-hover:text-white transition-colors">
                                {getIcon(section.heading, idx)}
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-gray-800 text-base">{section.heading}</h3>
                                <p className="text-[11px] text-gray-500 font-medium">{section.description}</p>
                            </div>
                            <FaPlayCircle size={24} className="text-gray-300 group-hover:text-mahadev transition-colors" />
                        </button>
                    ))
                ) : (
                    <div className='py-10 text-center text-gray-400 font-bold italic'>
                        No guides found.
                    </div>
                )}
            </div>
        </div>
    );
};