import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMobileAlt, FaGift } from "react-icons/fa";
import { IoMdPersonAdd, IoMdContact } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoIosArrowRoundBack } from "react-icons/io";
import SummaryApi, { baseURL } from '../common/SummerAPI';
import Axios from '../utils/axios'
import toast from 'react-hot-toast';;

export const Sign = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        mobile: '',
        name: '',
        pass: '',
        refCode: ''
    });

    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState("");

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await Axios({
                    url: SummaryApi.getContact.url,
                    method: SummaryApi.getContact.method
                });
                if (res.data.success) {
                    setLogo(res.data.contact.logo);
                }
            } catch (error) {
                console.log("Error fetching logo", error);
            }
        };
        fetchLogo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!formData.mobile || !formData.name || !formData.pass) {
            toast.error("Mobile, Name aur Password daalna zaroori hai!");
            return;
        }

        setLoading(true);
        try {
            const res = await Axios({
                url: SummaryApi.creatUser.url,
                method: SummaryApi.creatUser.method,
                data: formData
            });

            toast.success(res.data?.message || "Account created successfully!");
            navigate('/Login');
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error?.response?.data?.message || "Sign up failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✨ h-screen aur overflow-hidden laga diya taaki scroller na aaye
        <div className='bg-mahadev bg-cover bg-center h-screen overflow-hidden flex items-center justify-center p-4'>

            {/* ✨ Padding aur width ko compact kiya hai */}
            <div className='bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-md p-6 relative border border-white/40 transform transition-all hover:shadow-3xl'>

                {/* Back Button - Thoda chota aur upar set kiya */}
                <button
                    onClick={() => navigate('/Login')}
                    className='absolute top-5 left-5 bg-gray-100/80 hover:bg-gray-200 text-[#31004A] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow active:scale-90 z-10'
                >
                    <IoIosArrowRoundBack size={26} />
                </button>

                {/* Header - Margin kam kiya */}
                <div className='mt-2 mb-6 text-center flex flex-col items-center'>
                    <div className='w-16 h-16 bg-white p-1 rounded-2xl shadow-md border border-gray-100 flex items-center justify-center mb-3 overflow-hidden'>
                        {logo ? (
                            <img src={`${baseURL}/uploads/${logo}`} alt="Website Logo" className="w-full h-full object-contain" />
                        ) : (
                            <div className='w-full h-full bg-gradient-to-br from-[#31004A] to-[#601a91] text-white flex items-center justify-center rounded-xl'>
                                <span className="text-[10px] font-black tracking-widest uppercase">Logo</span>
                            </div>
                        )}
                    </div>

                    <h2 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#2D144B] to-[#7f29c4] tracking-tight mb-1'>
                        Join Us Today
                    </h2>
                    <p className='text-gray-500 font-medium text-xs sm:text-sm'>
                        Create an account to get started
                    </p>
                </div>

                {/* Form Tag - Spacing kam karke space-y-3 kiya */}
                <form onSubmit={handleSignUp} className='w-full space-y-3.5'>

                    {/* Mobile Input */}
                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
                        <div className='bg-gradient-to-br from-[#31004A] to-[#51167a] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md transform group-focus-within:scale-105 transition-transform shrink-0'>
                            <FaMobileAlt size={18} />
                        </div>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-sm font-semibold text-gray-800 placeholder-gray-400'
                            placeholder='Mobile Number'
                            required
                        />
                    </div>

                    {/* Name Input */}
                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
                        <div className='bg-gradient-to-br from-[#31004A] to-[#51167a] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md transform group-focus-within:scale-105 transition-transform shrink-0'>
                            <IoMdContact size={20} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-sm font-semibold text-gray-800 placeholder-gray-400'
                            placeholder='Full Name'
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
                        <div className='bg-gradient-to-br from-[#31004A] to-[#51167a] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md transform group-focus-within:scale-105 transition-transform shrink-0'>
                            <RiLockPasswordFill size={18} />
                        </div>
                        <input
                            type="password"
                            name="pass"
                            value={formData.pass}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-sm font-semibold text-gray-800 placeholder-gray-400'
                            placeholder='Password'
                            required
                        />
                    </div>

                    {/* Referral Input */}
                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
                        <div className='bg-gray-800 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md transform group-focus-within:scale-105 transition-transform shrink-0'>
                            <FaGift size={18} />
                        </div>
                        <input
                            type="text"
                            name="refCode"
                            value={formData.refCode}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-sm font-semibold text-gray-800 placeholder-gray-400'
                            placeholder='Referral Code (Optional)'
                        />
                    </div>

                    {/* Submit Button - Height thodi kam ki (h-12) */}
                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-[#31004A] to-[#601a91] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-70 disabled:cursor-not-allowed'
                    >
                        <IoMdPersonAdd size={20} />
                        <span>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</span>
                    </button>

                </form>

                {/* Login Link - Margin top kam kiya */}
                <div className='mt-5 text-center'>
                    <p className='text-gray-500 font-medium text-sm'>
                        Already have an account?{' '}
                        <Link to="/Login" className='text-[#31004A] font-extrabold hover:text-[#601a91] hover:underline decoration-2 underline-offset-4 transition-colors'>
                            Log In
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};