import React, { useState, useEffect } from 'react';
import {
  QrCode,
  AlertTriangle,
  X,
  Plus,
  User,
  RefreshCw,
  LayoutGrid,
  ImagePlus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Power,
  Pencil
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI'
import toast from 'react-hot-toast';;

export const UpiSettingsPage = () => {
  const [upiId, setUpiId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [qrImage, setQrImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [showError, setShowError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(false);

  const [upiList, setUpiList] = useState([]);
  const [fetchingList, setFetchingList] = useState(false);

  useEffect(() => {
    fetchUpiList();
  }, []);

  const fetchUpiList = async () => {
    setFetchingList(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getAllUpis.url,
        method: SummaryApi.getAllUpis.method,
      });
      if (response.data.success) {
        setUpiList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching UPI list:", error);
    } finally {
      setFetchingList(false);
    }
  };

  // 1. ACTIVE / INACTIVE TOGGLE FUNCTION (Fixed)
  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus; // Current status ka ulta kar do

    if (!window.confirm(`Are you sure you want to ${newStatus ? 'ACTIVATE' : 'DEACTIVATE'} this UPI?`)) return;

    try {
      const response = await AxiosAdmin({
        url: `${SummaryApi.setActiveUpi.url}/${id}`,
        method: SummaryApi.setActiveUpi.method,
        data: { isActive: newStatus } // Naya status backend ko bhejo
      });

      if (response.data.success) {
        toast.success(`UPI Successfully ${newStatus ? 'Activated' : 'Deactivated'}!`);
        fetchUpiList();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // 2. DELETE FUNCTION
  const handleDeleteUpi = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UPI?")) return;

    try {
      const response = await AxiosAdmin({
        url: `${SummaryApi.deleteUpi.url}/${id}`,
        method: SummaryApi.deleteUpi.method || 'DELETE',
      });
      if (response.data.success) {
        toast.success("UPI Deleted Successfully!");
        fetchUpiList();
      }
    } catch (error) {
      console.error("Error deleting UPI:", error);
      toast.error("Failed to delete UPI");
    }
  };

  // 3. EDIT BUTTON CLICK FUNCTION
  const handleEditClick = (item) => {
    setEditingId(item._id);
    setUpiId(item.upiId);
    setDisplayName(item.merchantName);
    setIsActive(item.isActive);

    if (item.qrCodeImage) {
      setPreviewUrl(`http://localhost:5000${item.qrCodeImage}`);
    } else {
      clearImage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUpiId("");
    setDisplayName("");
    setIsActive(false);
    clearImage();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setQrImage(null);
    setPreviewUrl(null);
  };

  const handleAddOrUpdateUpi = async (e) => {
    e.preventDefault();

    if (!upiId || !displayName) {
      toast.error("Please fill all text fields!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("upiId", upiId);
      formData.append("merchantName", displayName);
      formData.append("isActive", isActive);
      if (qrImage) formData.append("qrImage", qrImage);

      const url = editingId ? `${SummaryApi.updateUpi.url}/${editingId}` : SummaryApi.addUpi.url;
      const method = editingId ? SummaryApi.updateUpi.method || 'PUT' : SummaryApi.addUpi.method;

      const response = await AxiosAdmin({
        url: url,
        method: method,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(editingId ? "UPI Updated Successfully!" : "UPI Added Successfully!");
        handleCancelEdit();
        fetchUpiList();
      }
    } catch (error) {
      console.error(error);
      setShowError(true);
      setShowDebug(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-10 font-sans text-gray-800">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid className="text-[#ef4444] w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] tracking-tight">
            UPI Settings Management
          </h1>
        </div>
        <p className="text-gray-500 text-sm md:text-base">
          Configure and manage UPI payment options for your application
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Left Card: Add/Edit UPI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">

            {editingId && (
              <div className="absolute -top-3 left-6 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                Edit Mode
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              {editingId ? <Pencil className="w-6 h-6 text-yellow-500" /> : <Plus className="w-6 h-6 text-[#10b981]" />}
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Update UPI Profile" : "Add New UPI Info"}
              </h2>
            </div>

            <form onSubmit={handleAddOrUpdateUpi} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                <div className="relative flex items-center">
                  <QrCode className="w-5 h-5 text-gray-400 absolute left-3" />
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@ybl" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Merchant Name</label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 text-gray-400 absolute left-3" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Mahadev Book" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Set as active UPI</h3>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={loading} className={`flex-[2] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#e11d48] hover:bg-[#be123c]'}`}>
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {editingId ? "Update UPI" : "Save UPI"}</>}
                </button>
              </div>
            </form>
          </div>

          {/* Right Card: QR Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-6 h-6 text-[#3b82f6]" />
                <h2 className="text-xl font-bold text-gray-800">Scanner QR Code</h2>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Optional</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 relative h-[300px]">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  <div className="bg-white p-4 rounded-full mb-4 shadow-sm"><UploadCloud className="w-10 h-10 text-[#3b82f6]" /></div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Click or drag image to upload</h3>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col items-center relative h-[300px]">
                  <button onClick={clearImage} type="button" className="absolute top-4 right-4 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white p-2 rounded-full z-20"><Trash2 className="w-5 h-5" /></button>
                  <div className="w-full h-full p-6 flex items-center justify-center"><img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" /></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UPLOADED UPI TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">Saved UPI Profiles</h2>
            <button onClick={fetchUpiList} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${fetchingList ? 'animate-spin' : ''}`} /> Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold">QR Code</th>
                  <th className="p-4 font-semibold">Merchant Name</th>
                  <th className="p-4 font-semibold">UPI ID</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fetchingList && upiList.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading UPI Profiles...</td></tr>
                ) : upiList.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No UPI profiles found. Add one above.</td></tr>
                ) : (
                  upiList.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4">
                        {item.qrCodeImage ? (
                          <img src={`http://localhost:5000${item.qrCodeImage}`} alt="QR" className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><QrCode size={20} /></div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-800">{item.merchantName}</td>
                      <td className="p-4 text-gray-600 font-medium">{item.upiId}</td>

                      <td className="p-4 text-center">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase">Inactive</span>
                        )}
                      </td>

                      {/* --- CLEANED AND FIXED ACTION COLUMN --- */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                          {/* 1. Toggle Active/Inactive Button */}
                          <button
                            onClick={() => handleToggleActive(item._id, item.isActive)}
                            className={`p-2 rounded-lg transition-colors shadow-sm ${item.isActive
                                ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' // Active -> Deactivate (Red)
                                : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' // Inactive -> Activate (Green)
                              }`}
                            title={item.isActive ? "Click to Deactivate" : "Click to Activate"}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* 2. Edit Button */}
                          <button onClick={() => handleEditClick(item)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors shadow-sm" title="Edit UPI">
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* 3. Delete Button */}
                          <button onClick={() => handleDeleteUpi(item._id)} className="p-2 bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm" title="Delete UPI">
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};