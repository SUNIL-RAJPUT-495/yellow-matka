import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Flag, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

export const ReferralManagementPage = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const fetchReferrals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosAdmin({
                url: SummaryApi.getReferralStats.url,
                method: SummaryApi.getReferralStats.method
            });
            if (response.data.success) {
                setReferrals(response.data.data);
            } else {
                setError(response.data.message || "Failed to load referral data");
            }
        } catch (err) {
            console.error("Error fetching referrals:", err);
            setError("Internal server error while fetching referral data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, []);

    const filteredReferrals = referrals.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.mobile?.includes(searchTerm) ||
        r.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEarning = referrals.reduce((acc, curr) => acc + curr.totalEarned, 0);
    const totalReferrals = referrals.reduce((acc, curr) => acc + curr.referredCount, 0);

    return (
        <div className="min-h-screen bg-[#f9fafb] p-4 md:p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                
                {/* 1. Header Section */}
                <div className="flex flex-col sm:row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2.5 rounded-lg">
                            <Users className="w-8 h-8 text-[#ea580c]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b]">Referral Management</h1>
                            <p className="text-gray-500 text-sm">Track users and their referral performance</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Active Referrers</p>
                            <p className="text-2xl font-bold text-gray-900">{referrals.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Referred Users</p>
                            <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-full">
                            <Award className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Bonus Paid</p>
                            <p className="text-2xl font-bold text-gray-900">₹{totalEarning}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Search & Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search by name, mobile or referral code..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={fetchReferrals}
                            className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 flex-1 md:flex-none"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* 3. Error Banner */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">{error}</span>
                    </div>
                )}

                {/* Table Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Referrer User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Referral Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Referred</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Earned Bonus</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                                                <span className="text-sm font-medium">Crunching referral data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReferrals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users className="w-12 h-12 opacity-20" />
                                                <p className="text-lg font-semibold text-gray-500">No referrers found</p>
                                                <p className="text-sm">Try a different search term or check back later.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReferrals.map((referrer) => (
                                        <tr key={referrer._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{referrer.name}</span>
                                                    <span className="text-xs text-gray-500">{referrer.mobile}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-black uppercase border border-orange-100">
                                                    {referrer.referralCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-[#1e293b]">{referrer.referredCount}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Users</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-green-600">₹{referrer.totalEarned}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    referrer.referredCount > 10 ? 'bg-purple-100 text-purple-700' : 
                                                    referrer.referredCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {referrer.referredCount > 10 ? 'VIP Referrer' : 
                                                     referrer.referredCount > 0 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Pagination Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 mt-6 px-2">
                    <p className="font-medium">Showing {filteredReferrals.length} of {referrals.length} referrers</p>
                    <div className="flex items-center gap-1 mt-3 sm:mt-0">
                        <button disabled className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-bold text-xs uppercase">
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <button disabled className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-bold text-xs uppercase ml-2">
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};