import React, { useState } from 'react';
import { IoIosArrowRoundBack, IoMdAdd, IoMdRemove } from "react-icons/io";
import { FaHeadset } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: "How to add money to my wallet?",
    answer: "To add money, click on the 'Payment Method' or 'Deposit' section from the dashboard. Select your preferred method (UPI, Paytm, PhonePe, Bank Transfer, etc.), enter the amount you wish to add, and follow the simple on-screen instructions to complete the payment."
  },
  {
    question: "How to withdraw my winnings?",
    answer: "Go to the 'Withdrawal' page from your dashboard. Enter the amount you wish to withdraw and select your saved bank account or UPI ID. Your withdrawal request will be sent to the admin and processed shortly."
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is determined by the platform's current rules. Please navigate to the Withdrawal page, where the exact minimum required amount will be mentioned."
  },
  {
    question: "How do I play games?",
    answer: "Select any active market from the Home screen. Choose your desired game type (Single Digit, Jodi, Panel, etc.). Enter your lucky numbers and the points (amount) you want to bid, then click 'Submit' to place your bid."
  },
  {
    question: "My deposit is not showing in my wallet.",
    answer: "Usually, deposits are credited automatically within a few minutes. If your balance is not updated after waiting, please check your payment status. If the amount was deducted from your bank, contact our Support Chat with your Transaction ID for quick assistance."
  }
];

export const HelpSupport = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate(-1)}
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">
            Help & Support
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1 px-1">How can we help?</h2>
          <p className="text-gray-500 text-sm px-1">Find answers to common questions or reach out to our team.</p>
        </div>
        
        {/* FAQ Section */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left transition-all hover:shadow-md"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-5 py-4 flex items-center justify-between focus:outline-none"
              >
                <span className="font-semibold text-gray-800 pr-4 text-left">{faq.question}</span>
                <div className="text-mahadev shrink-0 bg-red-50 p-1.5 rounded-full">
                  {openIndex === index ? <IoMdRemove size={18} /> : <IoMdAdd size={18} />}
                </div>
              </button>
              
              <div 
                className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-48 pb-4 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 text-[15px] leading-relaxed border-t border-gray-100 pt-3">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Support Chat Box */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-200/50 rounded-full blur-xl"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-blue-200/50 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="bg-white max-w-[80px] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
              <FaHeadset className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Still need help?</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-[250px] mx-auto">
              Our support team is available 24/7 to assist you with any queries or issues.
            </p>
            <button 
              onClick={() => navigate('/ChatSupport')}
              className="w-full max-w-[250px] mx-auto bg-mahadev hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <FaHeadset className="text-white text-lg" />
              Chat with Support
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};
