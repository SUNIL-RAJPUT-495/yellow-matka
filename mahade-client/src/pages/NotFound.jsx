import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-mahadev flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-white selection:text-mahadev">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Logo or Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-bounce">
            <AlertCircle size={48} className="text-white" />
          </div>
        </div>

        {/* 404 Text with Gradient */}
        <h1 className="text-[120px] md:text-[160px] font-black leading-none mb-4 select-none">
          <span className="bg-gradient-to-t from-white/20 to-white bg-clip-text text-transparent drop-shadow-2xl">
            404
          </span>
        </h1>

        {/* Message Container */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            PAGE NOT FOUND
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-md mx-auto">
            You are on the wrong path. Don't worry, click the button below to go back to the home page.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-12">
          <Link
            to="/"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-mahadev font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-mahadev/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            
            <Home size={20} className="relative z-10" />
            <span className="relative z-10">Go to Home</span>
          </Link>
        </div>

       
      </div>

      <style jsx="true">{`
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-subtle {
          animation: subtle-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
