import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import ImageCropModal from "./ImageCropModal";

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [profilePict, setProfilePict] = useState<File | null>(null);
  const [bannerImg, setBannerImg] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Crop Modal State
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropAspect, setCropAspect] = useState(1);
  const [cropType, setCropType] = useState<"profile" | "banner" | null>(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempImage(URL.createObjectURL(file));
      setCropAspect(1);
      setCropType("profile");
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProfilePict(croppedFile);
      setProfilePreview(previewUrl);
    } else if (cropType === "banner") {
      setBannerImg(croppedFile);
      setBannerPreview(previewUrl);
    }
    setTempImage(null);
    setCropType(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await register({ 
        fullName, 
        userName, 
        email, 
        password,
        phoneNum,
        profilePict: profilePict || undefined,
        bannerImg: bannerImg || undefined
      });

      if (result.success) {
        setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 relative mt-16 md:mt-0">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-gasoek text-tx-primary mb-2">
          Daftar Akun Baru
        </h2>
        <p className="text-tx-secondary font-questrial">
          Silahkan lengkapi data diri anda untuk bergabung.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6 relative z-10 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500 text-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-tx-primary/10 border border-tx-primary/50 rounded-lg flex items-center gap-3 text-tx-primary text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Profile & Banner Pickers */}
        <div className="space-y-4 mb-6">
            <div className="relative group overflow-hidden rounded-xl h-24 bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-bg-vermillion transition-all">
                {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-bg-vermillion transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-bold">Upload Banner</span>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <div className="flex justify-center -mt-10">
                <div className="relative group w-20 h-20 rounded-full bg-white p-1 shadow-lg ring-4 ring-bg-vermillion/20 cursor-pointer hover:ring-bg-vermillion transition-all">
                    {profilePreview ? (
                        <img src={profilePreview} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-bg-vermillion transition-colors">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleProfileChange} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1 font-questrial">
            <label className="text-sm font-bold text-tx-primary block">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-1 font-questrial">
            <label className="text-sm font-bold text-tx-primary block">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
              placeholder="johndoe123"
              required
            />
          </div>

          <div className="space-y-1 font-questrial">
            <label className="text-sm font-bold text-tx-primary block">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-tx-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <svg className="h-5 w-5 text-tx-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.405 5.405l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                placeholder="081234567890"
                required
              />
            </div>
          </div>

          <div className="space-y-1 font-questrial md:col-span-2">
            <label className="text-sm font-bold text-tx-primary block">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-tx-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 bg-bg-fresh cursor-pointer font-questrial mt-4 ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg transition-all"
          }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Daftar"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-tx-secondary font-questrial">
        Sudah punya akun?{" "}
        <Link to="/login" className="font-bold text-tx-secondary hover:text-bg-fresh transition-colors">
          Masuk disini
        </Link>
      </p>

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

export default RegisterForm;
