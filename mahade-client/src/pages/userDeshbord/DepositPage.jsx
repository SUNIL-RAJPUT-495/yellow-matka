import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaWallet, FaShieldAlt, FaInfoCircle, FaQrcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast';;

const DepositPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const balance = useSelector((state) => state.user.walletBalance);
  // States for manual payment process
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  // API se aane wale data ke liye naye states
  const [adminUpi, setAdminUpi] = useState('Loading...');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const [minDeposit, setMinDeposit] = useState(200);

  // Page load hote hi Active UPI + transaction limits
  useEffect(() => {
    fetchActiveUpi();
    const loadLimits = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getTransactionSettings.url,
          method: SummaryApi.getTransactionSettings.method,
        });
        if (res.data?.success && res.data?.data?.minDeposit != null) {
          setMinDeposit(Number(res.data.data.minDeposit) || 200);
        }
      } catch (e) {
        console.error('Transaction settings:', e);
      }
    };
    loadLimits();
  }, []);

  const fetchActiveUpi = async () => {
    try {
      const response = await Axios({
        url: SummaryApi.getActiveUpi.url,
        method: SummaryApi.getActiveUpi.method,
      });

      if (response.data.success && response.data.data) {
        setAdminUpi(response.data.data.upiId);
        // Agar database me image path hai, toh state me save karein
        if (response.data.data.qrCodeImage) {
          setQrCodeUrl(response.data.data.qrCodeImage);
        }
      } else {
        setAdminUpi("UPI Not Available");
      }
    } catch (error) {
      console.error("Fetch Active UPI Error:", error);
      setAdminUpi("UPI Not Available");
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  const blockInvalidChar = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };

  // Step 1: Proceed button click
  const handleProceed = () => {
    const n = Number(amount);
    if (!amount || n < minDeposit) {
      toast.error(`Please enter a valid amount (Minimum ₹${minDeposit})`);
      return;
    }
    // Directly go to IMB gateway
    handlePayment();
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await Axios({
        url: SummaryApi.createOrder.url,
        method: SummaryApi.createOrder.method,
        data: {
          amount: Number(amount)
        }
      });

      console.log("Gateway Response:", data);

      if (data.success && (data.payment_url || data.redirect_url || data.url)) {
        const paymentLink = data.payment_url || data.redirect_url || data.url;
        window.location.href = paymentLink;
      }
      else {
        throw new Error(data.message || "Failed to initiate payment. No URL received.");
      }

    } catch (error) {
      console.error("Payment Handler Error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Something went wrong.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Final Submit Request to Backend
  const handleSubmitDeposit = async () => {
    if (!utrNumber || utrNumber.length < 12) {
      toast.error("Please enter a valid 12-digit UTR/Transaction ID");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.addMoney.url,
        method: SummaryApi.addMoney.method,
        data: {
          amount: Number(amount),
          method: 'UPI',
          transactionId: utrNumber,
          accountDetails: adminUpi
        }
      });

      toast.success(response.data.message || "Deposit request submitted successfully!");
      navigate('/');

    } catch (error) {
      console.error("Deposit Error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">

      {/* 1. HEADER */}
      <div className="bg-[#2d0042] text-white px-4 sm:px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            className="text-xl sm:text-2xl cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => {
              if (showPaymentDetails) setShowPaymentDetails(false);
              else navigate(-1);
            }}
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase">Add Funds</h1>
        </div>

        <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner border border-white/20 backdrop-blur-sm">
          <FaWallet className="text-yellow-400 text-lg" />
          <span className="font-bold tracking-wide">₹ {balance || 0}</span> {/* Real wallet balance from Redux */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: MAIN DEPOSIT CARD */}
          <div className="lg:col-span-2 space-y-6">

            {/* Conditional Rendering: Show Amount Input OR Payment Details */}
            {!showPaymentDetails ? (
              // STEP 1: AMOUNT INPUT SECTION
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2d0042] opacity-5 rounded-bl-full pointer-events-none"></div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">Deposit Amount</h2>
                <p className="text-gray-500 mb-8 font-medium">Add money to your wallet to start playing securely.</p>

                <label className="block text-gray-700 text-lg font-bold mb-3">
                  Enter Amount (₹)
                </label>

                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onKeyDown={blockInvalidChar}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full text-left pl-14 pr-6 text-gray-800 text-3xl font-black py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-[#2d0042] focus:ring-4 focus:ring-[#2d0042]/10 transition-all shadow-inner"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 px-2">
                  <p className="text-gray-500 text-sm font-bold flex items-center gap-1">
                    <FaInfoCircle className="text-[#2d0042]" /> Min: ₹{minDeposit}
                  </p>
                  <p className="text-gray-500 text-sm font-bold">Max: ₹1,00,000</p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`font-black py-3 rounded-xl shadow-sm transition-all text-sm sm:text-base border-2 
                        ${amount === amt.toString()
                          ? 'bg-[#2d0042] text-white border-[#2d0042] scale-105 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d0042] hover:text-[#2d0042]'
                        }`}
                    >
                      + ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProceed}
                  className="w-full bg-gradient-to-r from-[#2d0042] to-[#4b006e] text-white font-black text-xl tracking-wide py-5 rounded-2xl mt-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all"
                >
                  PROCEED TO PAY
                </button>
              </div>

            ) : (

              // STEP 2: PAYMENT & UTR SUBMISSION SECTION
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden transition-all animate-fade-in">
                <h2 className="text-2xl sm:text-3xl font-black text-[#2d0042] mb-6 text-center">Complete Payment</h2>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300 text-center mb-8">
                  <p className="text-gray-600 font-bold mb-2">Scan QR or Copy UPI ID to pay</p>

                  <div className="flex justify-center mb-4">
                    {/* Yahan par image aur icon toggle hoga */}
                    <div className="w-40 h-40 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm p-2 overflow-hidden">
                      {qrCodeUrl ? (
                        // Dhyan de: Agar aapka backend localhost:5000 par hai, aur Axios baseURL set hai, 
                        // toh aap seedha 'http://localhost:5000' + qrCodeUrl likh sakte hain image src me.
                        <img
                          src={`http://localhost:5000${qrCodeUrl}`} // Apna backend URL check kar lein
                          alt="Admin QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaQrcode className="text-6xl text-gray-300" />
                      )}
                    </div>
                  </div>

                  <div className="bg-white py-3 px-4 rounded-xl shadow-sm border border-gray-100 inline-block">
                    <span className="text-gray-500 font-medium mr-2">UPI ID:</span>
                    {/* Yahan par dynamic UPI ID aayegi */}
                    <span className="font-black text-lg text-gray-800 tracking-wider">{adminUpi}</span>
                  </div>
                  <h3 className="text-3xl font-black text-green-600 mt-4">₹ {amount}</h3>
                </div>

                <label className="block text-gray-700 text-lg font-bold mb-3">
                  Enter 12-Digit UTR / Ref No.
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={utrNumber}
                  onKeyDown={blockInvalidChar}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 312345678901"
                  maxLength={12}
                  className="w-full text-center text-gray-800 text-2xl font-black py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-[#2d0042] focus:ring-4 focus:ring-[#2d0042]/10 transition-all shadow-inner mb-8"
                />

                <button
                  onClick={handleSubmitDeposit}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-xl tracking-wide py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & SECURITY */}
          <div className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-3xl border-t-8 border-[#2d0042] p-6 sm:p-8 shadow-xl">
              <h3 className="flex items-center gap-2 font-black text-gray-800 text-xl mb-6 border-b pb-4">
                <FaInfoCircle className="text-[#2d0042]" /> Instructions
              </h3>
              <ul className="space-y-5 text-gray-600 font-medium text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="text-[#2d0042] font-black bg-[#2d0042]/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                  Copy UPI ID or Scan QR and pay exactly <b>₹{amount || 'X'}</b> using PhonePe, GPay or Paytm.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#2d0042] font-black bg-[#2d0042]/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                  Copy the 12-digit UTR/Reference Number from the payment app.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#2d0042] font-black bg-[#2d0042]/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                  Enter the UTR above and click Submit Request. Balance will be updated in 5-10 minutes.
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#2d0042] to-[#1a0026] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
              <FaShieldAlt className="absolute -right-6 -bottom-6 text-8xl text-white/5" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <FaShieldAlt className="text-3xl text-green-400" />
                <h3 className="font-black text-xl tracking-wider">100% SECURE</h3>
              </div>
              <p className="text-white/80 text-sm font-medium leading-relaxed relative z-10">
                Your transactions are protected. In case of issues, contact support immediately.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DepositPage;