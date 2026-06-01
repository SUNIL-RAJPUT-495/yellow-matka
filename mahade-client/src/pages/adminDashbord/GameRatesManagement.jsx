import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const GameRatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRate, setNewRate] = useState({ category: 'Main Games', gameType: '', costAmount: 10, winningAmount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRates = async () => {
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getGameRates.url,
        method: SummaryApi.getGameRates.method
      });
      if (res.data.success) {
        setRates(res.data.rates);
      }
    } catch (error) {
      toast.error('Failed to fetch game rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleAddSubmit = async () => {
    if (!newRate.gameType || !newRate.winningAmount) {
      return toast.error("Game Type and Winning Amount are required");
    }
    
    setIsSubmitting(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.createGameRate.url,
        method: SummaryApi.createGameRate.method,
        data: newRate
      });
      if (res.data.success) {
        toast.success("Game Rate added successfully!");
        setRates([res.data.rate, ...rates]);
        setShowAddModal(false);
        setNewRate({ category: 'Main Games', gameType: '', costAmount: 10, winningAmount: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add game rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game rate?")) return;
    
    try {
      const res = await AxiosAdmin({
        url: `${SummaryApi.deleteGameRate.url}/${id}`,
        method: SummaryApi.deleteGameRate.method
      });
      if (res.data.success) {
        toast.success("Game Rate deleted!");
        setRates(rates.filter(r => r._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete game rate');
    }
  };

  const filteredRates = rates.filter(rate => {
    const matchesSearch = rate.gameType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || rate.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 md:p-10 font-sans text-gray-800 flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight mb-1">
              Game Rates Management
            </h1>
            <p className="text-gray-500 text-sm">
              Manage betting rates for main and starline games
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-medium py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add New Rate
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-gray-400 absolute left-3" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search game rates..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400 text-sm"
            />
          </div>

          <div className="relative min-w-[200px]">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-lg py-2.5 pl-4 pr-10 appearance-none outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm bg-white cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              <option value="Main Games">Main Games</option>
              <option value="Starline Games">Starline Games</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f97316] px-6 py-4 flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">
              Game Rates ({filteredRates.length})
            </h2>
          </div>

          {loading ? (
             <div className="p-16 flex items-center justify-center text-center">
               <span className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></span>
             </div>
          ) : filteredRates.length === 0 ? (
            <div className="p-16 flex items-center justify-center text-center">
              <p className="text-gray-500">No game rates found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Game Type</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Cost Value</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Winning Value</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate) => (
                    <tr key={rate._id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        <span className={`px-2.5 py-1 rounded text-xs ${rate.category === 'Main Games' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {rate.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-bold">{rate.gameType}</td>
                      <td className="p-4 text-sm text-gray-600">₹{rate.costAmount}</td>
                      <td className="p-4 text-sm text-green-600 font-bold">₹{rate.winningAmount}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(rate._id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="Delete Rate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-fadeIn">
            <h2 className="text-xl font-bold mb-5 text-[#0f172a] border-b pb-3">Add New Game Rate</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  value={newRate.category}
                  onChange={(e) => setNewRate({...newRate, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="Main Games">Main Games</option>
                  <option value="Starline Games">Starline Games</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Game Type</label>
                <input 
                  type="text" 
                  value={newRate.gameType} 
                  onChange={(e) => setNewRate({...newRate, gameType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  placeholder="e.g. Single Digit"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cost (₹)</label>
                  <input 
                    type="number" 
                    value={newRate.costAmount} 
                    onChange={(e) => setNewRate({...newRate, costAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50" 
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Winning (₹)</label>
                  <input 
                    type="number" 
                    value={newRate.winningAmount} 
                    onChange={(e) => setNewRate({...newRate, winningAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                    placeholder="e.g. 95"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 text-gray-600 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddSubmit} 
                  className="px-5 py-2.5 text-white font-medium bg-[#f97316] rounded-lg hover:bg-[#ea580c] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
