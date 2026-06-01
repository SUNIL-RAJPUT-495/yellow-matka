import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMobileAlt, FaUserShield } from "react-icons/fa"; // FaUserShield import kiya
import { IoMdPersonAdd, IoMdContact } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoIosArrowRoundBack } from "react-icons/io";
import SummaryApi from '../common/SummerAPI';
import Axios from '../utils/axios'
import toast from 'react-hot-toast';;

export const AdminSign = () => {
    const navigate = useNavigate();

    // 1. State mein 'role' add kar diya
    const [formData, setFormData] = useState({
        mobile: '',
        name: '',
        pass: '',
        role: 'admin' 
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validation mein role bhi check kar liya
        if (!formData.mobile || !formData.name || !formData.pass || !formData.role) {
            toast("Saari details (Mobile, Name, Password, Role) daalna zaroori hai!");
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
            navigate('/admin-login'); 
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error?.response?.data?.message || "Sign up failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-gray-900 bg-cover bg-center min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden'>
            
            {/* Background Pattern Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#601a91] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div className='bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-gray-700 transform transition-all z-10'>
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/admin-login')} 
                    className='absolute top-6 left-6 bg-gray-900 hover:bg-gray-700 text-gray-400 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm border border-gray-700 hover:text-white active:scale-90 z-20'
                >
                    <IoIosArrowRoundBack size={28} />
                </button>

                {/* Header */}
                <div className='flex flex-col items-center mb-8'> 
                    <div className='w-20 h-20 bg-gray-900 p-1.5 rounded-full shadow-lg border border-gray-700 flex items-center justify-center mb-4'>
                        <div className='w-full h-full bg-gradient-to-br from-[#31004A] to-[#601a91] text-white flex items-center justify-center rounded-full shadow-inner'>
                            <IoMdPersonAdd size={32} />
                        </div>
                    </div>
                    
                    <h2 className='text-3xl font-extrabold text-white tracking-tight mb-1 uppercase'>
                        Admin Signup
                    </h2>
                    <p className='text-gray-400 font-medium text-sm text-center'>
                        Register New Administrator
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} className='w-full space-y-5'>
                    
                    {/* Name Input */}
                    <div className='group flex items-center bg-gray-900/50 rounded-xl border border-gray-700 focus-within:border-blue-500 focus-within:bg-gray-900 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 p-1'>
                        <div className='bg-gray-800 text-gray-400 w-12 h-12 rounded-lg flex items-center justify-center group-focus-within:text-blue-500 group-focus-within:bg-gray-800 transition-colors shrink-0'>
                            <IoMdContact size={22} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-base font-semibold text-white placeholder-gray-500'
                            placeholder='Full Name'
                            required
                        />
                    </div>

                    {/* Mobile Input */}
                    <div className='group flex items-center bg-gray-900/50 rounded-xl border border-gray-700 focus-within:border-blue-500 focus-within:bg-gray-900 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 p-1'>
                        <div className='bg-gray-800 text-gray-400 w-12 h-12 rounded-lg flex items-center justify-center group-focus-within:text-blue-500 group-focus-within:bg-gray-800 transition-colors shrink-0'>
                            <FaMobileAlt size={20} />
                        </div>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-base font-semibold text-white placeholder-gray-500'
                            placeholder='Mobile Number'
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className='group flex items-center bg-gray-900/50 rounded-xl border border-gray-700 focus-within:border-blue-500 focus-within:bg-gray-900 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 p-1'>
                        <div className='bg-gray-800 text-gray-400 w-12 h-12 rounded-lg flex items-center justify-center group-focus-within:text-blue-500 group-focus-within:bg-gray-800 transition-colors shrink-0'>
                            <RiLockPasswordFill size={20} />
                        </div>
                        <input
                            type="password"
                            name="pass"
                            value={formData.pass}
                            onChange={handleChange}
                            className='bg-transparent border-none focus:outline-none w-full px-3 text-base font-semibold text-white placeholder-gray-500 tracking-wider'
                            placeholder='Password'
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className='w-full h-14 mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-[#601a91] text-white font-bold text-lg tracking-wider flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-70 disabled:cursor-not-allowed uppercase'
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <span>Sign Up Now</span>
                                <IoIosArrowRoundBack size={24} className="rotate-180" />
                            </>
                        )}
                    </button>
                    
                </form>
                
                {/* Login Link */}
                <div className='mt-8 text-center'>
                    <p className='text-gray-400 font-medium text-sm'>
                        Already have an account?{' '}
                        <Link to="/admin-login" className='text-blue-500 font-bold hover:text-blue-400 hover:underline decoration-2 underline-offset-4 transition-colors'>
                            Log In Here
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
};