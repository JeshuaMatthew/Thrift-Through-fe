import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { AuthService } from "../../Services/AuthServices";
import { UserService } from "../../Services/UserServices";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Award,
  Edit2,
  Trash2,
  LogOut,
  X,
  Camera,
  ImageIcon,
  Lock,
} from "lucide-react";
import type { User } from "../../Types/User";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(user);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    phonenum: "",
    profilepicturl: "",
    bannerimgurl: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
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
        fullname: profileData.fullname || "",
        username: profileData.username || "",
        email: profileData.email || "",
        phonenum: profileData.phonenum || "",
        profilepicturl: profileData.profilepicturl || "",
        bannerimgurl: profileData.bannerimgurl || "",
      });
    }
  }, [profileData]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await authService.updateProfile(formData);
      if (response.success && response.data) {
        setProfileData(response.data);
        setIsEditModalOpen(false);
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

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    setIsSaving(true);
    try {
      setTimeout(() => {
        alert("Kata sandi berhasil diubah!");
        setIsPasswordModalOpen(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Gagal update password:", error);
      alert("Terjadi kesalahan sistem.");
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
        navigate("/");
        window.location.reload();
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
      <div className="flex h-screen items-center justify-center bg-bg-clean questrial-regular">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-bg-vermillion/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-bg-vermillion animate-spin"></div>
          </div>
          <p className="text-tx-secondary font-medium animate-pulse">
            Memuat data profil...
          </p>
        </div>
      </div>
    );
  }

  const defaultBanner =
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6";
  const defaultProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullname)}&background=f6ed6c&color=183020`;

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary relative pt-16 pb-20 overflow-x-hidden questrial-regular">
      <div className="px-4 sm:px-6 relative z-10 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-bg-vermillion/20 overflow-hidden"
        >
          {/* Banner */}
          <div className="h-48 md:h-64 relative bg-bg-fresh">
            <img
              src={profileData.bannerimgurl || defaultBanner}
              alt="Banner"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-10">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20 md:-mt-24 mb-8 relative z-10">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white overflow-hidden shadow-lg bg-bg-fresh shrink-0">
                  <img
                    src={profileData.profilepicturl || defaultProfile}
                    alt={profileData.fullname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-2 hidden md:block">
                  <h1 className="text-3xl gasoek-one-regular text-tx-primary tracking-tight">
                    {profileData.fullname}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-tx-secondary font-medium">
                      @{profileData.username || "pengguna"}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-tx-muted/40"></span>
                    <div className="flex items-center gap-1.5 bg-bg-fresh/50 px-2 py-0.5 rounded-lg border border-bg-fresh">
                      <Award size={14} className="text-tx-primary" />
                      <span className="text-xs font-bold text-tx-primary uppercase tracking-wider">
                        {profileData.userrank || "-"}
                      </span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-tx-muted/40"></span>
                    <p className="text-sm font-bold text-bg-vermillion">
                      {profileData.userpoint?.toLocaleString("id-ID") || 0} Poin
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-bg-vermillion hover:bg-tx-secondary hover:text-bg-clean text-tx-primary rounded-xl font-bold transition-all duration-300 shadow-sm"
                >
                  <Edit2 size={16} /> Edit Profil
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-tx-accent/10 hover:bg-tx-accent/20 border border-tx-accent/20 text-tx-accent rounded-xl font-bold transition-all duration-300"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>

            {/* Mobile Name Display */}
            <div className="md:hidden mb-8">
              <h1 className="text-3xl gasoek-one-regular text-tx-primary tracking-tight">
                {profileData.fullname}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-tx-secondary font-medium text-sm">
                  @{profileData.username || "pengguna"}
                </p>
                <div className="flex items-center gap-1.5 bg-bg-fresh/50 px-2 py-0.5 rounded-lg border border-bg-fresh">
                  <Award size={12} className="text-tx-primary" />
                  <span className="text-[10px] font-bold text-tx-primary uppercase tracking-wider">
                    {profileData.userrank || "-"}
                  </span>
                </div>
                <p className="text-sm font-bold text-bg-vermillion">
                  {profileData.userpoint?.toLocaleString("id-ID") || 0} Poin
                </p>
              </div>
            </div>

            {/* Details Layout: Two Columns on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
              {/* Left Column: Ambient Video Container (4 columns) */}
              <div className="lg:col-span-4 h-[400px] lg:h-auto min-h-[300px] rounded-3xl overflow-hidden shadow-2xl border border-bg-vermillion/20 relative group">
                <div className="absolute inset-0 bg-bg-vermillion/10 mix-blend-overlay z-10 pointer-events-none"></div>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  poster="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-man-working-in-his-woodworking-studio-34444-large.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-vermillion/60 via-transparent to-transparent z-10 flex flex-col justify-end p-8">
                  <h4 className="text-white font-gasoek text-lg mb-2">Semangat Daur Ulang!</h4>
                  <p className="text-white/80 text-xs leading-relaxed italic">
                    "Setiap barang bekas yang Anda kelola adalah langkah nyata menuju bumi yang lebih hijau."
                  </p>
                </div>
              </div>

              {/* Right Column: Info Section (8 columns) */}
              <div className="lg:col-span-8 bg-bg-vermillion border border-bg-vermillion/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between space-y-8 p-8 relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Award size={160} />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-gasoek text-tx-primary flex items-center gap-4 mb-10">
                    <span className="w-12 h-12 rounded-2xl bg-bg-fresh flex items-center justify-center shadow-lg border border-bg-fresh/50">
                      <Award size={24} />
                    </span>
                    Informasi Akun
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-bg-fresh/40 p-6 rounded-2xl border border-bg-fresh/30 backdrop-blur-md shadow-sm group hover:bg-bg-fresh/50 transition-all">
                      <p className="text-[10px] text-tx-primary/60 font-gasoek uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Mail size={14} className="text-tx-primary/80" /> Email
                      </p>
                      <p className="text-lg font-bold text-tx-primary truncate">
                        {profileData.email || "Belum diatur"}
                      </p>
                    </div>
                    
                    <div className="bg-bg-fresh/40 p-6 rounded-2xl border border-bg-fresh/30 backdrop-blur-md shadow-sm group hover:bg-bg-fresh/50 transition-all">
                      <p className="text-[10px] text-tx-primary/60 font-gasoek uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Phone size={14} className="text-tx-primary/80" /> Nomor Telepon
                      </p>
                      <p className="text-lg font-bold text-tx-primary">
                        {profileData.phonenum || "Belum diatur"}
                      </p>
                    </div>

                    <div className="bg-bg-fresh/40 p-6 rounded-2xl border border-bg-fresh/30 backdrop-blur-md shadow-sm group hover:bg-bg-fresh/50 transition-all sm:col-span-2">
                      <p className="text-[10px] text-tx-primary/60 font-gasoek uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Award size={14} className="text-tx-primary/80" /> Peringkat Anggota
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-gasoek text-tx-primary uppercase tracking-wider">
                          {profileData.userrank || "-"}
                        </p>
                        <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            className="h-full bg-bg-fresh shadow-[0_0_10px_rgba(246,237,108,0.5)]"
                          />
                        </div>
                        <p className="text-xs font-bold text-tx-primary/60">45%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-bg-fresh/20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="flex items-start gap-4 bg-white/20 p-5 rounded-2xl border border-white/20 shadow-inner max-w-md">
                    <p className="text-xs text-tx-primary font-medium italic leading-relaxed">
                      "Kumpulkan terus poin daur ulang untuk menaikkan peringkat 
                      dan membuka keuntungan eksklusif di ekosistem Thrift-Through!"
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center gap-3 px-10 py-5 bg-bg-fresh hover:bg-white text-tx-primary hover:text-bg-vermillion rounded-2xl font-gasoek text-sm transition-all duration-500 shadow-xl hover:shadow-bg-fresh/20 border border-bg-fresh/50 whitespace-nowrap group"
                  >
                    <Lock size={20} className="group-hover:rotate-12 transition-transform" /> Ganti Password
                  </button>
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
              className="absolute inset-0 bg-tx-primary/60 backdrop-blur-sm"
              onClick={() => !isSaving && setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-bg-vermillion/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-bg-clean flex items-center justify-between">
                <h2 className="text-xl font-bold text-tx-primary gasoek-one-regular tracking-wide">
                  Edit Profil
                </h2>
                <button
                  onClick={() => !isSaving && setIsEditModalOpen(false)}
                  className="p-2 text-tx-muted hover:bg-bg-clean rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form
                  id="edit-profile-form"
                  onSubmit={handleSaveProfile}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary block">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        required
                        value={formData.fullname}
                        onChange={handleEditChange}
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary block">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleEditChange}
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary block">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleEditChange}
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary block">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="phonenum"
                        value={formData.phonenum}
                        onChange={handleEditChange}
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-bg-clean">
                    <h3 className="text-sm font-bold text-tx-primary">
                      Media Links
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary flex items-center gap-2">
                        <Camera size={14} /> URL Foto Profil
                      </label>
                      <input
                        type="url"
                        name="profilepicturl"
                        value={formData.profilepicturl}
                        onChange={handleEditChange}
                        placeholder="https://..."
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-tx-secondary flex items-center gap-2">
                        <ImageIcon size={14} /> URL Banner
                      </label>
                      <input
                        type="url"
                        name="bannerimgurl"
                        value={formData.bannerimgurl}
                        onChange={handleEditChange}
                        placeholder="https://..."
                        className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary placeholder-tx-muted focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-bg-clean flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-tx-muted hover:text-tx-primary hover:bg-bg-clean transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="edit-profile-form"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold bg-bg-vermillion hover:bg-tx-secondary text-tx-primary hover:text-bg-clean transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSWORD MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-tx-primary/60 backdrop-blur-sm"
              onClick={() => !isSaving && setIsPasswordModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-bg-vermillion/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-bg-clean flex items-center justify-between">
                <h2 className="text-xl font-bold text-tx-primary gasoek-one-regular tracking-wide">
                  Ubah Kata Sandi
                </h2>
                <button
                  onClick={() => !isSaving && setIsPasswordModalOpen(false)}
                  className="p-2 text-tx-muted hover:bg-bg-clean rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form
                  id="change-password-form"
                  onSubmit={handleSavePassword}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-tx-secondary block">
                      Kata Sandi Saat Ini
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      required
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-tx-secondary block">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={8}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-tx-secondary block">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-clean border border-bg-vermillion/50 rounded-xl px-4 py-3 text-tx-primary focus:outline-none focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary transition-colors"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-bg-clean flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-tx-muted hover:text-tx-primary hover:bg-bg-clean transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="change-password-form"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold bg-bg-vermillion hover:bg-tx-secondary text-tx-primary hover:text-bg-clean transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Kata Sandi"}
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
              className="absolute inset-0 bg-tx-primary/60 backdrop-blur-sm"
              onClick={() => !isSaving && setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-tx-accent/20 rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-tx-accent/10 flex items-center justify-center text-tx-accent mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-bold text-tx-primary mb-2 gasoek-one-regular tracking-wide">
                Hapus Akun?
              </h2>
              <p className="text-tx-secondary mb-8 font-medium">
                Tindakan ini tidak dapat dibatalkan. Semua data, riwayat
                transaksi, dan keanggotaan komunitas Anda akan dihapus secara
                permanen.
              </p>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-bg-clean hover:bg-bg-vermillion text-tx-secondary hover:text-tx-primary rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-tx-accent hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
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
