import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { CommunityService } from "../../Services/CommunitiesServices";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import type { Community } from "../../Types/Community";
import { X, Plus, Upload, Globe, Lock } from "lucide-react";
import UserPin from "./UserPin";
import { formatImageUrl } from "../../Utils/FormatUrl";
import ImageCropModal from "./ImageCropModal";

interface CommunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Community | null; // Pass null for creation, community for editing
}

const CommunityForm: React.FC<CommunityFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    communityname: "",
    description: "",
    profilepicturl: "",
    bannerurl: "",
    isPublic: true,
    longitude: "106.8272", // Default to Jakarta Monas
    latitude: "-6.1751",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewState, setViewState] = useState({
    longitude: 106.8272,
    latitude: -6.1751,
    zoom: 13,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // States for Image Cropping
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [currentField, setCurrentField] = useState<
    "profilepicturl" | "bannerurl" | null
  >(null);
  const [cropAspect, setCropAspect] = useState(1);

  // Populate form when editing or rest when creating
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          communityname: initialData.communityname,
          description: initialData.description,
          profilepicturl: initialData.profilepicturl,
          bannerurl: initialData.bannerurl || "",
          isPublic: initialData.isPublic,
          longitude: initialData.longitude?.toString() || "106.8272",
          latitude: initialData.latitude?.toString() || "-6.1751",
        });
        if (initialData.longitude && initialData.latitude) {
          setViewState({
            longitude: Number(initialData.longitude),
            latitude: Number(initialData.latitude),
            zoom: 13,
          });
        }
      } else {
        setFormData({
          communityname: "",
          description: "",
          profilepicturl: "",
          bannerurl: "",
          isPublic: true,
          longitude: "106.8272",
          latitude: "-6.1751",
        });
        setViewState({
          longitude: 106.8272,
          latitude: -6.1751,
          zoom: 13,
        });

        // Fetch current geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });

              if (!initialData) {
                setFormData((prev) => ({
                  ...prev,
                  latitude: latitude.toFixed(6),
                  longitude: longitude.toFixed(6),
                }));
                setViewState({
                  latitude,
                  longitude,
                  zoom: 13,
                });
              }
            },
            (error) => {
              console.warn("Geolocation error:", error);
            },
          );
        }
      }
      setErrorMsg("");
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePublic = (val: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: val }));
  };

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    setFormData((prev) => ({
      ...prev,
      longitude: lng.toFixed(6),
      latitude: lat.toFixed(6),
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profilepicturl" | "bannerurl",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCurrentField(field);
        setCropAspect(field === "profilepicturl" ? 1 : 16 / 9);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (currentField) {
        setFormData((prev) => ({
          ...prev,
          [currentField]: reader.result as string,
        }));
      }
      setIsCropModalOpen(false);
      setImageToCrop("");
      setCurrentField(null);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const commService = new CommunityService();

      const payload = {
        communityname: formData.communityname,
        description: formData.description,
        profilepicturl: formData.profilepicturl,
        bannerurl: formData.bannerurl,
        isPublic: formData.isPublic,
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
        userid: user.userid,
        community_type: "GroupChat",
      };

      if (initialData) {
        // Edit Mode
        const result = await commService.updateCommunity(
          initialData.communityid,
          user.userid,
          payload,
        );
        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMsg(result.message);
        }
      } else {
        // Create Mode
        await commService.createCommunity(payload);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan komunitas.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main Form Box */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-bg-vermillion border border-bg-vermillion/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-bg-vermillion text-tx-primary shrink-0">
          <h2 className="text-xl font-gasoek font-normal tracking-wide">
            {initialData ? "Edit Komunitas" : "Buat Komunitas Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-tx-primary/60 hover:text-tx-primary hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-hidden grow flex flex-col min-h-0 bg-bg-vermillion">
          {errorMsg && (
            <div className="mx-6 mt-6 mb-2 p-4 bg-red-500/20 text-red-100 rounded-xl text-sm border border-red-500/30 flex items-center gap-2 shrink-0">
              <X className="h-5 w-5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* PERUBAHAN: Penambahan flex-1, min-h-0 dan overflow untuk form wrapper */}
          <form
            id="community-form"
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 lg:min-h-0">
              {/* Kolom Kiri: Map */}
              <div className="relative h-[400px] lg:h-full bg-slate-900 shrink-0 lg:shrink overflow-hidden">
                <div className="absolute inset-0 z-10 p-4 pointer-events-none">
                  <div className="bg-bg-vermillion/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg inline-block pointer-events-auto">
                    <h4 className="text-xs font-gasoek font-normal tracking-wide text-tx-primary uppercase mb-1">
                      Lokasi Komunitas *
                    </h4>
                    <p className="text-[10px] text-tx-primary/60 font-medium font-questrial italic">
                      Klik pada peta untuk lokasi titik temu.
                    </p>
                  </div>
                </div>

                <Map
                  {...viewState}
                  onMove={(e) => setViewState(e.viewState)}
                  mapStyle="https://tiles.openfreemap.org/styles/liberty"
                  onClick={handleMapClick}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Marker
                    longitude={Number(formData.longitude)}
                    latitude={Number(formData.latitude)}
                    anchor="bottom"
                  >
                    <div className="bg-tx-primary p-2 rounded-full shadow-2xl border-2 border-bg-clean transform -translate-y-1">
                      <Plus className="h-5 w-5 text-bg-clean rotate-45" />
                    </div>
                  </Marker>

                  {/* Marker Lokasi Saya Saat Ini */}
                  {userLocation && (
                    <UserPin
                      longitude={userLocation.longitude}
                      latitude={userLocation.latitude}
                    />
                  )}
                </Map>

                {/* Coordinates Overlay */}
                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                  <div className="bg-bg-clean/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                    <span className="text-[10px] font-bold text-tx-primary/40 mr-1">
                      LAT
                    </span>
                    <span className="text-[10px] font-medium text-tx-primary font-questrial">
                      {Number(formData.latitude).toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-bg-clean/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                    <span className="text-[10px] font-bold text-tx-primary/40 mr-1">
                      LNG
                    </span>
                    <span className="text-[10px] font-medium text-tx-primary font-questrial">
                      {Number(formData.longitude).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Inputs */}
              <div className="flex flex-col lg:h-full min-h-0 lg:border-l border-white/10">
                <div className="p-6 lg:p-8 space-y-6 lg:overflow-y-auto grow custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 1: Name (Spans both columns) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Nama Komunitas *
                      </label>
                      <input
                        required
                        type="text"
                        name="communityname"
                        value={formData.communityname}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all font-questrial text-tx-primary placeholder:text-tx-primary/40"
                        placeholder="Contoh: Thrift Lovers Jakarta"
                      />
                    </div>

                    {/* Row 2: Privacy Toggle */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Privasi Komunitas
                      </label>
                      <div className="flex gap-4 flex-col sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleTogglePublic(true)}
                          className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.isPublic ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-inner" : "bg-bg-clean border-white/10 text-tx-primary/40 hover:bg-white/5"}`}
                        >
                          <Globe size={20} />
                          <div className="text-left leading-tight">
                            <p className="text-sm font-bold font-questrial">
                              Publik
                            </p>
                            <p className="text-[10px] font-medium opacity-60">
                              Dapat ditemukan semua orang.
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublic(false)}
                          className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${!formData.isPublic ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-inner" : "bg-bg-clean border-white/10 text-tx-primary/40 hover:bg-white/5"}`}
                        >
                          <Lock size={20} />
                          <div className="text-left leading-tight">
                            <p className="text-sm font-bold font-questrial">
                              Privat
                            </p>
                            <p className="text-[10px] font-medium opacity-60">
                              Hanya untuk undangan.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Row 3: Image (Spans both columns) */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Foto Profil Komunitas
                      </label>
                      <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-clean border border-dashed border-white/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-tx-primary/70 font-questrial text-sm">
                        <Upload size={18} />
                        <span>Pilih Foto Profil</span>
                        <input
                          type="file"
                          required={!formData.profilepicturl}
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, "profilepicturl")
                          }
                          className="hidden"
                        />
                      </label>

                      {formData.profilepicturl && (
                        <div className="p-4 bg-bg-clean/40 rounded-xl border border-white/10 flex flex-col gap-4 items-center">
                          <div className="aspect-square w-full md:w-32 rounded-lg overflow-hidden bg-bg-clean border border-white/10 shadow-inner shrink-0">
                            <img
                              src={
                                formData.profilepicturl.startsWith("data:")
                                  ? formData.profilepicturl
                                  : formatImageUrl(formData.profilepicturl)
                              }
                              alt="Profile Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Foto Sampul Komunitas (Banner)
                      </label>
                      <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-clean border border-dashed border-white/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-tx-primary/70 font-questrial text-sm">
                        <Upload size={18} />
                        <span>Pilih Foto Sampul</span>
                        <input
                          type="file"
                          required={!formData.bannerurl}
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "bannerurl")}
                          className="hidden"
                        />
                      </label>

                      {formData.bannerurl && (
                        <div className="p-4 bg-bg-clean/40 rounded-xl border border-white/10 flex flex-col gap-4 items-center">
                          <div className="aspect-video w-full md:w-48 rounded-lg overflow-hidden bg-bg-clean border border-white/10 shadow-inner shrink-0">
                            <img
                              src={
                                formData.bannerurl.startsWith("data:")
                                  ? formData.bannerurl
                                  : formatImageUrl(formData.bannerurl)
                              }
                              alt="Banner Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 4: Description (Spans both columns) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Tentang Komunitas *
                      </label>
                      <textarea
                        required
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all resize-none font-questrial text-tx-primary placeholder:text-tx-primary/40 text-sm"
                        placeholder="Jelaskan tujuan atau visi misi komunitas Anda..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Buttons Modal */}
        <div className="p-6 border-t border-white/10 bg-bg-vermillion text-tx-primary flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-gasoek font-normal tracking-wide text-tx-primary bg-bg-clean border border-white/20 rounded-xl hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="community-form"
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-gasoek font-normal tracking-wide text-tx-primary bg-bg-fresh border border-bg-fresh/50 rounded-xl shadow-md transition-all flex items-center justify-center min-w-[120px] ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-white hover:shadow-lg"}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-tx-primary/30 border-t-tx-primary rounded-full animate-spin" />
            ) : initialData ? (
              "Simpan Perubahan"
            ) : (
              "Buat Komunitas"
            )}
          </button>
        </div>
      </motion.div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        image={imageToCrop}
        aspect={cropAspect}
        onClose={() => {
          setIsCropModalOpen(false);
          setImageToCrop("");
          setCurrentField(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default CommunityForm;
