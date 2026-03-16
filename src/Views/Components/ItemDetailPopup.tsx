import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShoppingBag, Sparkles, TrendingUp, Leaf, RefreshCw } from "lucide-react";
import type { Item } from "../../Services/ThriftsServices";
import { LLMService } from "../../Services/LLMService";
import { formatImageUrl } from "../../Utils/FormatUrl";
import { useNavigate } from "react-router-dom";

interface ItemDetailPopupProps {
  selectedItem: Item | null;
  onClose: () => void;
  footer?: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

const ItemDetailPopup = ({
  selectedItem,
  onClose,
  footer,
  onRefresh,
}: ItemDetailPopupProps) => {
  const navigate = useNavigate();
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isCarbonLoading, setIsCarbonLoading] = useState(false);

  const canGeneratePrice = () => {
    if (!selectedItem?.last_price_analysis) return true;
    try {
      const last = new Date(selectedItem.last_price_analysis);
      const now = new Date();
      return (now.getTime() - last.getTime()) > (7 * 24 * 60 * 60 * 1000);
    } catch (e) {
      return true;
    }
  };

  const canGenerateCarbon = () => {
    if (!selectedItem?.last_carbon_analysis) return true;
    try {
      const last = new Date(selectedItem.last_carbon_analysis);
      const now = new Date();
      return (now.getTime() - last.getTime()) > (7 * 24 * 60 * 60 * 1000);
    } catch (e) {
      return true;
    }
  };

