import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  AlertTriangle, 
  Filter, 
  Check, 
  X, 
  Loader2 
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin'
import toast from 'react-hot-toast';;

export const WithdrawalRequestsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All Requests');
  const [showError, setShowError] = useState(false); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 

  const fetchWithdrawals = async () => {
    setLoading(true);
    setShowError(false);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getAllWithdrawals.url,
        method: SummaryApi.getAllWithdrawals.method
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Fetch Withdrawals Error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (transactionId, newStatus) => {
    const confirmAction = window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this withdrawal?`);
    if (!confirmAction) return;

    setActionLoading(transactionId);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateWithdrawalStatus.url,
        method: SummaryApi.updateWithdrawalStatus.method,
        data: {
          transactionId: transactionId,
          status: newStatus
        }
      });
      toast.success(response.data.message || `Withdrawal ${newStatus} successfully!`);
      // Update local state to reflect change without refetching all
      setTransactions(prev => 
        prev.map(t => t._id === transactionId ? { ...t, status: newStatus } : t)
      );
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error?.response?.data?.message || "Failed to update withdrawal status!");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtering Logic
  const filteredData = transactions.filter((item) => {
    if (activeFilter === 'All Requests') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-10 font-sans text-gray-800">
      
      {/* 1. Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Banknote className="text-[#ef4444] w-9 h-9" />
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Withdrawal Requests</h1>
        </div>
        <p className="text-gray-500 text-sm">Manage and process user withdrawal requests</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 2. Error Banner */}
        {showError && (
          <div className="bg-[#fef2f2] border-l-[4px] border-[#ef4444] rounded-r-lg p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#b91c1c]">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Failed to fetch withdraw requests. Please check connection.</span>
            </div>
            <button onClick={() => fetchWithdrawals()} className="text-sm font-bold text-[#b91c1c] hover:underline px-2 py-1 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* 3. Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Filter Requests</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['All Requests', 'Approved', 'Rejected', 'Pending'].map((filterItem) => (
              <button 
                key={filterItem}
                onClick={() => setActiveFilter(filterItem)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeFilter === filterItem 
                    ? filterItem === 'Approved' ? 'bg-green-500 text-white shadow-md' 
                    : filterItem === 'Rejected' ? 'bg-red-500 text-white shadow-md' 
                    : filterItem === 'Pending' ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-[#1e293b] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterItem === 'Approved' && <Check className="w-3.5 h-3.5" />}
                {filterItem === 'Rejected' && <X className="w-3.5 h-3.5" />}
                {filterItem}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Data View / Empty State */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
               <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-3" />
               <p className="text-gray-500 font-medium tracking-wide">Fetching secure requests...</p>
             </div>
          ) : filteredData.length === 0 ? (
            /* EMPTY STATE UI */
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-5 border border-gray-100 shadow-inner">
                <Banknote className="w-14 h-14 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Withdrawal Requests</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                There are no withdrawal requests matching "{activeFilter}". 
              </p>
            </div>
          ) : (
            /* DATA TABLE UI */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#f8f9fc] border-b border-gray-100 uppercase text-xs font-black tracking-widest text-[#1e293b]">
                  <tr>
                    <th className="px-6 py-5">Request ID</th>
                    <th className="px-6 py-5">User Info</th>
                    <th className="px-6 py-5">Method & Account</th>
                    <th className="px-6 py-5">Amount</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((withdraw) => (
                    <tr key={withdraw._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#ef4444] text-[13px]">{withdraw.transactionId}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{withdraw.userId?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{withdraw.userId?.mobile || 'No Mobile'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-700 bg-gray-100 w-max px-2 py-0.5 rounded text-[11px] mb-1 uppercase">{withdraw.method}</div>
                        <div className="text-[13px] text-gray-600 font-mono font-medium">{withdraw.accountDetails}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-800 text-base">₹{withdraw.amount}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-semibold whitespace-nowrap">
                        {new Date(withdraw.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center w-max gap-1.5 shadow-sm
                          ${withdraw.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                            withdraw.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                            'bg-red-100 text-red-700 border border-red-200'}`}
                        >
                          {withdraw.status === 'Approved' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          {withdraw.status === 'Rejected' && <X className="w-3.5 h-3.5 stroke-[3]" />}
                          {withdraw.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {withdraw.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                             {actionLoading === withdraw._id ? (
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                             ) : (
                               <>
                                <button 
                                  onClick={() => handleAction(withdraw._id, 'Approved')}
                                  title="Approve"
                                  className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-500 hover:text-white transition-all border border-green-200 hover:border-green-500 shadow-sm"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                                <button 
                                  onClick={() => handleAction(withdraw._id, 'Rejected')}
                                  title="Reject"
                                  className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-500 hover:text-white transition-all border border-red-200 hover:border-red-500 shadow-sm"
                                >
                                  <X className="w-4 h-4 stroke-[3]" />
                                </button>
                               </>
                             )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs text-center font-medium italic">Handled</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
};
