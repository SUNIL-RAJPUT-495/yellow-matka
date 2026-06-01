import React from 'react'
import { AdminSideBar } from '../pages/adminDashbord/AdminSideBar'
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from "react-icons/fa"; 

export const AdminLayout = () => {
      const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
      const toggleSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
      };

  return (
   
    <div className='flex h-screen overflow-hidden bg-gray-50 relative'>

      <div className="hidden md:block h-full z-20">
        <AdminSideBar closeSidebar={() => {}} /> 
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden w-64 shadow-2xl h-full`}
      >
        <AdminSideBar closeSidebar={() => setIsMobileSidebarOpen(false)} />
      </div>

      <main className='flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0'>
        
        <div className="md:hidden sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button 
                onClick={toggleSidebar} 
                className="p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-mahadev"
            >
                <FaBars size={20} />
            </button>
            <h1 className="text-lg font-black text-gray-800 tracking-tight">ADMIN PANEL</h1>
        </div>


        <div className='max-w-7xl mx-auto w-full h-full'>
          <Outlet context={{ toggleSidebar }} />
        </div>
      </main>

    </div>

  )
}