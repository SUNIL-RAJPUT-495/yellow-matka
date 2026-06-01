import React from 'react'
import { NavLink } from 'react-router-dom';
import { IoMdHelp, IoMdSettings } from "react-icons/io";
import { TbMoneybag } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { GiBackwardTime } from "react-icons/gi";
import { FaCreditCard, FaChartPie, FaLanguage, FaTelegram, FaYoutube, FaUserShield } from "react-icons/fa";
import { IoBagHandle } from "react-icons/io5";
import { MdRoundaboutRight } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { ImNotification } from "react-icons/im";
import { FaHeadset } from "react-icons/fa";

export const AdminSideBar = ({ closeSidebar }) => {
    const menuSections = [
        {
            heading: "Main Menu",
            items: [
                { icons: CgProfile, itemsDetails: "Dashboard", link: "dashboard" },
            ]
        },
        {
            heading: "Management",
            items: [
                { icons: IoMdSettings, itemsDetails: "Add Game", link: "AddGame" },
                { icons: MdRoundaboutRight, itemsDetails: "Declare Results", link: "ResultDecleare" },
                { icons: GiBackwardTime, itemsDetails: "Bids", link: "AdminBid" },
                { icons: FaHeadset, itemsDetails: "Chat Support", link: "admin-chat" },
            ]
        },
            {
            heading: "Finance",
            items: [
                { icons: FaYoutube, itemsDetails: "Deposit", link: "Payment" },
                { icons: ImNotification, itemsDetails: "Withdrawals", link: "Withdraw" },
            ]
        },
        {
            heading: "Settings",
            items: [
                { icons: FaCreditCard, itemsDetails: "Upi Setting", link: "upi" },
                { icons: FaChartPie, itemsDetails: "Bonus Management", link: "bonus" },
                { icons: TbMoneybag, itemsDetails: "Website Settings", link: "contact" },
                { icons: IoBagHandle, itemsDetails: "Admin Referrals", link: "referal" },
                { icons: FaLanguage, itemsDetails: "Winners History", link: "WinnersHistory" },
                { icons: FaTelegram, itemsDetails: "NotificationSender", link: "NotificationSender" },
                
            ]
        },
    
    ];

    return (
        // Main Sidebar Background updated to Purple Gradient
       <div className='h-screen w-64 md:w-72 bg-mahadev flex flex-col shadow-2xl transition-all duration-300'>

            {/* Logo Section */}
            <div className='px-6 py-8 flex items-center gap-3 border-b border-white/10'>
                {/* Logo icon background flipped to white */}
                <div className='bg-white p-2 rounded-lg shadow-lg'>
                    <FaUserShield size={24} className="text-[#31004A]" />
                </div>
                <div>
                    <h2 className='text-lg font-black text-white tracking-tight leading-none'>ADMIN</h2>
                    <span className='text-[10px] font-bold text-gray-300 tracking-widest uppercase'>Control Panel</span>
                </div>
            </div>

            {/* Menu Items Section */}
            <div className='flex-1 overflow-y-auto py-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                        {/* Section Heading */}
                        <h3 className="px-4 mb-2 text-[11px] font-black text-white/50 uppercase tracking-[2px]">
                            {section.heading}
                        </h3>

                        {/* Section Links */}
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                                <NavLink
                                    key={itemIndex}
                                    to={item.link}
                                    onClick={closeSidebar}
                                    className={({ isActive }) => `
                                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-white text-[#31004A] shadow-lg shadow-black/20' // Active item is now White
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'} // Inactive items
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icons
                                                size={20}
                                                // Icon color logic flipped
                                                className={`transition-colors ${isActive ? 'text-[#31004A]' : 'text-white/60 group-hover:text-white'}`}
                                            />
                                            <span className={`text-sm font-semibold tracking-wide ${isActive ? 'text-[#31004A]' : ''}`}>
                                                {item.itemsDetails}
                                            </span>
                                            {isActive && (
                                                // Pulse dot color flipped to purple
                                                <div className="ml-auto w-1.5 h-1.5 bg-[#31004A] rounded-full animate-pulse"></div>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Logout Placeholder */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#31004A] text-xs font-black">
                        A
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-white truncate">System Admin</p>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Online</p>
                    </div>
                </div>
            </div>
        </div>
    )
}