import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { formatImageUrl } from "../../Utils/FormatUrl";
import ImageCropModal from "./ImageCropModal";
import { ShoppingBag, RefreshCw, X, Plus, Upload } from "lucide-react";
import UserPin from "./UserPin";

interface ThriftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Item | null; // Pass null for creation, item for editing
}

const ThriftForm: React.FC<ThriftFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    itemname: "",
    itemprice: "",
    itempicturl: "",
    category: "Gadget",
    itemstatus: "Tersedia",
    itemdescription: "",
    itemquantity: "1",
    transaction_type: "Jual",
    longitude: "106.8272", // Default to Jakarta Monas
    latitude: "-6.1751",
  });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Populate form when editing or rest when creating
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          itemname: initialData.itemname,
          itemprice: initialData.itemprice.toString(),
          itempicturl: initialData.itempicturl,
          category: initialData.category,
          itemstatus: initialData.itemstatus,
          itemdescription: initialData.itemdescription,
          itemquantity: initialData.itemquantity.toString(),
          transaction_type: initialData.transaction_type || "Uang",
          longitude: initialData.longitude.toString(),
          latitude: initialData.latitude.toString(),
        });
        setViewState({
          longitude: Number(initialData.longitude),
          latitude: Number(initialData.latitude),
          zoom: 13,
        });
      } else {
        setFormData({
          itemname: "",
          itemprice: "",
          itempicturl: "",
          category: "Gadget",
          itemstatus: "Tersedia",
          itemdescription: "",
          itemquantity: "1",
          transaction_type: "Uang",
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
  }, [initialData, isOpen, setViewState]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    setFormData((prev) => ({
      ...prev,
      longitude: lng.toFixed(6),
      latitude: lat.toFixed(6),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setSelectedFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        itempicturl: reader.result as string,
      }));
      setIsCropModalOpen(false);
      setImageToCrop(null);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const thriftService = new ThriftService();

      const payload = {
        itemname: formData.itemname,
        itemprice: Number(formData.itemprice),
        itempicturl: formData.itempicturl,
        category: formData.category,
        itemstatus: formData.itemstatus,
        itemdescription: formData.itemdescription,
        itemquantity: Number(formData.itemquantity),
        transaction_type: formData.transaction_type,
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
      };

      if (initialData) {
        // Edit Mode
        const result = await thriftService.updateThrift(
          initialData.itemid,
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
        await thriftService.createThrift(
          {
            ...payload,
            userid: user.userid,
          },
          selectedFile || undefined,
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan barang.");
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
            {initialData ? "Edit Barang Bekas" : "Tambah Barang Bekas Baru"}
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

          {/* PERUBAHAN UTAMA: form ditambahkan flex-1, min-h-0 dan handle overflow spesifik untuk mobile/desktop */}
          <form
            id="thrift-form"
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 lg:min-h-0">
              {/* Kolom Kiri: Map */}
              <div className="relative h-[400px] lg:h-full bg-slate-900 shrink-0 lg:shrink">
                <div className="absolute inset-0 z-10 p-4 pointer-events-none">
                  <div className="bg-bg-vermillion/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg inline-block pointer-events-auto">
                    <h4 className="text-xs font-gasoek font-normal tracking-wide text-tx-primary uppercase mb-1">
                      Lokasi Barang *
                    </h4>
                    <p className="text-[10px] text-tx-primary/60 font-medium font-questrial italic">
                      Klik pada peta untuk meletakkan pin.
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
              {/* PERUBAHAN: Penambahan min-h-0 agar batas form dikenali */}
              <div className="flex flex-col lg:h-full min-h-0 lg:border-l border-white/10">
                {/* PERUBAHAN: Penggunaan lg:overflow-y-auto untuk membatasi area scroll hanya pada input form */}
                <div className="p-6 lg:p-8 space-y-6 lg:overflow-y-auto grow custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 1: Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Nama Barang *
                      </label>
                      <input
                        required
                        type="text"
                        name="itemname"
                        value={formData.itemname}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all font-questrial text-tx-primary placeholder:text-tx-primary/40"
                        placeholder="Contoh: Kemeja Flannel Uniqlo"
                      />
                    </div>

                    {/* Row 2: Transaksi */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-3">
                        Tipe Transaksi *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              transaction_type: "Jual",
                            }))
                          }
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-gasoek text-sm ${formData.transaction_type === "Jual" ? "bg-bg-fresh border-bg-fresh text-tx-primary shadow-md" : "bg-transparent border-white/20 text-tx-primary/60 hover:border-white/40"}`}
                        >
                          <ShoppingBag size={18} />
                          Jual
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              transaction_type: "Barter",
                              itemprice: "0",
                            }))
                          }
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-gasoek text-sm ${formData.transaction_type === "Barter" ? "bg-bg-fresh border-bg-fresh text-tx-primary shadow-md" : "bg-transparent border-white/20 text-tx-primary/60 hover:border-white/40"}`}
                        >
                          <RefreshCw size={18} />
                          Barter
                        </button>
                      </div>
                    </div>

                    {/* Row: Harga & Qty */}
                    <div>
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Harga (Rp) {formData.transaction_type === "Jual" && "*"}
                      </label>
                      <input
                        required={formData.transaction_type === "Jual"}
                        type="number"
                        name="itemprice"
                        min="0"
                        value={formData.itemprice}
                        onChange={handleChange}
                        disabled={formData.transaction_type === "Barter"}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all font-questrial text-tx-primary placeholder:text-tx-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={
                          formData.transaction_type === "Barter"
                            ? "Barter"
                            : "150000"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Jumlah Stok / Qty *
                      </label>
                      <input
                        required
                        type="number"
                        name="itemquantity"
                        min="0"
                        value={formData.itemquantity}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all font-questrial text-tx-primary"
                      />
                    </div>

                    {/* Row 3: Category & Status */}
                    <div>
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all cursor-pointer font-questrial text-tx-primary"
                      >
                        <option value="Gadget">Gadget</option>
                        <option value="Perangkat Visual">
                          Perangkat Visual
                        </option>
                        <option value="Perangkat Audio">Perangkat Audio</option>
                        <option value="Perangkat Rumah Tangga">
                          Perangkat Rumah Tangga
                        </option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Status
                      </label>
                      <select
                        name="itemstatus"
                        value={formData.itemstatus}
                        onChange={handleChange}
                        disabled={!initialData}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all cursor-pointer font-questrial text-tx-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Tersedia">Tersedia</option>
                        {initialData && (
                          <option value="Terjual">Terjual</option>
                        )}
                      </select>
                    </div>

                    {/* Row 4: Foto Barang */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Foto Barang *
                      </label>
                      <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-clean border border-dashed border-white/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-tx-primary/70 font-questrial text-sm">
                        <Upload size={18} />
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          required={!formData.itempicturl}
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {formData.itempicturl && (
                        <div className="p-4 bg-bg-clean/40 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
                          <div className="aspect-video w-full md:w-48 rounded-lg overflow-hidden bg-bg-clean border border-white/10 shadow-inner shrink-0">
                            <img
                              src={
                                formData.itempicturl.startsWith("data:")
                                  ? formData.itempicturl
                                  : formatImageUrl(formData.itempicturl)
                              }
                              alt="Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="text-[10px] font-bold text-tx-primary/40 uppercase tracking-widest">
                              Source / URL:
                            </span>
                            <p className="text-[10px] text-tx-primary/60 font-questrial break-all italic">
                              {formData.itempicturl.startsWith("data:")
                                ? "Image selected from local file (Base64 ready)"
                                : formData.itempicturl}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 5: Deskripsi Lengkap */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-gasoek font-normal tracking-wide text-tx-primary mb-1">
                        Deskripsi Lengkap *
                      </label>
                      <textarea
                        required
                        name="itemdescription"
                        rows={4}
                        value={formData.itemdescription}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-bg-clean border border-white/20 rounded-xl focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 outline-none transition-all resize-none font-questrial text-tx-primary placeholder:text-tx-primary/40 text-sm"
                        placeholder="Deskripsikan kondisi barang, keunggulan, atau catatan tambahan lainnya..."
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
            form="thrift-form"
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-gasoek font-normal tracking-wide text-tx-primary bg-bg-fresh border border-bg-fresh/50 rounded-xl shadow-md transition-all flex items-center justify-center min-w-[120px] ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-white hover:shadow-lg"}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-tx-primary/30 border-t-tx-primary rounded-full animate-spin" />
            ) : initialData ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Barang"
            )}
          </button>
        </div>
      </motion.div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        aspect={1}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        image={imageToCrop || ""}
      />
    </div>
  );
};

export default ThriftForm;
