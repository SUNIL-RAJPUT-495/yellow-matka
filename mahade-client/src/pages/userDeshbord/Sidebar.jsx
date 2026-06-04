import React from 'react';
import { IoMdContact, IoMdHelp } from "react-icons/io";
import { Link } from 'react-router-dom';
import { TbMoneybag } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { IoMdSettings } from "react-icons/io";
import { GiBackwardTime } from "react-icons/gi";
import { FaCreditCard } from "react-icons/fa";
import { FaWallet, FaChartPie, FaLanguage, FaTelegram, FaYoutube, FaShareAlt } from "react-icons/fa";
import { IoBagHandle } from "react-icons/io5";
import { CiLogin } from "react-icons/ci";
import { MdRoundaboutRight } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { ImNotification } from "react-icons/im";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/userSlice';

// 1. Yahan 'closeSidebar' prop receive karein
export const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    localStorage.removeItem("yellow_matka_user");
    localStorage.removeItem("yellow_matka");
    localStorage.removeItem("user_data");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    dispatch(logout());
    navigate("/login");
  }

  const items = [
    { icons: CgProfile, itemsDetails: "Profile", link: "/Profile" },
    { icons: IoMdSettings, itemsDetails: "My Bids", link: "BidPage" },
    { icons: GiBackwardTime, itemsDetails: "Passbook", link: "passbook" },
    { icons: FaCreditCard, itemsDetails: "Payment Method", link: "payment" }, 
    { icons: TbMoneybag, itemsDetails: "Gamer Rates", link: "GamerRatesPage" },
    { icons: IoBagHandle, itemsDetails: "Time Table", link: "time-table" },
    { icons: FaChartPie, itemsDetails: "Game Chart", link: "#" },
    { icons: FaTelegram, itemsDetails: "Telegram Channel", link: "/telegram" },
    { icons: IoMdHelp, itemsDetails: "Help & Support", link: "help-support" },
    { icons: MdRoundaboutRight, itemsDetails: "About", link: "about" },
    { icons: RiLockPasswordFill, itemsDetails: "Change Password", link: "ChangePassword" },
    { icons: FaYoutube, itemsDetails: "How To Play", link: "HowTOPlay" },
    { icons: ImNotification, itemsDetails: "Notice/Rules", link: "notice" },
    { icons: FaShareAlt, itemsDetails: "Refer & Earn", link: "refer" },
    { icons: CiLogin, itemsDetails: "Logout", link: "#", onClick: handleLogout },
  ];

  const balance = useSelector((state) => state.user.walletBalance);
  const userName = useSelector((state) => state.user.userData?.name);



  return (
    <div className='h-screen w-64 md:w-72 bg-white flex flex-col border-r border-gray-200 shadow-2xl'>
      
      <div className='bg-mahadev h-48 flex-shrink-0 flex justify-center items-center text-white shadow-md'>
        <div className='flex flex-col items-center'>
          <div className='p-2 rounded-full mb-2'>
            <IoMdContact size={60} />
          </div>
          <h2 className='font-bold text-lg tracking-wider mb-1 capitalize'>
            {userName?.trim() || 'User'}
          </h2>
          <div className='flex justify-center items-center gap-2 px-4 py-1'>
            <FaWallet size={14} />
            <p>Balance: ₹ {balance}</p>
          </div>
        </div>
      </div>

      {/* Yahan scrollbar hide karne ki classes add ki hain */}
      <div className='flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        {items.map((item, index) => (
          <Link 
            key={index} 
            to={item.link} 
            onClick={(e) => {
              closeSidebar();
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            }} // 2. Link par click karte hi sidebar band ho jayega
            className='flex items-center gap-4 px-8 py-3.5 hover:bg-gray-100 text-gray-700 hover:text-mahadev transition-colors duration-200 cursor-pointer border-b border-gray-50'
          >
            <item.icons size={20} className="text-mahadev opacity-80" />
            <span className='font-medium text-sm text-mahadev'>{item.itemsDetails}</span>
          </Link>
        ))}
      </div>

    </div>
  );
};