  const handleGeneratePrice = async () => {
    if (!selectedItem) return;
    setIsPriceLoading(true);
    const llmService = new LLMService();
    try {
      const res = await llmService.analyzePrice(selectedItem.itemid);
      if (res.success && onRefresh) await onRefresh();
    } catch (error) {
      console.error("Price AI Generation failed", error);
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleGenerateCarbon = async () => {
    if (!selectedItem) return;
    setIsCarbonLoading(true);
    const llmService = new LLMService();
    try {
      const res = await llmService.analyzeCarbon(selectedItem.itemid);
      if (res.success && onRefresh) await onRefresh();
    } catch (error) {
      console.error("Carbon AI Generation failed", error);
    } finally {
      setIsCarbonLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-bg-vermillion border border-bg-vermillion/50 rounded-lg w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* 1. Bagian Gambar (Fixed/Shrink-0) */}
            <div className="relative shrink-0">
              <img
                src={selectedItem.itempicturl.startsWith('data:') ? selectedItem.itempicturl : formatImageUrl(selectedItem.itempicturl)}
                alt={selectedItem.itemname}
                className="w-full h-56 object-cover bg-white/20"
              />
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm z-10">
                {selectedItem.category}
              </span>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm z-10"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Bagian Konten yang bisa di-scroll (Flex-1 + Overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 bg-bg-vermillion">

              {/* Judul & Info Stok */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-gasoek leading-tight text-tx-primary">
                  {selectedItem.itemname}
                </h3>
                <span className="text-[10px] font-questrial text-tx-primary uppercase">
                  Sisa {selectedItem.itemquantity} unit
                </span>
              </div>

              {/* Harga/Barter */}
              <div className={`${selectedItem.transaction_type === 'Barter' ? 'bg-bg-vermillion/20 border-bg-vermillion/50' : 'bg-bg-fresh border-bg-fresh/50'} px-4 py-3 rounded-xl shadow-sm border text-center`}>
                <p className="text-2xl font-gasoek text-tx-primary">
                  {selectedItem.transaction_type === 'Barter' ? 'BARTER' : `Rp ${Number(selectedItem.itemprice).toLocaleString("id-ID")}`}
                </p>
              </div>

              {/* Kata AI Section */}
              <div className="bg-tx-primary p-5 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-linear-to-br from-bg-vermillion/20 to-transparent opacity-40"></div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-bg-fresh rounded-xl">
                      <Sparkles className="w-4 h-4 text-tx-primary" />
                    </div>
                    <h3 className="text-xs font-questrial text-bg-fresh uppercase">Kata AI</h3>
                  </div>

                  {/* Analisis Harga */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-questrial text-white uppercase">Analisis Harga</span>
                      </div>
                      <button
                        onClick={handleGeneratePrice}
                        disabled={isPriceLoading || !canGeneratePrice()}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${canGeneratePrice() ? "bg-bg-fresh/20 text-bg-fresh hover:bg-bg-fresh/30 cursor-pointer" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isPriceLoading ? "animate-spin" : ""}`} />
                        <span className="text-[9px] font-questrial uppercase">Update</span>
                      </button>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Estimasi Pasar</p>
                          <span className="text-xs font-gasoek text-blue-400">
                             {selectedItem.ai_price_analysis 
                               ? (typeof selectedItem.ai_price_analysis === 'string' ? JSON.parse(selectedItem.ai_price_analysis).suggested_price_range : (selectedItem.ai_price_analysis as any).suggested_price_range)
                               : "-"}
                          </span>
                       </div>
                       <p className="text-sm text-white/80 font-questrial leading-loose italic">
                         "{selectedItem.ai_price_analysis_text || "Belum ada analisis harga."}"
                       </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full"></div>

                  {/* Analisis Karbon */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5 text-bg-fresh" />
                        <span className="text-[10px] font-questrial text-white uppercase">Eco Impact</span>
                      </div>
                      <button
                        onClick={handleGenerateCarbon}
                        disabled={isCarbonLoading || !canGenerateCarbon()}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${canGenerateCarbon() ? "bg-bg-fresh/20 text-bg-fresh hover:bg-bg-fresh/30 cursor-pointer" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isCarbonLoading ? "animate-spin" : ""}`} />
                        <span className="text-[9px] font-questrial uppercase">Update</span>
                      </button>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Karbon Dihemat</p>
                           <span className="text-xs font-gasoek text-bg-fresh">
                              {selectedItem.ai_carbon_analysis
                                ? `${parseFloat(typeof selectedItem.ai_carbon_analysis === 'string' ? JSON.parse(selectedItem.ai_carbon_analysis).carbon_saved_kg : (selectedItem.ai_carbon_analysis as any).carbon_saved_kg)} kg`
                                : "-"}
                           </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Rating Dampak</p>
                          <span className="text-xs font-gasoek text-bg-fresh">
                             {selectedItem.ai_carbon_analysis
                               ? `${typeof selectedItem.ai_carbon_analysis === 'string' ? JSON.parse(selectedItem.ai_carbon_analysis).environmental_impact_rating : (selectedItem.ai_carbon_analysis as any).environmental_impact_rating}/10`
                               : "-"}
                          </span>
                       </div>
                       <p className="text-sm text-white/80 font-questrial leading-loose italic">
                         "{selectedItem.ai_carbon_analysis_text || "Belum ada analisis karbon."}"
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi Barang */}
              <div>
                <p className="text-xs text-tx-primary mb-2 uppercase tracking-wider font-questrial">Deskripsi Barang</p>
                <div className="bg-white/90 p-4 rounded-2xl shadow-inner border border-white/50">
                  <p className="text-sm text-tx-primary font-questrial leading-relaxed">
                    {selectedItem.itemdescription || "Tidak ada deskripsi."}
                  </p>
                </div>
              </div>

              {/* Footer / Tombol (Tetap di dalam scroll agar tidak menutupi konten) */}
              <div className="pt-4 pb-2">
                {footer ? (
                  footer
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/chats?userId=${selectedItem.userid}`);
                      }}
                      className="flex items-center justify-center gap-1.5 py-4 bg-bg-fresh text-tx-primary hover:bg-white rounded-xl text-sm font-bold font-questrial transition-colors shadow-md"
                    >
                      <MessageSquare size={18} />
                      Chat
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-4 bg-tx-primary hover:bg-black text-bg-clean rounded-xl text-sm font-bold font-questrial shadow-md transition-colors">
                      <ShoppingBag size={18} />
                      {selectedItem.transaction_type === 'Barter' ? 'Barter' : 'Beli'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailPopup;