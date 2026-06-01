import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Gift, 
  UserPlus, 
  Users, 
  AlertTriangle,
  RefreshCw,
  Save,
  ChevronDown,
  Wallet,
  Loader2
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin'
import toast from 'react-hot-toast';

export const BonusManagementPage = () => {
  // Bonus Settings States
  const [signupBonus, setSignupBonus] = useState(0);
  const [referrerBonus, setReferrerBonus] = useState(0);
  const [referredBonus, setReferredBonus] = useState(0);
  const [maxReferrals, setMaxReferrals] = useState(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [minDeposit, setMinDeposit] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(0);

  // Bonus Statistics States
  const [stats, setStats] = useState({
    totalBonusAwarded: 0,
    totalSignupBonus: 0,
    totalReferralBonus: 0,
    activeUsersCount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // --- Fetch Settings Logic ---
  const fetchSettings = async () => {
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getTransactionSettings.url,
        method: SummaryApi.getTransactionSettings.method
      });
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSignupBonus(data.signupBonus || 0);
        setReferrerBonus(data.referralBonus || 0); 
        setReferredBonus(data.referredBonus || 0);
        setMaxReferrals(data.maxReferrals || 0);
        setIsPercentage(data.isPercentage || false);
        setMinDeposit(data.minDeposit || 0);
        setMinWithdrawal(data.minWithdrawal || 0);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // --- Fetch Stats Logic ---
  const fetchBonusStats = async () => {
    setIsStatsLoading(true);
    try {
        const response = await AxiosAdmin({
            url: SummaryApi.getBonusStats.url,
            method: SummaryApi.getBonusStats.method
        });
        if (response.data.success) {
            setStats(response.data.stats);
        }
    } catch (error) {
        console.error("Error fetching bonus stats:", error);
    } finally {
        setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBonusStats();
  }, []);

  // --- Update Settings Logic ---
  const handalUpdateSettings = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateTransactionSettings.url,
        method: SummaryApi.updateTransactionSettings.method,
        data:{
          signupBonus,
          referralBonus: referrerBonus, 
          referredBonus,
          maxReferrals,
          isPercentage,
          minDeposit,      
          minWithdrawal    
        }
      })
      if (response.data.success) {
        toast.success(response.data.message || "Settings Updated Successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-sans text-gray-800">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
                <Settings className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[#1e293b]">Bonus & Limits Management</h1>
                <p className="text-sm text-gray-500">View performance and manage platform rules</p>
            </div>
        </div>
        <button 
            onClick={() => { fetchSettings(); fetchBonusStats(); }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Refresh Data"
        >
            <RefreshCw className={`w-5 h-5 ${isStatsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 1. Top Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Bonus Awarded</p>
            {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1"/> : (
                <p className="text-2xl font-black text-gray-900">₹{stats.totalBonusAwarded}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Signup Bonuses</p>
            {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1"/> : (
                <p className="text-2xl font-black text-gray-900">₹{stats.totalSignupBonus}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Referral Bonuses</p>
            {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1"/> : (
                <p className="text-2xl font-black text-gray-900">₹{stats.totalReferralBonus}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Users</p>
            {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1"/> : (
                <p className="text-2xl font-black text-gray-900">{stats.activeUsersCount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Settings (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.2fr] gap-8 items-start">
        
        {/* 2. Left Column: Bonus Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#7c3aed] p-6 text-white">
            <div className="flex items-center gap-3 mb-1">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-bold">App Rules & Configuration</h2>
            </div>
            <p className="text-purple-100 text-sm opacity-90">Modify platform incentives and transaction thresholds</p>
          </div>

          <div className="p-8">
            
            {/* Form Fields */}
            <div className="space-y-8">
              
              {/* --- SECTION 1: TRANSACTION LIMITS --- */}
              <div>
                <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2 text-sm uppercase tracking-widest mb-6">
                    <Wallet className="w-4 h-4 text-purple-600"/> Transaction Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Minimum Deposit */}
                    <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Deposit Amount</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                        <span className="px-4 text-gray-400 font-bold">₹</span>
                        <input 
                        type="number" 
                        value={minDeposit}
                        onChange={(e) => setMinDeposit(e.target.value)}
                        className="w-full py-3.5 pr-4 outline-none bg-transparent font-bold text-gray-800"
                        />
                    </div>
                    </div>

                    {/* Minimum Withdrawal */}
                    <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Withdrawal Amount</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                        <span className="px-4 text-gray-400 font-bold">₹</span>
                        <input 
                        type="number" 
                        value={minWithdrawal}
                        onChange={(e) => setMinWithdrawal(e.target.value)}
                        className="w-full py-3.5 pr-4 outline-none bg-transparent font-bold text-gray-800"
                        />
                    </div>
                    </div>
                </div>
              </div>

              {/* --- SECTION 2: BONUS SETTINGS --- */}
              <div>
                <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2 text-sm uppercase tracking-widest mb-6">
                    <Gift className="w-4 h-4 text-purple-600"/> Incentive Configuration
                </h3>

                <div className="space-y-8">
                    {/* Signup Bonus */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">New User Signup Reward</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                        <span className="px-4 text-gray-400 font-bold">₹</span>
                        <input 
                            type="number" 
                            value={signupBonus}
                            onChange={(e) => setSignupBonus(e.target.value)}
                            className="w-full py-3.5 outline-none bg-transparent font-bold text-gray-800"
                        />
                        <span className="px-4 text-gray-400 text-xs font-bold uppercase">Points</span>
                        </div>
                    </div>

                    {/* Toggle: Referral Bonus Type */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                        <label className="block text-base font-bold text-gray-900">Referral Reward Model</label>
                        <p className="text-xs text-gray-500 font-medium">Define if rewards are flat amounts or match/percentage based</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                        <button 
                            onClick={() => setIsPercentage(false)}
                            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${!isPercentage ? 'bg-[#7c3aed] text-white shadow-md' : 'text-gray-400 text-gray-500'}`}
                        >
                            FIXED
                        </button>
                        <button 
                            onClick={() => setIsPercentage(true)}
                            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${isPercentage ? 'bg-[#7c3aed] text-white shadow-md' : 'text-gray-400 text-gray-500'}`}
                        >
                            PERCENT
                        </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Referrer Bonus */}
                        <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Referrer Incentive</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                            <span className="px-4 text-gray-400 font-bold">{isPercentage ? '%' : '₹'}</span>
                            <input 
                            type="number" 
                            value={referrerBonus}
                            onChange={(e) => setReferrerBonus(e.target.value)}
                            className="w-full py-3.5 outline-none bg-transparent font-bold text-gray-800"
                            />
                        </div>
                        </div>

                        {/* Referred User Bonus */}
                        <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">New Invite Reward</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                            <span className="px-4 text-gray-400 font-bold">{isPercentage ? '%' : '₹'}</span>
                            <input 
                            type="number" 
                            value={referredBonus}
                            onChange={(e) => setReferredBonus(e.target.value)}
                            className="w-full py-3.5 outline-none bg-transparent font-bold text-gray-800"
                            />
                        </div>
                        </div>
                    </div>

                    {/* Maximum Referral Limit */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Max Referrals Per User</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                        <input 
                            type="number" 
                            value={maxReferrals}
                            onChange={(e) => setMaxReferrals(e.target.value)}
                            className="w-full py-3.5 px-4 outline-none bg-transparent font-bold text-gray-800"
                        />
                        <span className="px-4 text-gray-400 text-xs font-bold uppercase">Limit</span>
                        </div>
                    </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-12 pt-6 border-t border-gray-100">
              <button 
                onClick={fetchSettings} 
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm font-bold active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Form
              </button>
              
              <button 
                onClick={handalUpdateSettings} 
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isLoading ? 'Saving...' : 'Update Platform Rules'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Settings Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
          {/* Header */}
          <div className="bg-[#f97316] p-6 text-white text-center">
            <Gift className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h2 className="text-xl font-bold mb-1">Live Logic Preview</h2>
            <p className="text-orange-100 text-xs font-medium uppercase tracking-widest">How users see the platform</p>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Box 1: Transaction Limits Preview */}
            <div className="border-2 border-indigo-100 bg-indigo-50/30 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-900 mb-2 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Thresholds
              </h3>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li className="flex justify-between"><span>Min Deposit:</span> <span className="font-black text-indigo-900">₹{minDeposit || 0}</span></li>
                <li className="flex justify-between"><span>Min Withdraw:</span> <span className="font-black text-indigo-900">₹{minWithdrawal || 0}</span></li>
              </ul>
            </div>

            {/* Box 2: New User Signup */}
            <div className="border-2 border-orange-100 bg-orange-50/30 rounded-2xl p-5">
              <h3 className="font-bold text-orange-900 mb-2 text-sm">Join Incentive</h3>
              <p className="text-sm text-orange-700">
                A new user will receive <span className="font-black text-orange-900">{signupBonus || 0} points</span> as a welcome reward.
              </p>
            </div>

            {/* Box 3: Referral Scenario */}
            <div className="border-2 border-purple-100 bg-purple-50/30 rounded-2xl p-5">
              <h3 className="font-bold text-purple-900 mb-3 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Invite Logic
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-purple-100">
                    <p className="text-[10px] uppercase font-black text-purple-400 mb-1">Referrer Reward</p>
                    <p className="text-sm font-black text-purple-900">{referrerBonus || 0}{isPercentage ? '%' : ' Points'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm border border-purple-100">
                    <p className="text-[10px] uppercase font-black text-purple-400 mb-1">Referred Reward</p>
                    <p className="text-sm font-black text-purple-900">{referredBonus || 0}{isPercentage ? '%' : ' Points'}</p>
                </div>
              </div>
            </div>

            {/* Box 4: Referral Limits */}
            <div className="border-2 border-blue-100 bg-blue-50/30 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900 mb-2 text-sm">Guardrails</h3>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Individual users are limited to <span className="font-black text-blue-900">{maxReferrals || 0} successful invites</span>. Once reached, their referral code will be deactivated for rewards.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};