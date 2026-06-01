import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCopy, FaShareAlt, FaGift } from "react-icons/fa";
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios'
import toast from 'react-hot-toast';;

export const ReferPage = () => {
    const navigate = useNavigate();

    const [referralCode, setReferralCode] = useState("LOADING...");
    const [copied, setCopied] = useState(false);

    const featchReferralCode = async () => {
        try {
            const response = await Axios({
                url: SummaryApi.getUserProfile.url,
                method: SummaryApi.getUserProfile.method,
            });

            const code = response.data?.user?.referralCode || response.data?.referralCode;

            if (code) {
                setReferralCode(code);
            } else {
                setReferralCode("NOT FOUND");
            }

        } catch (error) {
            console.error("Error fetching referral code:", error);
            setReferralCode("ERROR");
        }
    }
    useEffect(() => {
        featchReferralCode();
    }, []);
    const handleCopy = () => {
        if (referralCode === "LOADING..." || referralCode === "LOGIN REQUIRED" || referralCode === "ERROR") return;

        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (referralCode === "LOADING..." || referralCode === "LOGIN REQUIRED" || referralCode === "ERROR") {
            return toast.error("Please wait, referral code is loading or not available.");
        }

        const shareData = {
            title: 'Mahadev Matka',
            text: `Join Mahadev Matka using my referral code: ${referralCode}`,
            url: window.location.origin,
        };
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log("Error sharing:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10 font-sans">
            {/* Header Area */}
            <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
                <div className='flex items-center gap-4'>
                    <div
                        onClick={() => navigate(-1)}
                        className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
                    >
                        <IoIosArrowRoundBack size={30} color="white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">
                        Refer and Earn
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className='max-w-md mx-auto px-4 mt-10'>
                <div className='bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-gray-100'>

                    {/* Top Icon Area */}
                    <div className='bg-mahadev/10 p-5 rounded-full mb-4'>
                        <FaGift className='text-mahadev text-5xl' />
                    </div>

                    <h2 className='text-2xl font-black text-gray-800 mb-2'>Invite Your Friends</h2>
                    <p className='text-gray-500 font-medium mb-8'>
                        Share your referral code and earn exciting rewards when your friends join and play!
                    </p>

                    {/* Referral Code Box */}
                    <div className='w-full mb-6'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-2'>Your Referral Code</p>
                        <div className='flex items-center bg-gray-100 rounded-2xl p-2 border-2 border-dashed border-mahadev/30'>
                            <input
                                type="text"
                                readOnly
                                value={referralCode}
                                className={`bg-transparent flex-1 text-center font-black text-2xl outline-none ${referralCode.length > 10 ? 'text-lg text-gray-500' : 'text-mahadev'}`}
                            />
                            <button
                                onClick={handleCopy}
                                className='bg-mahadev text-white p-3 rounded-xl hover:bg-opacity-90 transition active:scale-95 disabled:opacity-50'
                                disabled={referralCode === "LOADING..." || referralCode === "LOGIN REQUIRED"}
                            >
                                <FaCopy size={18} />
                            </button>
                        </div>
                        {copied && <p className='text-green-600 text-xs font-bold mt-2 animate-bounce'>Code Copied!</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className='w-full space-y-3'>
                        <button
                            onClick={handleShare}
                            className='w-full bg-mahadev text-white font-bold py-4 rounded-2xl shadow-lg shadow-mahadev/20 flex items-center justify-center gap-3 hover:opacity-95 transition active:scale-95 disabled:opacity-50'
                            disabled={referralCode === "LOADING..." || referralCode === "LOGIN REQUIRED"}
                        >
                            <FaShareAlt /> Share Via Link
                        </button>
                    </div>

                </div>

                {/* Simple Instructions Section */}
                <div className='mt-8 px-2'>
                    <p className='font-bold text-gray-700 mb-4 border-b pb-2'>How it works?</p>
                    <div className='space-y-4'>
                        <div className='flex gap-4'>
                            <div className='bg-white shadow h-8 w-8 rounded-full flex items-center justify-center font-bold text-mahadev flex-shrink-0'>1</div>
                            <p className='text-sm text-gray-600 font-medium'>Invite your friends using your unique code.</p>
                        </div>
                        <div className='flex gap-4'>
                            <div className='bg-white shadow h-8 w-8 rounded-full flex items-center justify-center font-bold text-mahadev flex-shrink-0'>2</div>
                            <p className='text-sm text-gray-600 font-medium'>They register on Mahadev Matka.</p>
                        </div>
                        <div className='flex gap-4'>
                            <div className='bg-white shadow h-8 w-8 rounded-full flex items-center justify-center font-bold text-mahadev flex-shrink-0'>3</div>
                            <p className='text-sm text-gray-600 font-medium'>You get rewards instantly in your wallet!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};