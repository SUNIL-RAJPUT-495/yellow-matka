import { useNavigate } from 'react-router-dom';
import { FaListAlt, FaBook, FaHome, FaHeadset } from 'react-icons/fa'; 
import { BiMoney } from 'react-icons/bi';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div>
            <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] z-50">
        <ul className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">

          {/* My Bids */}
          <li onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-gray-500 hover:text-mahadev transition cursor-pointer group w-16">
            <FaListAlt className="text-xl mb-1 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-wide">My Bids</span>
          </li>

          {/* Passbook */}
          <li onClick={() => navigate('/passbook')} className="flex flex-col items-center justify-center text-gray-500 hover:text-mahadev transition cursor-pointer group w-16">
            <FaBook className="text-xl mb-1 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-wide">Passbook</span>
          </li>

          {/* Home */}
          <li onClick={() => navigate('/') } className="flex flex-col items-center justify-center text-mahadev cursor-pointer w-16 -mt-2">
            <div className="bg-mahadev/10 p-2 rounded-full mb-0.5">
              <FaHome className="text-2xl" />
            </div>
            <span className="text-[11px] font-black tracking-wide">Home</span>
          </li>

          {/* Funds */}
          <li onClick={() => navigate('/wallet')} className="flex flex-col items-center justify-center text-gray-500 hover:text-mahadev transition cursor-pointer group w-16">
            <BiMoney className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-wide">Funds</span>
          </li>

          {/* Support */}
          <li onClick={() => navigate('/ChatSupport')} className="flex flex-col items-center justify-center text-gray-500 hover:text-mahadev transition cursor-pointer group w-16">
            <FaHeadset className="text-xl mb-1 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-wide">Support</span>
          </li>

        </ul>
      </footer>
        </div>
    )
}

export default Footer;