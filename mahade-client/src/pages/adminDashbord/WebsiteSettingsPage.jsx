import React, { useState, useEffect } from 'react';
import { 
  Plus, Phone, MessageCircle, Mail, MapPin, Send, Save, 
  PlusCircle, Upload, Trash2, Video, Search, ChevronDown, 
  Settings, Lock, Globe, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi, { baseURL } from '../../common/SummerAPI';

const ContactItem = ({ icon: Icon, label, value, onChange, placeholder, colorClass }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className='flex items-center gap-3 mb-4'>
       <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
       </div>
       <span className='font-bold text-gray-700 uppercase text-xs tracking-wider'>{label}</span>
    </div>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm'
    />
  </div>
);

export const WebsiteSettingsPage = () => {
  // --- STATE FOR GENERAL & SECURITY ---
  const [websiteName, setWebsiteName] = useState('');
  const [logo, setLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // --- STATE FOR CONTACT ---
  const [contacts, setContacts] = useState({ whatsapp: '', phone1: '', phone2: '', telegram: '', email: '', address: '' });
  
  // --- STATE FOR HOW TO PLAY ---
  const [howToPlay, setHowToPlay] = useState({ pageTitle: '', videoUrl: '', sections: [] });
  
  // --- STATE FOR GAME RATES ---
  const [rates, setRates] = useState([]);
  const [rateSearch, setRateSearch] = useState('');
  const [rateCategory, setRateCategory] = useState('All Categories');
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRate, setNewRate] = useState({ category: 'Main Games', gameType: '', costAmount: 10, winningAmount: '' });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [contactRes, htpRes, ratesRes] = await Promise.all([
        AxiosAdmin({ url: SummaryApi.getContact.url, method: SummaryApi.getContact.method }),
        AxiosAdmin({ url: SummaryApi.getHowToPlay.url, method: SummaryApi.getHowToPlay.method }),
        AxiosAdmin({ url: SummaryApi.getGameRates.url, method: SummaryApi.getGameRates.method })
      ]);

      if (contactRes.data.success) {
        setContacts(contactRes.data.contact);
        setWebsiteName(contactRes.data.contact.websiteName || '');
        setLogo(contactRes.data.contact.logo || '');
      }
      if (htpRes.data.success) setHowToPlay(htpRes.data.content);
      if (ratesRes.data.success) setRates(ratesRes.data.rates);
      
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // --- GENERAL LOGIC ---
  const handleGeneralSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('websiteName', websiteName);
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Also append other contact fields if they are updated in this section
      // But typically name and logo are branding.
      // The backend updateContactSettings handles both.
      
      const res = await AxiosAdmin({ 
        url: SummaryApi.updateContact.url, 
        method: SummaryApi.updateContact.method, 
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        toast.success("Configuration Updated!");
        if (res.data.contact.logo) {
          setLogo(res.data.contact.logo);
          setLogoFile(null);
          setLogoPreview(null);
        }
      }
    } catch (error) { toast.error("Update failed"); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return toast.error("Please fill password fields");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSaving(true);
    try {
      const res = await AxiosAdmin({ 
        url: SummaryApi.changeAdminPassword.url, 
        method: SummaryApi.changeAdminPassword.method,
        data: {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }
      });
      if (res.data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- CONTACT LOGIC ---
  const handleContactSave = async () => {
    setIsSaving(true);
    try {
      const res = await AxiosAdmin({ url: SummaryApi.updateContact.url, method: SummaryApi.updateContact.method, data: contacts });
      if (res.data.success) toast.success("Contacts Updated!");
    } catch (error) { toast.error("Update failed"); }
    finally { setIsSaving(false); }
  };

  // --- HOW TO PLAY LOGIC ---
  const handleHtpSave = async () => {
    setIsSaving(true);
    try {
      const res = await AxiosAdmin({ url: SummaryApi.updateHowToPlay.url, method: SummaryApi.updateHowToPlay.method, data: howToPlay });
      if (res.data.success) toast.success("Guide Updated!");
    } catch (error) { toast.error("Update failed"); }
    finally { setIsSaving(false); }
  };

  const handleAddHtpSection = () => {
    setHowToPlay({ ...howToPlay, sections: [...howToPlay.sections, { heading: '', description: '' }] });
  };

  // --- GAME RATES LOGIC ---
  const handleRateAdd = async () => {
    if (!newRate.gameType || !newRate.winningAmount) return toast.error("Fill fields");
    setIsSaving(true);
    try {
      const res = await AxiosAdmin({ url: SummaryApi.createGameRate.url, method: SummaryApi.createGameRate.method, data: newRate });
      if (res.data.success) {
        toast.success("Rate Added!");
        setRates([res.data.rate, ...rates]);
        setShowRateModal(false);
      }
    } catch (error) { toast.error("Failed to add"); }
    finally { setIsSaving(false); }
  };

  const handleRateDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const res = await AxiosAdmin({ url: `${SummaryApi.deleteGameRate.url}/${id}`, method: SummaryApi.deleteGameRate.method });
      if (res.data.success) setRates(rates.filter(r => r._id !== id));
    } catch (error) { toast.error("Failed"); }
  };

  const filteredRates = rates.filter(r => {
    const mSearch = r.gameType.toLowerCase().includes(rateSearch.toLowerCase());
    const mCat = rateCategory === 'All Categories' || r.category === rateCategory;
    return mSearch && mCat;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-bold tracking-tighter text-gray-400">
       <div className='animate-spin h-10 w-10 border-4 border-[#3b49df] border-t-transparent rounded-full'></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20 font-sans">
      
      {/* 1. STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-[#3b49df] text-white px-8 py-4 shadow-lg flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold uppercase tracking-widest">Website Settings</h1>
           <p className="text-[10px] text-blue-100 uppercase">Manage Branding, Security, Contact & Guides</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-12">
        
        {/* SECTION 1: GENERAL BRANDING & SECURITY */}
        <section className="animate-fadeIn">
          <div className='flex items-center gap-4 mb-6'>
             <div className='h-8 w-1.5 bg-indigo-600 rounded-full'></div>
             <h2 className='text-2xl font-black text-gray-800 uppercase tracking-tight'>1. General Branding & Security</h2>
          </div>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Website Name Card */}
            <div className='bg-white p-8 rounded-2xl border border-gray-100 shadow-sm'>
               <div className='flex items-center gap-3 mb-6'>
                  <Globe className='text-indigo-600' size={24}/>
                  <h3 className='font-bold text-gray-700 uppercase text-sm tracking-widest'>Website Branding</h3>
               </div>
               <div className='space-y-4'>
                  <div>
                      <input 
                        type="text" 
                        value={websiteName}
                        onChange={(e) => setWebsiteName(e.target.value)}
                        className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-gray-700 mb-4'
                        placeholder="Enter Website Name"
                      />
                   </div>

                   <div>
                      <label className='block text-[10px] font-black text-gray-400 uppercase mb-2'>Website Logo</label>
                      <div className='flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl'>
                         <div className='w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner'>
                            {logoPreview ? (
                               <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                            ) : logo ? (
                               <img src={`${baseURL}/uploads/${logo}`} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                               <div className='text-[10px] font-black text-gray-300'>NO LOGO</div>
                            )}
                         </div>
                         <div className='flex-1'>
                            <label className='cursor-pointer flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-indigo-400 py-2 px-4 rounded-lg text-xs font-bold text-gray-500 transition-all'>
                               <Upload size={14}/>
                               <span>{logoFile ? 'Change Image' : 'Upload Logo'}</span>
                               <input 
                                 type="file" 
                                 className='hidden' 
                                 accept="image/*"
                                 onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                       setLogoFile(file);
                                       setLogoPreview(URL.createObjectURL(file));
                                    }
                                 }}
                               />
                            </label>
                            {logoFile && <p className='text-[9px] text-green-500 mt-1 font-bold uppercase'>Selected: {logoFile.name}</p>}
                         </div>
                      </div>
                   </div>

                   <button onClick={handleGeneralSave} disabled={isSaving} className='w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest flex items-center justify-center gap-2'>
                        <Save size={16}/> {isSaving ? 'Saving...' : 'Update Branding'}
                   </button>
               </div>
            </div>

            {/* Password Change Card */}
            <div className='bg-white p-8 rounded-2xl border border-gray-100 shadow-sm'>
               <div className='flex items-center gap-3 mb-6'>
                  <ShieldCheck className='text-red-500' size={24}/>
                  <h3 className='font-bold text-gray-700 uppercase text-sm tracking-widest'>Admin Security</h3>
               </div>
               <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                     <div>
                        <label className='block text-[10px] font-black text-gray-400 uppercase mb-2'>Current</label>
                        <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm' placeholder="****" />
                     </div>
                     <div>
                        <label className='block text-[10px] font-black text-gray-400 uppercase mb-2'>New Password</label>
                        <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm' placeholder="****" />
                     </div>
                     <div>
                        <label className='block text-[10px] font-black text-gray-400 uppercase mb-2'>Confirm</label>
                        <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm' placeholder="****" />
                     </div>
                  </div>
                  <button onClick={handlePasswordChange} disabled={isSaving} className='w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest flex items-center justify-center gap-2'>
                     <Lock size={16}/> {isSaving ? 'Updating...' : 'Change Password'}
                  </button>
               </div>
            </div>
          </div>
        </section>

        <hr className='border-gray-200'/>

        {/* SECTION 2: CONTACT MANAGEMENT */}
        <section className="animate-fadeIn">
          <div className='flex items-center gap-4 mb-6'>
             <div className='h-8 w-1.5 bg-green-500 rounded-full'></div>
             <h2 className='text-2xl font-black text-gray-800 uppercase tracking-tight'>2. Contact Management</h2>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6'>
            <ContactItem icon={MessageCircle} label="WhatsApp" colorClass="bg-green-100 text-green-600" value={contacts.whatsapp} onChange={(v) => setContacts({...contacts, whatsapp: v})} placeholder="WhatsApp Number" />
            <ContactItem icon={Send} label="Telegram" colorClass="bg-blue-100 text-blue-600" value={contacts.telegram} onChange={(v) => setContacts({...contacts, telegram: v})} placeholder="Telegram Channel Link" />
            <ContactItem icon={Phone} label="Support No 1" colorClass="bg-indigo-100 text-indigo-600" value={contacts.phone1} onChange={(v) => setContacts({...contacts, phone1: v})} placeholder="Phone Number" />
            <ContactItem icon={Phone} label="Support No 2" colorClass="bg-gray-100 text-gray-600" value={contacts.phone2} onChange={(v) => setContacts({...contacts, phone2: v})} placeholder="Alt Phone Number" />
            <ContactItem icon={Mail} label="Support Email" colorClass="bg-red-100 text-red-600" value={contacts.email} onChange={(v) => setContacts({...contacts, email: v})} placeholder="Email Address" />
          </div>

          <button onClick={handleContactSave} disabled={isSaving} className='bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-xl shadow-lg transition-all flex items-center gap-3 uppercase text-sm tracking-widest'>
            <Save size={18}/> {isSaving ? 'Saving...' : 'Save Contact Info'}
          </button>
        </section>

        <hr className='border-gray-200'/>

        {/* SECTION 3: HOW TO PLAY */}
        <section className="animate-fadeIn">
          <div className='flex items-center gap-4 mb-6'>
             <div className='h-8 w-1.5 bg-blue-500 rounded-full'></div>
             <h2 className='text-2xl font-black text-gray-800 uppercase tracking-tight'>3. How To Play Guide</h2>
          </div>

          <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6'>
             <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-50'>
                <div>
                   <label className='block text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest'>Page Main Title</label>
                   <input type="text" value={howToPlay.pageTitle} onChange={(e) => setHowToPlay({...howToPlay, pageTitle: e.target.value})} className='w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-700' />
                </div>
                <div>
                   <label className='block text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest'>Tutorial Video URL (Optional)</label>
                   <div className='flex items-center gap-2 bg-red-50/30 border border-red-100 rounded-xl px-4'>
                      <Video size={18} className='text-red-500'/>
                      <input type="text" value={howToPlay.videoUrl} onChange={(e) => setHowToPlay({...howToPlay, videoUrl: e.target.value})} className='w-full py-3 bg-transparent outline-none font-medium text-sm text-gray-600' placeholder="Paste Link Here" />
                   </div>
                </div>
             </div>

             <div className='space-y-6 mb-10'>
                {howToPlay.sections.map((s, idx) => (
                   <div key={idx} className='p-6 bg-white rounded-2xl border-2 border-gray-50 shadow-sm relative group hover:border-blue-100 transition-all'>
                      <button onClick={() => {
                        const updated = howToPlay.sections.filter((_, i) => i !== idx);
                        setHowToPlay({...howToPlay, sections: updated});
                      }} className='absolute top-5 right-5 text-gray-300 hover:text-red-500 transition-colors'><Trash2 size={18}/></button>
                      
                      <div className='grid grid-cols-1 gap-5'>
                         <div>
                            <label className='block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1'>Heading</label>
                            <input type="text" value={s.heading} onChange={(e) => {
                               const updated = [...howToPlay.sections];
                               updated[idx].heading = e.target.value;
                               setHowToPlay({...howToPlay, sections: updated});
                            }} placeholder="e.g. How to Deposit" className='w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-400 font-bold text-gray-800' />
                         </div>
                         <div>
                            <label className='block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1'>Detail</label>
                            <textarea value={s.description} onChange={(e) => {
                               const updated = [...howToPlay.sections];
                               updated[idx].description = e.target.value;
                               setHowToPlay({...howToPlay, sections: updated});
                            }} rows={2} placeholder="e.g. Learn how to add funds to wallet" className='w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-400 text-sm text-gray-500 resize-none font-medium' />
                         </div>
                      </div>
                   </div>
                ))}
             </div>

             <button onClick={handleAddHtpSection} className='w-full py-5 border-2 border-dashed border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-blue-400 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2'>
                <PlusCircle size={22}/> Add Tutorial Card
             </button>
          </div>

          <button onClick={handleHtpSave} disabled={isSaving} className='bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-blue-200 transition-all flex items-center gap-3 uppercase text-sm tracking-widest'>
            <Upload size={18}/> {isSaving ? 'Updating...' : 'Save & Publish Guide'}
          </button>
        </section>

        <hr className='border-gray-200'/>

        {/* SECTION 4: GAME RATES */}
        <section className="animate-fadeIn">
          <div className='flex items-center justify-between gap-4 mb-6'>
             <div className='flex items-center gap-4'>
                <div className='h-8 w-1.5 bg-orange-500 rounded-full'></div>
                <h2 className='text-2xl font-black text-gray-800 uppercase tracking-tight'>4. Game Rates Management</h2>
             </div>
             <button onClick={() => setShowRateModal(true)} className='bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm text-xs uppercase tracking-widest flex items-center gap-2'>
                <Plus size={16}/> New Rate
             </button>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
             <div className='p-4 bg-gray-50 border-b flex flex-col md:flex-row gap-4'>
                <div className='relative flex-1'>
                   <Search className='absolute left-3 top-2.5 text-gray-400' size={18}/>
                   <input type="text" value={rateSearch} onChange={(e) => setRateSearch(e.target.value)} placeholder="Search rates..." className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm' />
                </div>
                <select value={rateCategory} onChange={(e) => setRateCategory(e.target.value)} className='px-4 py-2 border rounded-lg outline-none text-sm font-bold bg-white'>
                   <option value="All Categories">All Categories</option>
                   <option value="Main Games">Main Games</option>
                   <option value="Starline Games">Starline Games</option>
                </select>
             </div>

             <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                   <thead>
                      <tr className='bg-[#f97316]/5 text-[#f97316] uppercase text-[10px] font-black tracking-widest'>
                         <th className='p-4'>Category</th>
                         <th className='p-4'>Game Type</th>
                         <th className='p-4'>Rate</th>
                         <th className='p-4 text-right'>Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredRates.map((r, i) => (
                        <tr key={i} className='border-b last:border-0 hover:bg-gray-50 transition-colors'>
                          <td className='p-4 text-xs font-bold text-gray-400 italic'>{r.category}</td>
                          <td className='p-4 text-sm font-black text-gray-800 uppercase'>{r.gameType}</td>
                          <td className='p-4 text-sm font-bold text-green-600 italic'>{r.costAmount} = {r.winningAmount}</td>
                          <td className='p-4 text-right'>
                            <button onClick={() => handleRateDelete(r._id)} className='text-red-400 hover:text-red-600 p-2'><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </section>

      </div>

      {/* RATE MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn">
             <h3 className='text-xl font-bold mb-6 border-b pb-4'>Add New Game Rate</h3>
             <div className='space-y-4'>
                <div>
                   <label className='text-xs font-bold uppercase text-gray-400'>Category</label>
                   <select value={newRate.category} onChange={(e) => setNewRate({...newRate, category: e.target.value})} className='w-full p-3 bg-gray-50 border rounded-xl font-bold'>
                      <option value="Main Games">Main Games</option>
                      <option value="Starline Games">Starline Games</option>
                   </select>
                </div>
                <div>
                   <label className='text-xs font-bold uppercase text-gray-400'>Game Type</label>
                   <input type="text" value={newRate.gameType} onChange={(e) => setNewRate({...newRate, gameType: e.target.value})} placeholder="e.g. Single Panna" className='w-full p-3 bg-gray-50 border rounded-xl font-bold' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                   <div>
                      <label className='text-xs font-bold uppercase text-gray-400'>Cost</label>
                      <input type="number" value={newRate.costAmount} onChange={(e) => setNewRate({...newRate, costAmount: e.target.value})} className='w-full p-3 bg-gray-50 border rounded-xl font-bold' />
                   </div>
                   <div>
                      <label className='text-xs font-bold uppercase text-gray-400'>Winning</label>
                      <input type="number" value={newRate.winningAmount} onChange={(e) => setNewRate({...newRate, winningAmount: e.target.value})} className='w-full p-3 bg-gray-50 border rounded-xl font-bold' />
                   </div>
                </div>
                <div className='flex gap-3 pt-6'>
                   <button onClick={() => setShowRateModal(false)} className='flex-1 py-3 bg-gray-100 font-bold rounded-xl text-gray-500'>Cancel</button>
                   <button onClick={handleRateAdd} disabled={isSaving} className='flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-100'>Save Rate</button>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
