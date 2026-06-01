import React from 'react';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
const fetchNotifications = async () => {
  try {
    const response = await Axios({
      url: SummaryApi.getAllNotifications.url,
      method: SummaryApi.getAllNotifications.method,
    });
    if (response.data.success) {
      setNotifications(response.data.notifications);
    }
  } catch (error) {
    console.log(error);
  }
}
useEffect(() => {
  fetchNotifications();
}, []);
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      {/* Header Section */}
      <div className="bg-[#2c094a] text-white px-4 py-4 flex items-center shadow-md">
        
        {/* Back Button */}
        <button 
          className="bg-white text-[#2c094a] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          onClick={() => navigate(-1)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {/* Page Title */}
        <h1 className="text-xl font-bold ml-4 tracking-wide">Notifications</h1>
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-lg">No Notifications Yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {notifications.map((note, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2.5 rounded-full text-[#2c094a]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">{note.title}</h2>
                    <p className="text-gray-600 mt-1 leading-relaxed">{note.message}</p>
                    <span className="text-xs text-gray-400 mt-2 block font-medium">
                      {new Date(note.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;