import React, { useState } from 'react';
import { Bell, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const NotificationSenderPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error("Title and Message are required");
      return;
    }

    setLoading(true);
    const notificationData = {
      title,
      message,
      sendToAllUsers: sendToAll
    };
    
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.sendNotification.url,
        method: SummaryApi.sendNotification.method,
        data: notificationData
      });

      if (res.data.success) {
        toast.success("Notification sent successfully!");
        setTitle('');
        setMessage('');
      } else {
        toast.error(res.data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 md:p-10 font-sans flex justify-center items-start text-gray-800">
      
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-12">
        
        <div className="flex items-center gap-3.5 mb-8">
          <Bell className="text-[#3b82f6] w-7 h-7" />
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Send User Notification</h1>
        </div>

        {/* 2. Notification Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Notification Title
          </label>
          <input 
            id="title"
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Important Update!" 
            className="w-full p-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-400 text-base"
          />
        </div>

        {/* 3. Message Content Textarea */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Message Content
          </label>
          <textarea 
            id="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message here..." 
            className="w-full p-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-400 text-base resize-none"
          />
        </div>

        {/* 4. Checkbox Section */}
        <div className="flex items-center gap-3 mt-8 mb-10">
          <input 
            id="sendToAll"
            type="checkbox" 
            checked={sendToAll}
            onChange={(e) => setSendToAll(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="sendToAll" className="text-sm font-medium text-gray-700 cursor-pointer">
            Send to all users (Global Notification)
          </label>
        </div>

        {/* 5. Send Button */}
        <button 
          onClick={handleSend}
          disabled={loading}
          className={`w-full bg-[#2563eb] hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-sm text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {loading ? 'Sending...' : 'Send Notification'}
        </button>

      </div>
    </div>
  );
};
