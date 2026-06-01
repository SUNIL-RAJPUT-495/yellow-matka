import React, { useState, useEffect } from 'react'; 
import { 
  ArrowDownToLine, 
  Banknote, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Filter, 
  Loader2, 
  Check, 
  X,
  Inbox,
  CheckCircle, // Added icon
  XCircle      // Added icon
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from "../../utils/axiosAdmin"
import toast from 'react-hot-toast';

export const DepositRequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Deposits');
  const [showError, setShowError] = useState(false); 
  const [testEmptyState, setTestEmptyState] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState(null); // Button loader state

  // State to hold actual API data
  const [depositRequests, setDepositRequests] = useState([]);

  const fetchDepositRequests = async () => {
    setLoading(true);
    setShowError(false);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.allTransactions.url,
        method: SummaryApi.allTransactions.method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}` 
        }
      });
      
      setDepositRequests(response.data.transactions || []); 

    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositRequests();
  }, []);

  // ✨ APPROVE / REJECT LOGIC ✨
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this deposit?`)) return;

    setProcessingId(id);
    try {
      // NOTE: Ensure aapke backend API path update karein agar alag ho
      const response = await AxiosAdmin({
        url: SummaryApi.updateStatusAdmin.url,
        method: SummaryApi.updateStatusAdmin.method,
        data: {
          transactionId: id,
          status: newStatus
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.data || response.status === 200) {
        setDepositRequests(prev => prev.map(req => 
          (req._id === id || req.id === id) ? { ...req, status: newStatus } : req
        ));
        toast.success(`Deposit ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error(`Error updating status:`, error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtering Logic
  const filteredData = testEmptyState ? [] : depositRequests.filter((item) => {
    const matchesSearch = 
      (item?.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'All Deposits' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-10 font-sans text-gray-800">
      
      {/* 1. Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ArrowDownToLine className="text-[#10b981] w-8 h-8 stroke-[2.5]" />
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Deposit Requests Management</h1>
        </div>
        <p className="text-gray-500 text-sm">View, approve, and manage user deposit requests</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 2. Info Banner */}
        <div className="bg-[#f0fdf4] border-l-[4px] border-[#22c55e] rounded-r-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#166534] font-semibold mb-1">
            <Banknote className="w-5 h-5" />
            <span>Deposit Requests Only</span>
          </div>
          <p className="text-[#166534] text-sm ml-7">
            This page displays only deposit requests from users. Manage and process these deposits to update user balances.
          </p>
        </div>

        {/* 3. Error Banner */}
        {showError && (
          <div className="bg-[#fef2f2] border-l-[4px] border-[#ef4444] rounded-r-lg p-4 shadow-sm flex items-center gap-2 text-[#b91c1c]">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Failed to load deposit requests. Please try again.</span>
          </div>
        )}

        {/* 4. Search & Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Search & Filter Deposits</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email or UTR..." 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder-gray-400 text-sm"
              />
            </div>
            <button 
              onClick={fetchDepositRequests} 
              className="bg-[#10b981] hover:bg-[#059669] text-white font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveFilter('All Deposits')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'All Deposits' ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Filter className="w-4 h-4" /> All Deposits
            </button>
            <button 
              onClick={() => setActiveFilter('Pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'Pending' ? 'bg-[#fef9c3] text-[#ca8a04]' : 'bg-yellow-50 text-yellow-600 hover:bg-[#fef9c3]'}`}
            >
              <Loader2 className="w-4 h-4" /> Pending
            </button>
            <button 
              onClick={() => setActiveFilter('Approved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'Approved' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-green-50 text-green-600 hover:bg-[#dcfce7]'}`}
            >
              <Check className="w-4 h-4" /> Approved
            </button>
            <button 
              onClick={() => setActiveFilter('Rejected')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'Rejected' ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-red-50 text-red-600 hover:bg-[#fee2e2]'}`}
            >
              <X className="w-4 h-4" /> Rejected
            </button>
          </div>
        </div>

        {/* 5. Data View / Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px] flex flex-col">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <Loader2 className="w-10 h-10 text-[#10b981] animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Loading requests...</h3>
             </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
              <div className="bg-gray-50 p-5 rounded-full mb-4 border border-gray-100">
                <Inbox className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Deposit Requests Found</h3>
              <p className="text-gray-500 text-sm max-w-md">
                There are no deposit requests matching your current filter or search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Details</th>
                    <th className="px-6 py-4 font-semibold">UTR Number</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    {/* Added Action Column */}
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((deposit) => (
                    <tr key={deposit._id || deposit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{deposit.userId?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{deposit.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500">{deposit.transactionId || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">₹{deposit.amount || 0}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(deposit.createdAt || deposit.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center w-max gap-1.5
                          ${deposit.status === 'Pending' ? 'bg-[#fef9c3] text-[#ca8a04]' : 
                            deposit.status === 'Approved' ? 'bg-[#dcfce7] text-[#166534]' : 
                            'bg-[#fee2e2] text-[#991b1b]'}`}
                        >
                          {deposit.status === 'Pending' && <Loader2 className="w-3 h-3" />}
                          {deposit.status === 'Approved' && <Check className="w-3 h-3" />}
                          {deposit.status === 'Rejected' && <X className="w-3 h-3" />}
                          {deposit.status || 'Unknown'}
                        </span>
                      </td>

                      {/* ✨ ACTIONS COLUMN UI ✨ */}
                      <td className="px-6 py-4">
                        {deposit.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(deposit._id || deposit.id, 'Approved')}
                              disabled={processingId === (deposit._id || deposit.id)}
                              className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-lg transition-colors"
                              title="Approve Deposit"
                            >
                              {processingId === (deposit._id || deposit.id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(deposit._id || deposit.id, 'Rejected')}
                              disabled={processingId === (deposit._id || deposit.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-colors"
                              title="Reject Deposit"
                            >
                              {processingId === (deposit._id || deposit.id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs font-medium">Processed</div>
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