import React, { useState, useEffect, useRef } from 'react';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaUserCircle,
  FaCheckDouble
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SummaryApi from '../../common/SummerAPI';
import Axios from '../../utils/axios';

const ChatSupport = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [webName, setWebName] = useState('MAHADEV');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: `Hello! Welcome to ${webName} Support. How can we help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const fetchSettings = async () => {
    try {
      const res = await axios({
        url: SummaryApi.getContact.url,
        method: SummaryApi.getContact.method
      });
      if (res.data.success && res.data.contact.websiteName) {
        setWebName(res.data.contact.websiteName);
        // Also update the initial message if it was default
        setMessages(prev => {
           if (prev.length === 1 && prev[0].sender === 'support' && prev[0].text.includes("Welcome to")) {
              return [{
                 ...prev[0],
                 text: `Hello! Welcome to ${res.data.contact.websiteName} Support. How can we help you today?`
              }];
           }
           return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await Axios({
        url: `${SummaryApi.getChatHistory.url}/admin`,
        method: SummaryApi.getChatHistory.method,
      });
      if (response.data.success) {
        if (response.data.data.length > 0) {
          setMessages(response.data.data.map(m => ({
            id: m._id,
            text: m.message,
            sender: m.isMine ? 'user' : 'support',
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      }
    } catch (error) {
      console.log("Error fetching chat:", error);
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchSettings();
    fetchChatHistory();
  }, []);

  // Real-time Polling: Fetch chat history every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatHistory();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const msgCopy = inputText;
    try {
      const res = await Axios({
        url: SummaryApi.sendMessage.url,
        method: SummaryApi.sendMessage.method,
        data: {
          message: msgCopy,
          receiver: "admin"
        }
      });

      if (res.data.success) {
        setInputText("");
        const newUserMsg = {
          id: res.data.data._id || Date.now(),
          sender: 'user',
          text: msgCopy,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, newUserMsg]);
        scrollToBottom();
      }
    } catch (error) {
      console.log("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (

    <div className="h-screen flex flex-col bg-gray-50 font-sans">

      <div className="bg-mahadev text-white p-3 flex items-center justify-between shadow-lg flex-none sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(-1)}>
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors active:scale-90">
            <FaArrowLeft className="text-lg mr-1" />
          </button>
          <FaUserCircle className="text-3xl text-gray-200" />
          <div className="leading-tight">
            <h1 className={`${webName.length > 10 ? 'text-sm' : 'text-base'} font-bold tracking-wide uppercase`}>{webName} CARE</h1>
            <p className="text-[11px] text-green-400 font-medium">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        <div className="flex justify-center mb-2">
          <span className="bg-white border border-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm font-medium">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
          >
            <div
              className={`relative px-4 py-2.5 text-[15px] shadow-sm ${msg.sender === 'user'
                  ? 'bg-mahadev text-white rounded-2xl rounded-tr-sm' // Mahadev Theme Bubble
                  : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100' // White Bubble
                }`}
            >
              <span className="break-words">{msg.text}</span>

              <div className="inline-flex items-center gap-1 ml-3 mt-1 float-right align-bottom">
                <span className={`text-[10px] pt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                  {msg.time}
                </span>
                {msg.sender === 'user' && (
                  <FaCheckDouble className="text-blue-300 text-[10px] pt-1" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-2 sm:p-3 flex items-center gap-2 pb-safe shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] flex-none">
        <form
          onSubmit={handleSend}
          className="flex-1 flex items-center gap-2 w-full"
        >
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 border border-transparent focus-within:border-mahadev/30 transition-all font-sans">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-transparent outline-none text-[15px] text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`p-3.5 rounded-full flex items-center justify-center transition-all shadow-sm flex-none ${inputText.trim() && !isSending
                ? 'bg-mahadev text-white hover:opacity-90 active:scale-95 shadow-md shadow-mahadev/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <FaPaperPlane className="text-sm ml-[-2px]" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatSupport;