import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux'; 
import { useFetchProfile } from '../../hooks/useFetchProfile'; 
import { RotateCw } from 'lucide-react'; 

const Profile = () => {
    const navigate = useNavigate();
    const fetchProfile = useFetchProfile(); 

    useEffect(() => {
        fetchProfile();
    }, []);

    // ✨ Redux Store se User Data aur Balance nikalna
    const { userData, walletBalance, wallet } = useSelector((state) => state.user);
    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
                <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center gap-4'>
                        <div
                            onClick={() => navigate('/')}
                            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
                        >
                            <IoIosArrowRoundBack size={30} color="white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-widest mt-1">
                            PROFILE
                        </h1>
                    </div>
                    
                    {/* Refresh Button */}
                    <button 
                        onClick={fetchProfile}
                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                        <RotateCw size={20} color="white" />
                    </button>
                </div>
            </div>

            {/* Profile Card Container */}
            <div className="max-w-md mx-auto mt-6 px-4">
                <div className='bg-white shadow-lg border border-gray-100 rounded-2xl p-6 flex flex-col items-center'>

                    {/* Avatar (Dynamic Initial) */}
                    <div className='bg-mahadev shadow-md rounded-full w-20 h-20 text-white text-3xl font-extrabold flex items-center justify-center mb-3'>
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {/* Dynamic Name & Mobile */}
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {userData?.name || "User Name"}
                    </h2>
                    <div className="mb-6 text-center">
                        <p className="text-gray-500 font-medium">
                            +91 {userData?.mobile || "0000000000"}
                        </p>
                        {userData?.email && (
                            <p className="text-gray-400 text-sm mt-1">{userData.email}</p>
                        )}
                    </div>

                    {/* Detailed Info Box */}
                    <div className='w-full bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-4'>

                        <div className='flex justify-between items-center border-b border-gray-200 pb-3'>
                            <div className="text-gray-600 font-medium">Total Balance</div>
                            <div className="font-bold text-lg text-green-600">
                                ₹ {walletBalance || 0}
                            </div>
                        </div>
                        <div className='flex justify-between items-center border-b border-gray-200 pb-3'>
                            <div className="text-gray-600 font-medium">Real / Bonus</div>
                            <div className="font-semibold text-gray-800 text-sm">
                                ₹{wallet?.realBalance ?? 0} / ₹{wallet?.bonusBalance ?? 0}
                            </div>
                        </div>

                        {/* Status Row */}
                        <div className='flex justify-between items-center border-b border-gray-200 pb-3'>
                            <div className="text-gray-600 font-medium">Status</div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                userData?.status === 'Blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {userData?.status || "Active"}
                            </div>
                        </div>

                        {/* Referral Row */}
                        <div className='flex justify-between items-center border-b border-gray-200 pb-3'>
                            <div className="text-gray-600 font-medium">Referral Code</div>
                            <div className="font-bold text-mahadev tracking-wider uppercase">
                                {userData?.referralCode || "N/A"}
                            </div>
                        </div>
                        {userData?.referredBy ? (
                            <div className='flex justify-between items-center border-b border-gray-200 pb-3'>
                                <div className="text-gray-600 font-medium">Referred By</div>
                                <div className="font-semibold text-gray-700 text-sm">
                                    {userData.referredBy}
                                </div>
                            </div>
                        ) : null}

                        {/* Member Since Row */}
                        <div className='flex justify-between items-center'>
                            <div className="text-gray-600 font-medium">Member Since</div>
                            <div className="font-semibold text-gray-700">
                                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                }) : "N/A"}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;