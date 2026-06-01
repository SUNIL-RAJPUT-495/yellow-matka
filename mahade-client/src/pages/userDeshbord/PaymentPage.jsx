import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack, IoIosArrowForward } from "react-icons/io";
import { FaUniversity, FaWallet, FaMobileAlt, FaQrcode } from "react-icons/fa"; 


const paymentMethods = [
  { 
    id: 1, 
    title: "Bank Account", 
    desc: "Add your bank details", 
    icon: FaUniversity, 
    path: "/add-bank",
    bgColor: "bg-blue-600", 
    borderColor: "border-blue-500" 
  },
  { 
    id: 2, 
    title: "Paytm", 
    desc: "Connect Paytm number", 
    icon: FaWallet, 
    path: "/add-paytm",
    bgColor: "bg-sky-500", 
    borderColor: "border-sky-500" 
  },
  { 
    id: 3, 
    title: "PhonePe", 
    desc: "Connect PhonePe number", 
    icon: FaMobileAlt,  
    path: "/add-phonepe",
    bgColor: "bg-purple-500", 
    borderColor: "border-purple-500" 
  },
  { 
    id: 4, 
    title: "UPI Payment", 
    desc: "Google Pay, BHIM, etc.", 
    icon: FaQrcode, 
    path: "/add-upi",
    bgColor: "bg-green-700", 
    borderColor: "border-green-500" 
  }
];

export const PaymentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      
      {/* Header Area */}
      <div className="bg-mahadev text-white h-16 px-4 flex items-center shadow-md sticky top-0 z-50">
        <div className='flex items-center gap-4'>
          <div
            onClick={() => navigate("/")} 
            className='bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors'
          >
            <IoIosArrowRoundBack size={30} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-widest mt-1 drop-shadow-sm uppercase">
            Payment Methods
          </h1>
        </div>
      </div>

      
      <div className='max-w-3xl mx-auto px-4 mt-6'>
        
       
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          
          {/* Methods Map Function */}
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              onClick={() => navigate(method.path)}
              className={`bg-white border-l-4 ${method.borderColor} rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between cursor-pointer group hover:-translate-y-1`}
            >
              
              <div className='flex items-center gap-4'>
                {/* Method Logo/Icon */}
                <div className={`${method.bgColor} text-white p-3.5 rounded`}>
                  <method.icon className="text-2xl" />
                </div>
                
                {/* Method Title & Subtitle */}
                <div>
                  <p className='font-extrabold text-gray-800 text-lg tracking-wide'>{method.title}</p>
                  <p className='text-xs text-gray-500 font-medium mt-0.5'>{method.desc}</p>
                </div>
              </div>

              {/* Next Arrow Icon */}
              <IoIosArrowForward className="text-gray-400 group-hover:text-gray-800 group-hover:translate-x-1 transition-all" size={24} />
              
            </div>
          ))}

        </div>
      </div>

    </div>
  )
}