import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaWhatsapp } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdOutlineLogin } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/axios';
import SummaryApi, { baseURL } from '../common/SummerAPI';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice'
import toast from 'react-hot-toast';;

export const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        mobile: '',
        pass: ''
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

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formData.mobile || !formData.pass) {
            toast.error("Mobile Number aur Password daalna zaroori hai!");
            return;
        }

        setLoading(true);
        try {
            const res = await Axios({
                url: SummaryApi.loginUser.url,
                method: SummaryApi.loginUser.method,
                data: formData
            });

            if (res.data.success) {
                localStorage.setItem('yellow_matka', res.data.token);

                localStorage.setItem('yellow_matka_user', JSON.stringify(res.data.user));
                dispatch(setUser(res.data.user));

                toast.success("Login Successful!");
                navigate('/');
            } else {
                toast.error(res.data.message || "Login failed!");
            }

        } catch (error) {
            console.error("Login error:", error);
            toast.error(error?.response?.data?.message || "Invalid Mobile Number or Password!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-mahadev bg-cover bg-center min-h-screen flex items-center justify-center px-4 py-8 relative'>

            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

            <div className='bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-white/50 transform transition-all z-10'>

                <div className='flex flex-col items-center mb-6'>
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
                        Welcome Back
                    </h2>
                    <p className='text-gray-500 font-medium text-xs sm:text-sm'>
                        Enter your credentials to login
                    </p>
                </div>

                <form onSubmit={handleLogin} className='w-full space-y-3.5'>
                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-100 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
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

                    <div className='group flex items-center bg-gray-50 rounded-xl border border-gray-100 focus-within:border-[#31004A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#31004A]/10 transition-all duration-300 p-1'>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full h-12 mt-5 rounded-xl bg-gradient-to-r from-[#31004A] to-[#601a91] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-70 disabled:cursor-not-allowed'
                    >
                        <MdOutlineLogin size={20} />
                        <span>{loading ? 'LOGGING IN...' : 'LOGIN'}</span>
                    </button>
                </form>

                <div className='flex justify-center items-center gap-4 mt-6'>
                    <a href="https://wa.me/911234567890" className='bg-white text-green-500 p-2.5 rounded-full shadow border border-gray-100 hover:-translate-y-1 transition-all'>
                        <FaWhatsapp size={18} />
                    </a>
                    <a href="tel:+911234567890" className='bg-white text-blue-500 p-2.5 rounded-full shadow border border-gray-100 hover:-translate-y-1 transition-all'>
                        <IoCall size={18} />
                    </a>
                </div>

                <div className='mt-6 text-center border-t border-gray-100 pt-4'>
                    <p className='text-gray-500 font-medium text-xs sm:text-sm'>
                        Don't have an account?{' '}
                        <Link to="/sign" className='text-[#31004A] font-extrabold hover:underline transition-colors'>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};