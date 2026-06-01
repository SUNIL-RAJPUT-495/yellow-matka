import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { IoIosArrowRoundBack, IoIosArrowForward } from "react-icons/io";
import { FaHistory, FaTrophy, FaStar, FaClipboardList } from "react-icons/fa";

export const BidPage = () => {
    const navigate = useNavigate();
    
   
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
                    <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm">
                        HISTORY
                    </h1>
                </div>
            </div>

            {/* Main Content Container (Responsive Grid) */}
            <div className='max-w-4xl mx-auto px-4 mt-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    
                    {/* Card 1: Bid History */}
                    <div onClick={()=>navigate('/BidHistoryPage')} className='bg-white border-l-4 border-mahadev rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-mahadev p-3 rounded text-white'>
                                <FaHistory className="text-xl" />
                            </div>
                            <div>
                                <p className='font-extrabold text-gray-800 text-lg'>Bid History</p>
                                <p className='text-sm text-gray-500 font-medium'>View Your Market Bid History</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="text-gray-400 group-hover:text-mahadev group-hover:translate-x-1 transition-all" size={24} />
                    </div>

                    {/* Card 2: Game Result */}
                    <div onClick={()=>navigate("/GameResult")} className='bg-white border-l-4 border-red-700 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-red-700 p-3 rounded text-white'>
                                <FaTrophy className="text-xl" />
                            </div>
                            <div>
                                <p className='font-extrabold text-gray-800 text-lg'>Game Result</p>
                                <p className='text-sm text-gray-500 font-medium'>View Market Results</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" size={24} />
                    </div>

                    {/* Card 3: Starline Market */}
                    {/* <div className='bg-white border-l-4 border-yellow-500 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-yellow-100 p-3 rounded text-yellow-600'>
                                <FaStar className="text-xl" />
                            </div>
                            <div>
                                <p className='font-extrabold text-gray-800 text-lg'>Starline Market</p>
                                <p className='text-sm text-gray-500 font-medium'>View Your Bids History</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" size={24} />
                    </div>

                    {/* Card 4: Starline Market Result */}
                    {/* <div className='bg-white border-l-4 border-green-500 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-green-600 p-3 rounded text-white'>
                                <FaClipboardList className="text-xl" />
                            </div>
                            <div>
                                <p className='font-extrabold text-gray-800 text-lg'>Starline Result</p>
                                <p className='text-sm text-gray-500 font-medium'>View Market Results</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={24} />
                    </div> */} 
                    
                </div>
            </div>

        </div>
    )
}