import React, { useState, useEffect } from 'react';
import { PlusCircle, Upload, Trash2, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const HowToPlayManager = () => {
  const [pageTitle, setPageTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHowToPlay();
  }, []);

  const fetchHowToPlay = async () => {
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getHowToPlay.url,
        method: SummaryApi.getHowToPlay.method
      });
      if (res.data.success) {
        const { content } = res.data;
        setPageTitle(content.pageTitle || '');
        setVideoUrl(content.videoUrl || '');
        setSections(content.sections || []);
      }
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: '', description: '' }]);
  };

  const handleRemoveSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleSave = async () => {
    if (!pageTitle) return toast.error("Page title is required");
    
    // Check if any section is empty
    const hasEmptySection = sections.some(s => !s.heading || !s.description);
    if (hasEmptySection) {
        return toast.error("Please fill all section headings and descriptions");
    }

    setIsSaving(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.updateHowToPlay.url,
        method: SummaryApi.updateHowToPlay.method,
        data: { pageTitle, sections, videoUrl }
      });
      if (res.data.success) {
        toast.success("How To Play content updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 flex justify-center items-start pt-12 font-sans pb-20">
      
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
              Manage How To Play Content
            </h1>
            <div className='bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold'>
               LIVE EDITOR
            </div>
        </div>

        {/* Page Title & Video */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2 uppercase tracking-wider">
              Overall Page Title
            </label>
            <input 
              type="text" 
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="e.g., Ultimate Guide to Our Games" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2 uppercase tracking-wider flex items-center gap-2">
              <Video className='w-4 h-4' /> Youtube Video URL
            </label>
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., https://youtube.com/watch?v=..." 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800 text-base"
            />
          </div>
        </div>

        {/* Sections Area */}
        <div className="mb-10">
          <div className='flex justify-between items-end mb-6'>
            <h2 className="text-[22px] font-bold text-[#0f172a] tracking-tight">
                Instructional Sections
            </h2>
            <span className='text-gray-400 text-sm'>{sections.length} Sections Added</span>
          </div>
          
          <div className='space-y-6 mb-8'>
            {sections.map((section, index) => (
              <div key={index} className='p-6 bg-gray-50 rounded-xl border border-gray-200 relative group animate-slideIn'>
                  <button 
                    onClick={() => handleRemoveSection(index)}
                    className='absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-md border border-red-100 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>

                  <div className='mb-4'>
                    <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Section Heading</label>
                    <input 
                       type="text" 
                       value={section.heading}
                       onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                       placeholder="e.g. Step 1: Login to your account"
                       className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold'
                    />
                  </div>

                  <div>
                     <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Detailed Description</label>
                     <textarea 
                        rows={3}
                        value={section.description}
                        onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                        placeholder="Explain this step in detail..."
                        className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none'
                     />
                  </div>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={handleAddSection}
            className="w-full py-4 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all font-bold uppercase text-xs tracking-widest"
          >
            <PlusCircle className="w-5 h-5" strokeWidth={2} />
            Append New Section
          </button>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200 text-lg uppercase tracking-wider"
        >
          {isSaving ? (
             <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          ) : (
            <Upload className="w-5 h-5" />
          )}
          {isSaving ? 'Processing...' : 'Publish Update'}
        </button>

      </div>
    </div>
  );
};
