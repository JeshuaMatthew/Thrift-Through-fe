import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { AuthService } from "../../Services/AuthServices";
import { UserService } from "../../Services/UserServices";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Edit2,
  Trash2,
  LogOut,
  X,
  Camera,
  ImageIcon,
  Lock,
  User as UserIcon,
} from "lucide-react";
import type { User } from "../../Types/User";
import { useNavigate } from "react-router-dom";
import ImageCropModal from "../Components/ImageCropModal";
import { Plus, Upload } from "lucide-react";

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

  // Image states
  const [profilePictFile, setProfilePictFile] = useState<File | null>(null);
  const [bannerImgFile, setBannerImgFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Crop Modal states
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropAspect, setCropAspect] = useState(1);
  const [cropType, setCropType] = useState<"profile" | "banner" | null>(null);

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
      setProfilePreview(profileData.profilepicturl || null);
      setBannerPreview(profileData.bannerimgurl || null);
    }
  }, [profileData]);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempImage(URL.createObjectURL(file));
      setCropAspect(1);
      setCropType("profile");
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempImage(URL.createObjectURL(file));
      setCropAspect(16 / 9);
      setCropType("banner");
    }
  };

  const handleCropSave = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);
    if (cropType === "profile") {
      setProfilePictFile(croppedFile);
      setProfilePreview(previewUrl);
    } else if (cropType === "banner") {
      setBannerImgFile(croppedFile);
      setBannerPreview(previewUrl);
    }
    setTempImage(null);
    setCropType(null);
  };

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
      // 1. Update text data
      const response = await authService.updateProfile({
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        phonenum: formData.phonenum,
      });

      if (response.success) {
        let updatedUser = response.data;

        // 2. Upload profile picture if changed
        if (profilePictFile) {
          const profileRes = await authService.uploadProfilePic(profilePictFile);
          if (profileRes.success) updatedUser = profileRes.data;
        }

        // 3. Upload banner if changed
        if (bannerImgFile) {
          const bannerRes = await authService.uploadUserBanner(bannerImgFile);
          if (bannerRes.success) updatedUser = bannerRes.data;
        }

        if (updatedUser) {
          setProfileData(updatedUser);
        }
        
        setIsEditModalOpen(false);
        setProfilePictFile(null);
        setBannerImgFile(null);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Gagal update profil:", error);
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
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setIsSaving(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (!profileData?.userid) return;
    setIsSaving(true);
    try {
      const response = await userService.deleteOwnData(profileData.userid);
      if (response.success) {
        await authService.logout();
        navigate("/");
        window.location.reload();
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
      <div className="flex h-screen items-center justify-center bg-bg-clean font-questrial">
        <div className="animate-bounce">
          <div className="w-12 h-12 border-4 border-bg-vermillion border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const defaultBanner = "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6";
  const defaultProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullname)}&background=f6ed6c&color=183020`;

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary pb-20 font-questrial overflow-x-hidden">
      {/* Hero Header Section */}
      <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center">
        <img
          src={profileData.bannerimgurl || defaultBanner}
          alt="Banner"
          className="absolute z-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/40" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6"
          >
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl border-4 border-white overflow-hidden shadow-2xl bg-bg-fresh">
                <img
                  src={profileData.profilepicturl || defaultProfile}
                  alt={profileData.fullname}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left mb-2">
              <h1 className="text-4xl md:text-5xl font-gasoek text-white drop-shadow-lg">
                {profileData.fullname}
              </h1>
              <p className="text-lg text-white/80 font-questrial">
                @{profileData.username || "pengguna_hijau"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Jagged Stamp Edge Transition */}
        <div className="absolute bottom-0 left-0 w-full leading-none z-30 transform translate-y-px">
          <svg className="w-full h-6 text-bg-clean" preserveAspectRatio="none" viewBox="0 0 100 10" fill="currentColor">
            <path d="M 0 10 L 0 5 C 0,5 0.25,6 0.5,5 L 1.25,0 L 1.75,0 L 2.5,5 C 2.5,5 2.75,6 3,5 L 3.75,0 L 4.25,0 L 5,5 C 5,5 5.25,6 5.5,5 L 6.25,0 L 6.75,0 L 7.5,5 C 7.5,5 7.75,6 8,5 L 8.75,0 L 9.25,0 L 10,5 C 10,5 10.25,6 10.5,5 L 11.25,0 L 11.75,0 L 12.5,5 C 12.5,5 12.75,6 13,5 L 13.75,0 L 14.25,0 L 15,5 C 15,5 15.25,6 15.5,5 L 16.25,0 L 16.75,0 L 17.5,5 C 17.5,5 17.75,6 18,5 L 18.75,0 L 19.25,0 L 20,5 C 20,5 20.25,6 20.5,5 L 21.25,0 L 21.75,0 L 22.5,5 C 22.5,5 22.75,6 23,5 L 23.75,0 L 24.25,0 L 25,5 C 25,5 25.25,6 25.5,5 L 26.25,0 L 26.75,0 L 27.5,5 C 27.5,5 27.75,6 28,5 L 28.75,0 L 29.25,0 L 30,5 C 30,5 30.25,6 30.5,5 L 31.25,0 L 31.75,0 L 32.5,5 C 32.5,5 32.75,6 33,5 L 33.75,0 L 34.25,0 L 35,5 C 35,5 35.25,6 35.5,5 L 36.25,0 L 36.75,0 L 37.5,5 C 37.5,5 37.75,6 38,5 L 38.75,0 L 39.25,0 L 40,5 C 40,5 40.25,6 40.5,5 L 41.25,0 L 41.75,0 L 42.5,5 C 42.5,5 42.75,6 43,5 L 43.75,0 L 44.25,0 L 45,5 C 45,5 45.25,6 45.5,5 L 46.25,0 L 46.75,0 L 47.5,5 C 47.5,5 47.75,6 48,5 L 48.75,0 L 49.25,0 L 50,5 C 50,5 50.25,6 50.5,5 L 51.25,0 L 51.75,0 L 52.5,5 C 52.5,5 52.75,6 53,5 L 53.75,0 L 54.25,0 L 55,5 C 55,5 55.25,6 55.5,5 L 56.25,0 L 56.75,0 L 57.5,5 C 57.5,5 57.75,6 58,5 L 58.75,0 L 59.25,0 L 60,5 C 60,5 60.25,6 60.5,5 L 61.25,0 L 61.75,0 L 62.5,5 C 62.5,5 62.75,6 63,5 L 63.75,0 L 64.25,0 L 65,5 C 65,5 65.25,6 65.5,5 L 66.25,0 L 66.75,0 L 67.5,5 C 67.5,5 67.75,6 68,5 L 68.75,0 L 69.25,0 L 70,5 C 70,5 70.25,6 70.5,5 L 71.25,0 L 71.75,0 L 72.5,5 C 72.5,5 72.75,6 73,5 L 73.75,0 L 74.25,0 L 75,5 C 75,5 75.25,6 75.5,5 L 76.25,0 L 76.75,0 L 77.5,5 C 77.5,5 77.75,6 78,5 L 78.75,0 L 79.25,0 L 80,5 C 80,5 80.25,6 80.5,5 L 81.25,0 L 81.75,0 L 82.5,5 C 82.5,5 82.75,6 83,5 L 83.75,0 L 84.25,0 L 85,5 C 85,5 85.25,6 85.5,5 L 86.25,0 L 86.75,0 L 87.5,5 C 87.5,5 87.75,6 88,5 L 88.75,0 L 89.25,0 L 90,5 C 90,5 90.25,6 90.5,5 L 91.25,0 L 91.75,0 L 92.5,5 C 92.5,5 92.75,6 93,5 L 93.75,0 L 94.25,0 L 95,5 C 95,5 95.25,6 95.5,5 L 96.25,0 L 96.75,0 L 97.5,5 C 97.5,5 97.75,6 98,5 L 98.75,0 L 99.25,0 L 100,5 L 100 10 Z"></path>
          </svg>
        </div>
      </section>

      {/* Profile Content */}
      <section className="w-full max-w-4xl mx-auto my-10">
        <div className=" relative overflow-hidden">

          <h2 className="text-4xl font-gasoek text-bg-vermillion mb-10 flex items-center gap-4">
            Informasi <span className="text-tx-primary">Akun</span>
          </h2>

          <div className="space-y-8">
            <div className="group">
              <p className="text-xs font-gasoek text-tx-muted uppercase tracking-widest mb-2">Nama Lengkap</p>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl transition-all">
                <UserIcon className="text-bg-vermillion" size={24} />
                <p className="text-xl font-bold text-tx-primary">{profileData.fullname}</p>
              </div>
            </div>

            <div className="group">
              <p className="text-xs font-gasoek text-tx-muted uppercase tracking-widest mb-2">Alamat Email</p>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl transition-all">
                <Mail className="text-bg-vermillion" size={24} />
                <p className="text-xl font-bold text-tx-primary break-all">{profileData.email || "Belum diatur"}</p>
              </div>
            </div>

            <div className="group">
              <p className="text-xs font-gasoek text-tx-muted uppercase tracking-widest mb-2">Nomor Telepon</p>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl transition-all">
                <Phone className="text-bg-vermillion" size={24} />
                <p className="text-xl font-bold text-tx-primary">{profileData.phonenum || "Belum diatur"}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons at the bottom of the card */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-bg-vermillion hover:bg-tx-primary text-white rounded-xl font-gasoek text-sm transition-all shadow-lg active:scale-95"
            >
              <Edit2 size={16} /> Edit Profil
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-tx-primary text-white hover:bg-bg-vermillion rounded-xl font-gasoek text-sm transition-all shadow-lg active:scale-95"
            >
              <Lock size={16} /> Ganti Kata Sandi
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-tx-accent text-tx-accent hover:bg-tx-accent hover:text-white rounded-xl font-gasoek text-sm transition-all shadow-lg active:scale-95"
            >
              <Trash2 size={16} /> Hapus Akun
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {(isEditModalOpen || isPasswordModalOpen || isDeleteModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-tx-primary/80 backdrop-blur-md"
              onClick={() => {
                if (!isSaving) {
                  setIsEditModalOpen(false);
                  setIsPasswordModalOpen(false);
                  setIsDeleteModalOpen(false);
                }
              }}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-clean rounded-[2rem] overflow-hidden shadow-2xl border-t-8 border-bg-vermillion"
            >
              {/* Edit Modal Content */}
              {isEditModalOpen && (
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-gasoek text-tx-primary">
                      Edit <span className="text-bg-vermillion">Profil</span>
                    </h2>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-tx-muted hover:text-tx-primary transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Banner & Profile Pict Pickers */}
                    <div className="space-y-4 mb-6">
                      <div className="relative group overflow-hidden rounded-2xl h-32 bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-bg-vermillion transition-all">
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-bg-vermillion transition-colors">
                            <ImageIcon className="h-6 w-6" />
                            <span className="text-xs font-bold font-gasoek">Upload Banner</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleBannerFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>

                      <div className="flex justify-center -mt-12">
                        <div className="relative group w-24 h-24 rounded-full bg-white p-1 shadow-lg ring-4 ring-bg-vermillion/20 cursor-pointer hover:ring-bg-vermillion transition-all">
                          {profilePreview ? (
                            <img src={profilePreview} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-bg-vermillion transition-colors">
                              <Camera className="h-8 w-8" />
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleProfileFileChange} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1 font-questrial">
                        <label className="text-sm font-bold text-tx-primary block">Nama Lengkap</label>
                        <input
                          type="text"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleEditChange}
                          className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-1 font-questrial">
                        <label className="text-sm font-bold text-tx-primary block">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleEditChange}
                          className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                          placeholder="johndoe123"
                          required
                        />
                      </div>

                      <div className="space-y-1 font-questrial">
                        <label className="text-sm font-bold text-tx-primary block">Alamat Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-tx-muted" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleEditChange}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 font-questrial">
                        <label className="text-sm font-bold text-tx-primary block">Nomor Telepon</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-tx-muted" />
                          </div>
                          <input
                            type="tel"
                            name="phonenum"
                            value={formData.phonenum}
                            onChange={handleEditChange}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                            placeholder="081234567890"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 font-gasoek text-sm text-tx-muted hover:text-tx-primary transition-colors">Batal</button>
                      <button 
                        type="submit" 
                        disabled={isSaving} 
                        className={`px-10 py-3 bg-bg-vermillion text-white rounded-xl font-gasoek text-sm shadow-lg hover:scale-105 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Delete Modal Content */}
              {isDeleteModalOpen && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-tx-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} className="text-tx-accent" />
                  </div>
                  <h2 className="text-3xl font-gasoek text-tx-primary mb-4">Hapus Akun?</h2>
                  <p className="text-tx-secondary mb-10 max-w-sm mx-auto">Tindakan ini permanen. Semua data kontribusi e-waste kamu akan terhapus selamanya.</p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-10 py-4 font-gasoek text-sm bg-slate-100 rounded-2xl">Batal</button>
                    <button onClick={handleDeleteAccount} className="px-10 py-4 font-gasoek text-sm bg-tx-accent text-white rounded-2xl shadow-xl hover:bg-red-700">Ya, Hapus Sekarang</button>
                  </div>
                </div>
              )}

              {/* Password Modal */}
              {isPasswordModalOpen && (
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-gasoek text-tx-primary">Ubah <span className="text-bg-vermillion">Kata Sandi</span></h2>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="text-tx-muted hover:text-tx-primary transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSavePassword} className="space-y-6">
                    <div className="space-y-1 font-questrial">
                      <label className="text-sm font-bold text-tx-primary block">Kata Sandi Lama</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-tx-muted" />
                        </div>
                        <input
                          type="password"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1 font-questrial">
                      <label className="text-sm font-bold text-tx-primary block">Kata Sandi Baru</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-tx-muted" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 font-questrial">
                      <label className="text-sm font-bold text-tx-primary block">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-tx-muted" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                      <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-3 font-gasoek text-sm text-tx-muted hover:text-tx-primary transition-colors">Batal</button>
                      <button 
                        type="submit" 
                        disabled={isSaving} 
                        className={`px-10 py-3 bg-tx-primary text-white rounded-xl font-gasoek text-sm shadow-xl hover:scale-105 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSaving ? "Memproses..." : "Simpan Sandi"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {tempImage && (
        <ImageCropModal
          isOpen={!!tempImage}
          image={tempImage}
          aspect={cropAspect}
          onClose={() => {
            setTempImage(null);
            setCropType(null);
          }}
          onCropComplete={handleCropSave}
        />
      )}
    </div>
  );
};

export default ProfilePage;