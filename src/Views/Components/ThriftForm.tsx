import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThriftService, type Item } from '../../Services/ThriftsServices';
import { useAuth } from '../../Utils/Hooks/AuthProvider';

interface ThriftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Item | null; // Pass null for creation, item for editing
}

const ThriftForm: React.FC<ThriftFormProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    itemname: '',
    itemprice: '',
    itempicturl: '',
    category: 'Pakaian',
    itemstatus: 'Tersedia',
    itemdescription: '',
    itemquantity: '1',
    longitude: '106.8272', // Default to Jakarta Monas
    latitude: '-6.1751',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form when editing or rest when creating
  useEffect(() => {
    if (initialData) {
      setFormData({
        itemname: initialData.itemname,
        itemprice: initialData.itemprice.toString(),
        itempicturl: initialData.itempicturl,
        category: initialData.category,
        itemstatus: initialData.itemstatus,
        itemdescription: initialData.itemdescription,
        itemquantity: initialData.itemquantity.toString(),
        longitude: initialData.longitude.toString(),
        latitude: initialData.latitude.toString(),
      });
    } else {
      setFormData({
        itemname: '',
        itemprice: '',
        itempicturl: '',
        category: 'Pakaian',
        itemstatus: 'Tersedia',
        itemdescription: '',
        itemquantity: '1',
        longitude: '106.8272',
        latitude: '-6.1751',
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    setFormData(prev => ({
      ...prev,
      longitude: lng.toFixed(6),
      latitude: lat.toFixed(6)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setErrorMsg('');

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
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
      };

      if (initialData) {
        // Edit Mode
        const result = await thriftService.updateThrift(initialData.itemid, user.userid, payload);
        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMsg(result.message);
        }
      } else {
        // Create Mode
        await thriftService.createThrift({
          ...payload,
          userid: user.userid
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan barang.');
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
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Barang Bekas' : 'Tambah Barang Bekas Baru'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form id="thrift-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom 1 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Barang *</label>
                  <input 
                    required type="text" name="itemname" value={formData.itemname} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Contoh: Kemeja Flannel Uniqlo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp) *</label>
                  <input 
                    required type="number" name="itemprice" min="0" value={formData.itemprice} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="150000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">URL Foto Profil Barang *</label>
                  <input 
                    required type="url" name="itempicturl" value={formData.itempicturl} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.itempicturl && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                       <span className="shrink-0">Preview:</span>
                       <div className="h-10 w-10 mt-1 rounded-md overflow-hidden bg-gray-200 border border-gray-300">
                          <img src={formData.itempicturl} alt="Preview" className="h-full w-full object-cover" 
                               onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                       </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                    <select 
                      name="category" value={formData.category} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="Pakaian">Pakaian</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Otomotif">Otomotif</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select 
                      name="itemstatus" value={formData.itemstatus} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Terjual">Terjual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Kolom 2 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Lengkap *</label>
                  <textarea 
                    required name="itemdescription" rows={5} value={formData.itemdescription} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                    placeholder="Deskripsikan kondisi barang, minusnya, kelengkapan, dll..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Stok / Qty *</label>
                  <input 
                    required type="number" name="itemquantity" min="0" value={formData.itemquantity} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                   <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Pilih Lokasi di Peta *</h4>
                   
                   {/* Map Container */}
                   <div className="w-full h-48 rounded-xl overflow-hidden border border-orange-200 mb-4 shadow-sm">
                      <Map
                        initialViewState={{
                          longitude: Number(formData.longitude),
                          latitude: Number(formData.latitude),
                          zoom: 13
                        }}
                        mapStyle="https://tiles.openfreemap.org/styles/liberty"
                        onClick={handleMapClick}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Marker 
                          longitude={Number(formData.longitude)} 
                          latitude={Number(formData.latitude)} 
                          anchor="bottom"
                        >
                          <div className="bg-orange-600 p-1.5 rounded-full shadow-lg border-2 border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </Marker>
                      </Map>
                   </div>

                   <p className="text-[10px] text-orange-600 font-medium mb-3">Klik pada peta di atas untuk meletakkan pin lokasi barang.</p>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                       <input 
                         required type="number" step="any" name="latitude" value={formData.latitude} readOnly
                         className="w-full px-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed outline-none"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                       <input 
                         required type="number" step="any" name="longitude" value={formData.longitude} readOnly
                         className="w-full px-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed outline-none"
                       />
                     </div>
                   </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="thrift-form"
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center min-w-[120px] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600 hover:shadow-lg'}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              initialData ? 'Simpan Perubahan' : 'Tambah Barang'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThriftForm;
