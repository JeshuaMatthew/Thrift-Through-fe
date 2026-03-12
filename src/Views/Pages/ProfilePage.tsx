import { useState, useEffect } from 'react';
import { useAuth } from '../../Utils/Hooks/AuthProvider';
import { AuthService } from '../../Services/AuthServices';
import { UserService } from '../../Services/UserServices';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Award, 
  Trophy,
  Edit2, 
  Trash2, 
  LogOut, 
  X,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import type { User } from '../../Types/User';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth(); // We might need to refresh context user after edit
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(user);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    phonenum: '',
    profilepicturl: '',
    bannerimgurl: ''
  });

  const authService = new AuthService();
  const userService = new UserService();

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getMyProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullname: profileData.fullname || '',
        username: profileData.username || '',
        email: profileData.email || '',
        phonenum: profileData.phonenum || '',
        profilepicturl: profileData.profilepicturl || '',
        bannerimgurl: profileData.bannerimgurl || ''
      });
    }
  }, [profileData]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await authService.updateProfile(formData);
      if (response.success && response.data) {
        setProfileData(response.data);
        setIsEditModalOpen(false);
        // Normally we'd also update the AuthProvider context user, but it's mock based
        // A full page reload or proper context update mechanism helps here. 
        // We'll just alert for now.
        alert("Profil berhasil diperbarui!");
      } else {
        alert(response.message);
      }
    } catch (error) {
       console.error("Gagal update profil:", error);
       alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profileData?.userid) return;
    setIsSaving(true);
    try {
      const response = await userService.deleteOwnData(profileData.userid);
      if (response.success) {
        alert(response.message);
        await authService.logout();
        navigate('/');
        window.location.reload(); // Force full refresh to clear context
      } else {
         alert(response.message);
      }
    } catch (error) {
       console.error("Gagal hapus akun:", error);
    } finally {
       setIsSaving(false);
       setIsDeleteModalOpen(false);
    }
  };

  if (isLoading || !profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  const defaultBanner = "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6";
  const defaultProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullname)}&background=random`;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pt-16 pb-20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 pt-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Banner */}
          <div className="h-48 md:h-64 relative bg-slate-800">
             <img 
               src={profileData.bannerimgurl || defaultBanner} 
               alt="Banner" 
               className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-10">
             {/* Profile Header (Pic & Buttons) */}
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20 md:-mt-24 mb-8 relative z-10">
                <div className="flex items-end gap-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-slate-900 overflow-hidden shadow-xl bg-slate-800 shrink-0">
                         <img 
                            src={profileData.profilepicturl || defaultProfile} 
                            alt={profileData.fullname} 
                            className="w-full h-full object-cover"
                         />
                    </div>
                    <div className="mb-2 hidden md:block">
                        <h1 className="text-3xl font-black text-white tracking-tight">{profileData.fullname}</h1>
                        <p className="text-indigo-400 font-medium">@{profileData.username || 'pengguna'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                       onClick={() => setIsEditModalOpen(true)}
                       className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25"
                    >
                       <Edit2 size={16} /> Edit Profil
                    </button>
                    <button 
                       onClick={() => setIsDeleteModalOpen(true)}
                       className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold transition-all duration-300"
                    >
                       <Trash2 size={16} /> Hapus
                    </button>
                </div>
             </div>
             
             {/* Mobile Name Display */}
             <div className="md:hidden mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">{profileData.fullname}</h1>
                <p className="text-indigo-400 font-medium">@{profileData.username || 'pengguna'}</p>
             </div>

             {/* Details Layout */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Left Column: Stats */}
                 <div className="space-y-4">
                     <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                             <Trophy size={24} />
                         </div>
                         <div>
                             <p className="text-sm text-slate-400 font-medium">Rank</p>
                             <p className="text-xl font-bold text-white">{profileData.userrank || 'Member'}</p>
                         </div>
                     </div>
                     <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <Award size={24} />
                         </div>
                         <div>
                             <p className="text-sm text-slate-400 font-medium">Points</p>
                             <p className="text-xl font-bold text-white">{profileData.userpoint?.toLocaleString('id-ID') || 0}</p>
                         </div>
                     </div>
                 </div>

                 {/* Right Column: Info */}
                 <div className="md:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-white/5 space-y-6">
                     <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">Informasi Akun</h3>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                             <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                                <Mail size={14} /> Email
                             </p>
                             <p className="text-base font-medium text-slate-200">
                                {profileData.email || 'Belum diatur'}
                             </p>
                         </div>
                         <div>
                             <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                                <Phone size={14} /> Nomor Telepon
                             </p>
                             <p className="text-base font-medium text-slate-200">
                                {profileData.phonenum || 'Belum diatur'}
                             </p>
                         </div>
                         <div>
                             <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                                <UserIcon size={14} /> ID Pengguna
                             </p>
                             <p className="text-base font-medium text-slate-400 font-mono">
                                #{profileData.userid}
                             </p>
                         </div>
                     </div>
                 </div>
             </div>

          </div>
        </motion.div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
               onClick={() => !isSaving && setIsEditModalOpen(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
               <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Edit Profil</h2>
                  <button 
                    onClick={() => !isSaving && setIsEditModalOpen(false)}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
               </div>
               
               <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Lengkap */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 block">Nama Lengkap</label>
                           <input 
                              type="text" 
                              name="fullname"
                              required
                              value={formData.fullname}
                              onChange={handleEditChange}
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 block">Username</label>
                           <input 
                              type="text" 
                              name="username"
                              required
                              value={formData.username}
                              onChange={handleEditChange}
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 block">Email</label>
                           <input 
                              type="email" 
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleEditChange}
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 block">Nomor Telepon</label>
                           <input 
                              type="tel" 
                              name="phonenum"
                              value={formData.phonenum}
                              onChange={handleEditChange}
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>
                     </div>

                     <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-white">Media Links</h3>
                        {/* PFP Link */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                               <Camera size={14} /> URL Foto Profil
                           </label>
                           <input 
                              type="url" 
                              name="profilepicturl"
                              value={formData.profilepicturl}
                              onChange={handleEditChange}
                              placeholder="https://..."
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>
                        {/* Banner Link */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                               <ImageIcon size={14} /> URL Banner
                           </label>
                           <input 
                              type="url" 
                              name="bannerimgurl"
                              value={formData.bannerimgurl}
                              onChange={handleEditChange}
                              placeholder="https://..."
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           />
                        </div>
                     </div>
                  </form>
               </div>

               <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    form="edit-profile-form"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
               onClick={() => !isSaving && setIsDeleteModalOpen(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md bg-slate-900 border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center"
            >
               <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                   <LogOut size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Hapus Akun?</h2>
               <p className="text-slate-400 mb-8">
                  Tindakan ini tidak dapat dibatalkan. Semua data, riwayat transaksi, dan keanggotaan komunitas Anda akan dihapus secara permanen.
               </p>
               
               <div className="w-full flex gap-3">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                     Batal
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                     {isSaving ? "Memproses..." : "Ya, Hapus!"}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;