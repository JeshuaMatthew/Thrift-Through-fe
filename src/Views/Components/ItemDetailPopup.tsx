import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShoppingBag, Sparkles, TrendingUp, Leaf } from "lucide-react";
import type { Item } from "../../Services/ThriftsServices";
import { formatImageUrl } from "../../Utils/FormatUrl";
import { useNavigate } from "react-router-dom";

interface AIInsights {
  predictedMarketPrice: number;
  carbonFootprintSavings: number;
}

interface ItemDetailPopupProps {
  selectedItem: Item | null;
  onClose: () => void;
  footer?: React.ReactNode;
  aiInsights?: AIInsights | null;
  isAILoading?: boolean;
}

const ItemDetailPopup = ({
  selectedItem,
  onClose,
  footer,
  aiInsights,
  isAILoading,
}: ItemDetailPopupProps) => {
  const navigate = useNavigate();

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
            className="bg-bg-vermillion border border-bg-vermillion/50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="relative shrink-0">
              <img
                src={selectedItem.itempicturl.startsWith('data:') ? selectedItem.itempicturl : formatImageUrl(selectedItem.itempicturl)}
                alt={selectedItem.itemname}
                className="w-full h-56 object-cover bg-white/20"
              />
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10">
                {selectedItem.category}
              </span>
              <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-tx-primary text-bg-clean text-xs font-questrial rounded-lg whitespace-nowrap shadow-sm z-10 flex items-center gap-1.5">
                Sisa {selectedItem.itemquantity} unit
              </span>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 text-tx-primary overflow-y-auto custom-scrollbar bg-bg-vermillion flex flex-col">
              <div className="mb-2">
                <h3 className="text-xl font-gasoek leading-tight text-tx-primary mb-3">
                  {selectedItem.itemname}
                </h3>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className={`${selectedItem.transaction_type === 'Barter' ? 'bg-bg-vermillion border-bg-vermillion/50' : 'bg-bg-fresh border-bg-fresh/50'} px-4 py-2 rounded-xl shadow-sm border w-full text-center`}>
                  <p className="text-2xl font-gasoek text-tx-primary">
                    {selectedItem.transaction_type === 'Barter' ? 'BARTER' : `Rp ${selectedItem.itemprice.toLocaleString("id-ID")}`}
                  </p>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="mb-8 bg-tx-primary/95 p-5 rounded-2xl shadow-xl border border-white/10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-linear-to-br from-bg-vermillion/10 to-transparent opacity-50"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-bg-fresh rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-tx-primary" />
                    </div>
                    <h3 className="text-[11px] font-gasoek font-normal tracking-wide text-bg-fresh uppercase">
                      Kata AI
                    </h3>
                  </div>

                  {isAILoading ? (
                    <div className="flex flex-col gap-3">
                      <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                      <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                    </div>
                  ) : (aiInsights || selectedItem.marketprice || selectedItem.ai_carbon_analysis) ? (
                    <div className="flex flex-col gap-4">
                      {/* Market Price Analysis */}
                      {(aiInsights?.predictedMarketPrice || selectedItem.marketprice) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-blue-500/20 rounded-lg shrink-0">
                              <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-gasoek font-normal tracking-wide text-white/50 mb-1 uppercase">
                                Estimasi Pasar
                              </p>
                              <p className="text-xl font-gasoek font-normal tracking-wide text-white">
                                Rp{" "}
                                {(aiInsights?.predictedMarketPrice || parseFloat(selectedItem.marketprice || "0")).toLocaleString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                          </div>
                          {selectedItem.ai_price_analysis_text && (
                            <p className="text-[10px] font-questrial text-white/60 italic border-t border-white/5 pt-2 mt-1">
                              {selectedItem.ai_price_analysis_text}
                            </p>
                          )}
                        </motion.div>
                      )}

                      {/* Carbon Impact Analysis */}
                      {(aiInsights?.carbonFootprintSavings || selectedItem.ai_carbon_analysis) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-bg-fresh/20 rounded-lg shrink-0">
                              <Leaf className="w-5 h-5 text-bg-fresh" />
                            </div>
                            <div>
                              <p className="text-xs font-gasoek font-normal tracking-wide text-white/50 mb-1 uppercase">
                                Eco Impact
                              </p>
                              <p className="text-xl font-gasoek font-normal tracking-wide text-bg-fresh">
                                -{aiInsights?.carbonFootprintSavings || selectedItem.ai_carbon_analysis} kg CO2e
                              </p>
                            </div>
                          </div>
                          {selectedItem.ai_carbon_analysis_text && (
                            <p className="text-[10px] font-questrial text-white/60 italic border-t border-white/5 pt-2 mt-1">
                              {selectedItem.ai_carbon_analysis_text}
                            </p>
                          )}
                        </motion.div>
                      )}
                      
                      {selectedItem.lastupdatedPrice && (
                        <p className="text-[9px] text-white/30 text-right uppercase tracking-tighter">
                          Analisis Terakhir: {new Date(selectedItem.lastupdatedPrice).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 font-questrial py-2 text-center">
                      AI belum memberikan analisis untuk barang ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-xs text-white/80 mb-2 uppercase tracking-wider font-bold">
                  Deskripsi Barang
                </p>
                <p className="text-sm text-tx-primary font-questrial leading-relaxed bg-white/90 p-4 rounded-lg shadow-inner">
                  {selectedItem.itemdescription || "Tidak ada deskripsi."}
                </p>
              </div>

              {footer ? (
                <div className="mt-auto">{footer}</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => {
                      onClose();
                      navigate(`/chats?userId=${selectedItem.userid}`);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
                  >
                    <MessageSquare size={18} />
                    Chat Penjual
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-3.5 bg-tx-primary hover:bg-black text-bg-clean rounded-lg text-sm font-bold font-questrial shadow-md transition-colors">
                    <ShoppingBag size={18} />
                    {selectedItem.transaction_type === 'Barter' ? 'Barter Barang' : 'Beli Barang'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailPopup;
