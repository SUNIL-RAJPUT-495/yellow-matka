import React, { useState, useEffect } from 'react';
import { Sidebar } from '../pages/userDeshbord/Sidebar';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import { requestForToken, onMessageListener } from '../common/firebase-config';
import Axios from '../utils/axios';
import SummaryApi from '../common/SummerAPI';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  useEffect(() => {
    // 1. Request FCM Token and Save to Backend
    const setupNotifications = async () => {
        const token = await requestForToken();
        if (token) {
            try {
                await Axios({
                    url: SummaryApi.saveFcmToken.url,
                    method: SummaryApi.saveFcmToken.method,
                    data: { fcmToken: token }
                });
                console.log("FCM Token saved to server");
            } catch (error) {
                console.error("Failed to save FCM token:", error);
            }
        }
    };

    setupNotifications();

    // 2. Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("Notification received in foreground:", payload);
        
        // 1. Show Toast
        toast.success(`${payload.notification.title}: ${payload.notification.body}`, {
            duration: 5000,
            position: 'top-right',
        });

        // 2. Show Native System Notification (Phone style)
        if (Notification.permission === "granted") {
            new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/logo192.png'
            });
        }
      })
      .catch((err) => console.log("Failed to receive foreground message:", err));
  }, []);

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50 relative'>

      <div className="hidden md:block h-full z-20">
        <Sidebar closeSidebar={() => {}} /> 
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
        <Sidebar closeSidebar={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* 4. MAIN CONTENT */}
      <main className='flex-1 overflow-y-auto pb-20 md:pb-0'>
        <div className='max-w-7xl mx-auto w-full h-full'>
          <Outlet context={{ toggleSidebar }} />
        </div>
      </main>


    </div>
  );
};

export default MainLayout;